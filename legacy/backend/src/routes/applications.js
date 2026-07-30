const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');
const { creerNotification } = require('./notifications');
const { calculerScore, analyserCorrespondance } = require('../lib/matching');
const { sendStatutCandidatureEmail, sendCandidatureConfirmationEmail } = require('../lib/mail');
const { peutChangerStatut } = require('../lib/statutCandidature');

const router = express.Router();

function attachMatching(candidature) {
  const u = candidature.utilisateur || {};
  const o = candidature.offre || {};
  const analyse = analyserCorrespondance({
    competencesCandidat: u.competences,
    competencesOffre: o.competences,
    villeCandidat: u.ville,
    localisationOffre: o.localisation,
  });
  return { ...candidature, matching: analyse };
}

// POST /api/candidatures — Postuler à une offre (Candidat uniquement)
router.post('/', requireAuth, requirePermission('postuler'), async (req, res) => {
  try {
    const { id_offre } = req.body;

    if (!id_offre) {
      return res.status(400).json({ error: "L'offre est requise" });
    }

    const offre = await prisma.offre.findUnique({ where: { id: parseInt(id_offre) } });

    if (!offre || offre.supprime) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (offre.statut !== 'PUBLIEE') {
      return res.status(400).json({ error: "Cette offre n'est pas ouverte aux candidatures" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (offre.date_limite && new Date(offre.date_limite) < today) {
      return res.status(400).json({ error: 'La date limite de candidature est dépassée' });
    }

    // Vérifier si le candidat a déjà postulé à cette offre
    const dejaPostule = await prisma.candidature.findFirst({
      where: {
        id_offre: parseInt(id_offre),
        utilisateurcand_id: parseInt(req.user.id),
      },
    });

    if (dejaPostule) {
      return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre' });
    }

    const score = calculerScore({
      competencesCandidat: req.user.competences,
      competencesOffre: offre.competences,
      villeCandidat: req.user.ville,
      localisationOffre: offre.localisation,
    });

    const candidature = await prisma.candidature.create({
      data: {
        id_offre: parseInt(id_offre),
        utilisateurcand_id: parseInt(req.user.id),
        statut: 'EN_ATTENTE',
        date_soumission: new Date(),
        score,
        supprime: false,
      },
      include: {
        offre: {
          select: { id: true, titre: true, localisation: true, type: true },
        },
      },
    });

    // Trace la création dans l'historique (ancien_statut = null = première étape)
    await prisma.historique_statut.create({
      data: {
        id_candidature: candidature.id,
        ancien_statut: null,
        nouveau_statut: 'EN_ATTENTE',
        id_auteur: parseInt(req.user.id),
      },
    });

    // Notifier tous les RH de la nouvelle candidature
    const rhUsers = await prisma.utilisateur.findMany({
      where: { type: 'RH', supprime: false },
    });

    for (const rh of rhUsers) {
      await creerNotification({
        id_utilisateur: rh.id,
        titre: 'Nouvelle candidature',
        contenu: `${req.user.prenom} ${req.user.nom} a postulé pour le poste de ${offre.titre}`,
        type: 'candidature',
      });
    }

    if (req.user.email) {
      sendCandidatureConfirmationEmail({
        to: req.user.email,
        prenom: req.user.prenom,
        nom: req.user.nom,
        titreOffre: offre.titre,
      }).catch(() => {});
    }

    res.status(201).json(candidature);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre' });
    }
    console.error('Postuler error:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission de la candidature' });
  }
});

// GET /api/candidatures/mes — Mes candidatures (Candidat uniquement)
router.get('/mes', requireAuth, requirePermission('gerer_ses_candidatures'), async (req, res) => {
  try {
    const candidatures = await prisma.candidature.findMany({
      where: { utilisateurcand_id: parseInt(req.user.id) },
      include: {
        offre: {
          select: { id: true, titre: true, localisation: true, type: true },
        },
      },
      orderBy: { date_soumission: 'desc' },
    });

    res.json(candidatures);
  } catch (error) {
    console.error('Mes candidatures error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des candidatures' });
  }
});

