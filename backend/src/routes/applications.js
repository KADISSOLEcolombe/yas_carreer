const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');
const { creerNotification } = require('./notifications');
const { calculerScore } = require('../lib/matching');

const router = express.Router();

// POST /api/candidatures — Postuler à une offre (Candidat uniquement)
router.post('/', requireAuth, requirePermission('postuler'), async (req, res) => {
  try {
    const { id_offre } = req.body;

    if (!id_offre) {
      return res.status(400).json({ error: "L'offre est requise" });
    }

    const offre = await prisma.offre.findUnique({ where: { id: parseInt(id_offre) } });

    if (!offre) {
      return res.status(404).json({ error: 'Offre non trouvée' });
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

    res.status(201).json(candidature);
  } catch (error) {
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
router.get('/', requireAuth, requirePermission('consulter_candidature'), async (_req, res) => {
  try {
    const candidatures = await prisma.candidature.findMany({
      include: {
        utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        offre: { select: { id: true, titre: true, type: true } },
      },
      orderBy: { date_soumission: 'desc' },
    });

    res.json(candidatures);
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
        utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        offre: { select: { id: true, titre: true, type: true, localisation: true } },
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

    res.json(candidature);
  } catch (error) {
    console.error('Get candidature error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de la candidature' });
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
    const { statut, score } = req.body;

    const valeursAutorisees = ['EN_ATTENTE', 'EN_EXAMEN', 'ENTRETIEN', 'ACCEPTEE', 'REJETEE'];
    if (!valeursAutorisees.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs : EN_ATTENTE, EN_EXAMEN, ENTRETIEN, ACCEPTEE, REJETEE' });
    }

    const existante = await prisma.candidature.findUnique({ where: { id } });
    if (!existante) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }
    const ancienStatut = existante.statut;

    const data = { statut };
    if (score !== undefined) data.score = parseInt(score);

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