// GET /api/candidatures — Toutes les candidatures (RH uniquement)
router.get('/', requireAuth, requirePermission('consulter_candidature'), async (req, res) => {
  try {
    const { statut, minScore, id_offre, sort } = req.query;
    const where = {};
    if (statut) where.statut = String(statut);
    if (id_offre) where.id_offre = parseInt(String(id_offre), 10);
    if (minScore !== undefined && minScore !== '') {
      where.score = { gte: parseInt(String(minScore), 10) };
    }

    const orderBy =
      sort === 'score_asc'
        ? [{ score: 'asc' }, { date_soumission: 'desc' }]
        : sort === 'score_desc'
          ? [{ score: 'desc' }, { date_soumission: 'desc' }]
          : [{ date_soumission: 'desc' }];

    const candidatures = await prisma.candidature.findMany({
      where: { ...where, OR: [{ supprime: false }, { supprime: null }] },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            competences: true,
            ville: true,
          },
        },
        offre: {
          select: {
            id: true,
            titre: true,
            type: true,
            competences: true,
            localisation: true,
          },
        },
      },
      orderBy,
    });

    res.json(candidatures.map(attachMatching));
  } catch (error) {
    console.error('Get candidatures error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des candidatures' });
  }
});

// GET /api/candidatures/:id — Détail (RH ou le candidat concerné)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const candidature = await prisma.candidature.findUnique({
      where: { id },
      include: {
        utilisateur: {
          select: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            telephone: true,
            competences: true,
            ville: true,
            annees_experience: true,
            niveau_etude: true,
            domaine_etudes: true,
            sexe: true,
          },
        },
        offre: {
          select: {
            id: true,
            titre: true,
            type: true,
            localisation: true,
            competences: true,
            exigence: true,
          },
        },
      },
    });

    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    const isOwner = candidature.utilisateurcand_id === parseInt(req.user.id);
    const isRhOrAdmin = ['RH', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isRhOrAdmin) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(attachMatching(candidature));
  } catch (error) {
    console.error('Get candidature error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de la candidature' });
  }
});

// POST /api/candidatures/:id/recalculer-score — Recalcule le score (RH)
router.post('/:id/recalculer-score', requireAuth, requirePermission('changer_statut_candidature'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const candidature = await prisma.candidature.findUnique({
      where: { id },
      include: {
        utilisateur: { select: { competences: true, ville: true } },
        offre: { select: { competences: true, localisation: true } },
      },
    });
    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    const analyse = analyserCorrespondance({
      competencesCandidat: candidature.utilisateur?.competences,
      competencesOffre: candidature.offre?.competences,
      villeCandidat: candidature.utilisateur?.ville,
      localisationOffre: candidature.offre?.localisation,
    });

    const updated = await prisma.candidature.update({
      where: { id },
      data: { score: analyse.score },
      include: {
        utilisateur: {
          select: { id: true, nom: true, prenom: true, email: true, competences: true, ville: true },
        },
        offre: {
          select: { id: true, titre: true, type: true, competences: true, localisation: true },
        },
      },
    });

    res.json(attachMatching(updated));
  } catch (error) {
    console.error('Recalculer score error:', error);
    res.status(500).json({ error: 'Erreur lors du recalcul du score' });
  }
});

// GET /api/candidatures/:id/historique — Historique des changements de statut (RH ou le candidat concerné)
router.get('/:id/historique', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const candidature = await prisma.candidature.findUnique({ where: { id } });
    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    const isOwner = candidature.utilisateurcand_id === parseInt(req.user.id);
    const isRhOrAdmin = ['RH', 'ADMIN'].includes(req.user.role);

    if (!isOwner && !isRhOrAdmin) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    const historique = await prisma.historique_statut.findMany({
      where: { id_candidature: id },
      orderBy: { date_changement: 'asc' },
    });

    res.json(historique);
  } catch (error) {
    console.error('Get historique error:', error);
    res.status(500).json({ error: "Erreur lors du chargement de l'historique" });
  }
});

// PUT /api/candidatures/:id/statut — Changer le statut (RH uniquement)
router.put('/:id/statut', requireAuth, requirePermission('changer_statut_candidature'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut, force } = req.body;

    const valeursAutorisees = ['EN_ATTENTE', 'EN_EXAMEN', 'ENTRETIEN', 'ACCEPTEE', 'REJETEE'];
    if (!valeursAutorisees.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs : EN_ATTENTE, EN_EXAMEN, ENTRETIEN, ACCEPTEE, REJETEE' });
    }

    const existante = await prisma.candidature.findUnique({ where: { id } });
    if (!existante) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }
    const ancienStatut = existante.statut;

    const forceAdmin = force === true && req.user.role === 'ADMIN';
    if (!peutChangerStatut(ancienStatut, statut, { force: forceAdmin })) {
      return res.status(400).json({
        error: `Transition interdite : ${ancienStatut} → ${statut}. Demandez à un admin pour forcer.`,
      });
    }

    const data = { statut };
    // Le score ne se modifie plus via ce endpoint (utiliser recalculer-score)

    const candidature = await prisma.candidature.update({
      where: { id },
      data,
      include: {
        utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        offre: { select: { id: true, titre: true } },
      },
    });

    // Trace la transition dans l'historique, seulement si le statut a réellement changé
    if (ancienStatut !== statut) {
      await prisma.historique_statut.create({
        data: {
          id_candidature: id,
          ancien_statut: ancienStatut,
          nouveau_statut: statut,
          id_auteur: parseInt(req.user.id),
        },
      });
    }

    let titreNotif;
    let contenuNotif;
    if (statut === 'ACCEPTEE') {
      titreNotif = 'Candidature acceptée 🎉';
      contenuNotif = `Félicitations ! Votre candidature pour l'offre "${candidature.offre.titre}" a été acceptée.`;
    } else if (statut === 'REJETEE') {
      titreNotif = 'Candidature non retenue';
      contenuNotif = `Nous vous informons que votre candidature pour l'offre "${candidature.offre.titre}" n'a pas été retenue cette fois-ci. Nous vous remercions pour votre intérêt et vous encourageons à postuler à d'autres offres.`;
    } else if (statut === 'EN_EXAMEN') {
      titreNotif = 'Candidature en cours d\'examen 🔍';
      contenuNotif = `Votre candidature pour l'offre "${candidature.offre.titre}" est en cours d'examen par notre équipe.`;
    } else if (statut === 'ENTRETIEN') {
      titreNotif = 'Entretien planifié 📅';
      contenuNotif = `Votre candidature pour l'offre "${candidature.offre.titre}" est passée à l'étape entretien.`;
    } else {
      titreNotif = 'Mise à jour de votre candidature';
      contenuNotif = `Le statut de votre candidature pour l'offre "${candidature.offre.titre}" a été mis à jour.`;
    }

    await creerNotification({
      id_utilisateur: candidature.utilisateurcand_id,
      titre: titreNotif,
      contenu: contenuNotif,
      type: 'candidature',
    });

    // E-mail candidat (échec SMTP non bloquant)
    if (ancienStatut !== statut && candidature.utilisateur?.email) {
      sendStatutCandidatureEmail({
        to: candidature.utilisateur.email,
        prenom: candidature.utilisateur.prenom,
        nom: candidature.utilisateur.nom,
        titreOffre: candidature.offre?.titre || '',
        statut,
        contenu: contenuNotif,
      }).catch(() => {});
    }

    res.json(candidature);
  } catch (error) {
    console.error('Update statut candidature error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// DELETE /api/candidatures/:id — Retirer sa candidature (Candidat uniquement)
router.delete('/:id', requireAuth, requirePermission('gerer_ses_candidatures'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const candidature = await prisma.candidature.findUnique({ where: { id } });

    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    if (candidature.utilisateurcand_id !== parseInt(req.user.id)) {
      return res.status(403).json({ error: 'Vous ne pouvez retirer que vos propres candidatures' });
    }

    if (candidature.statut !== 'EN_ATTENTE') {
      return res.status(400).json({ error: 'Impossible de retirer une candidature déjà traitée' });
    }

    await prisma.candidature.delete({ where: { id } });
    res.json({ message: 'Candidature retirée avec succès' });
  } catch (error) {
    console.error('Delete candidature error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la candidature' });
  }
});

module.exports = router;