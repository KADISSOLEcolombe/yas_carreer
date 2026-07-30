const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');
const { creerNotification } = require('./notifications');
const { sendEntretienEmail, sendStatutCandidatureEmail } = require('../lib/mail');

// Passe une candidature au statut ENTRETIEN, sauf si elle est déjà décidée (acceptée/refusée)
async function passerCandidatureEnEntretien(id_candidature, id_auteur) {
  const candidature = await prisma.candidature.findUnique({ where: { id: id_candidature } });
  if (!candidature || ['ACCEPTEE', 'REJETEE', 'ENTRETIEN'].includes(candidature.statut)) {
    return;
  }

  await prisma.candidature.update({
    where: { id: id_candidature },
    data: { statut: 'ENTRETIEN' },
  });

  await prisma.historique_statut.create({
    data: {
      id_candidature,
      ancien_statut: candidature.statut,
      nouveau_statut: 'ENTRETIEN',
      id_auteur,
    },
  });
}

const router = express.Router();

router.use(requireAuth);

const INCLUDE_FULL = {
  candidature: {
    include: {
      utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
      offre: { select: { id: true, titre: true } },
    },
  },
  utilisateur_entretien_utilisateurrh_idToutilisateur: {
    select: { id: true, nom: true, prenom: true },
  },
  utilisateur_entretien_utilisateursup_idToutilisateur: {
    select: { id: true, nom: true, prenom: true },
  },
};

// POST /api/entretiens — Créer un entretien
router.post('/', requirePermission('planifier_entretien'), async (req, res) => {
  try {
    const {
      date,
      type,
      statut,
      commentaire,
      id_candidature,
      utilisateursup_id,
      lien_meeting,
      plateforme,
      duree,
    } = req.body;

    if (!date || !type || !id_candidature) {
      return res.status(400).json({ error: 'Date, type et id_candidature sont requis' });
    }

    if (!['presentiel', 'visio'].includes(type)) {
      return res.status(400).json({ error: "Type invalide. Valeurs acceptées : 'presentiel', 'visio'" });
    }

    if (type === 'visio' && !lien_meeting?.trim()) {
      return res.status(400).json({ error: 'lien_meeting est requis pour un entretien visio' });
    }

    const candidatureCible = await prisma.candidature.findUnique({
      where: { id: parseInt(id_candidature) },
    });
    if (!candidatureCible || candidatureCible.supprime) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }
    if (['REJETEE'].includes(candidatureCible.statut)) {
      return res.status(400).json({ error: 'Impossible de planifier un entretien pour une candidature rejetée' });
    }

    const data = {
      date: new Date(date),
      type,
      statut: statut?.trim() || 'PLANIFIE',
      commentaire: commentaire?.trim() || null,
      id_candidature: parseInt(id_candidature),
      utilisateurrh_id: parseInt(req.user.id),
      supprime: false,
    };

    if (utilisateursup_id) data.utilisateursup_id = parseInt(utilisateursup_id);

    if (type === 'visio') {
      data.lien_meeting = lien_meeting.trim();
      data.plateforme = plateforme?.trim() || null;
      data.duree = duree ? parseInt(duree) : null;
    }

    const entretien = await prisma.entretien.create({ data, include: INCLUDE_FULL });

    // Fait passer la candidature au statut ENTRETIEN (sauf si déjà acceptée/refusée)
    await passerCandidatureEnEntretien(parseInt(id_candidature), parseInt(req.user.id));

    // Notifier le candidat de l'entretien planifié
    const dateEntretien = new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    await creerNotification({
      id_utilisateur: entretien.candidature.utilisateur.id,
      titre: 'Entretien planifié 📅',
      contenu: `Un entretien est planifié pour le poste "${entretien.candidature.offre.titre}" le ${dateEntretien}. Type : ${type === 'visio' ? 'Visioconférence' : 'Présentiel'}.`,
      type: 'entretien',
    });

    const contenuMail = `Un entretien est planifié pour le poste "${entretien.candidature.offre.titre}" le ${dateEntretien}. Type : ${type === 'visio' ? 'Visioconférence' : 'Présentiel'}.`;
    if (entretien.candidature.utilisateur.email) {
      sendEntretienEmail({
        to: entretien.candidature.utilisateur.email,
        prenom: entretien.candidature.utilisateur.prenom,
        nom: entretien.candidature.utilisateur.nom,
        titreOffre: entretien.candidature.offre.titre,
        dateLabel: dateEntretien,
        typeLabel: type === 'visio' ? 'Visioconférence' : 'Présentiel',
        subject: `YAS Togo — Entretien planifié : ${entretien.candidature.offre.titre}`,
        contenu: contenuMail,
        lienMeeting: entretien.lien_meeting || data.lien_meeting || null,
        plateforme: entretien.plateforme || data.plateforme || null,
      }).catch(() => {});
      sendStatutCandidatureEmail({
        to: entretien.candidature.utilisateur.email,
        prenom: entretien.candidature.utilisateur.prenom,
        nom: entretien.candidature.utilisateur.nom,
        titreOffre: entretien.candidature.offre.titre,
        statut: 'ENTRETIEN',
        contenu: `Votre candidature pour l'offre "${entretien.candidature.offre.titre}" est passée à l'étape entretien.`,
      }).catch(() => {});
    }

    res.status(201).json(entretien);
  } catch (error) {
    console.error('Create entretien error:', error);
    res.status(500).json({ error: "Erreur lors de la création de l'entretien" });
  }
});

// GET /api/entretiens — Lister les entretiens (RH / Admin uniquement)
router.get('/', requireRole('RH', 'ADMIN'), async (_req, res) => {
  try {
    const entretiens = await prisma.entretien.findMany({
      where: { supprime: { not: true } },
      include: INCLUDE_FULL,
      orderBy: { date: 'desc' },
    });
    res.json(entretiens);
  } catch (error) {
    console.error('Get entretiens error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des entretiens' });
  }
});

// GET /api/entretiens/mes — Entretiens assignés au superviseur connecté
router.get('/mes', requirePermission('consulter_entretien'), async (req, res) => {
  try {
    if (!['SUPERVISEUR', 'RH', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    const entretiens = await prisma.entretien.findMany({
      where: { utilisateursup_id: parseInt(req.user.id), supprime: { not: true } },
      include: INCLUDE_FULL,
      orderBy: { date: 'desc' },
    });
    res.json(entretiens);
  } catch (error) {
    console.error('Get mes entretiens error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de vos entretiens' });
  }
});

// GET /api/entretiens/candidat — Entretiens du candidat connecté uniquement
router.get('/candidat', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'CANDIDAT' && !['RH', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    const entretiens = await prisma.entretien.findMany({
      where: {
        supprime: { not: true },
        candidature: { utilisateurcand_id: parseInt(req.user.id) },
      },
      include: INCLUDE_FULL,
      orderBy: { date: 'desc' },
    });
    res.json(entretiens);
  } catch (error) {
    console.error('Get entretiens candidat error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de vos entretiens' });
  }
});

// GET /api/entretiens/:id — Détail (owner candidat, RH, admin, ou superviseur assigné)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const entretien = await prisma.entretien.findUnique({ where: { id }, include: INCLUDE_FULL });

    if (!entretien || entretien.supprime) {
      return res.status(404).json({ error: 'Entretien non trouvé' });
    }

    const uid = parseInt(req.user.id);
    const isRhOrAdmin = ['RH', 'ADMIN'].includes(req.user.role);
    const isSuperviseur = entretien.utilisateursup_id === uid;
    const isCandidatOwner = entretien.candidature?.utilisateurcand_id === uid
      || entretien.candidature?.utilisateur?.id === uid;

    if (!isRhOrAdmin && !isSuperviseur && !isCandidatOwner) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(entretien);
  } catch (error) {
    console.error('Get entretien error:', error);
    res.status(500).json({ error: "Erreur lors du chargement de l'entretien" });
  }
});

// PUT /api/entretiens/:id — Modifier un entretien
router.put('/:id', requirePermission('modifier_entretien'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const {
      date,
      type,
      statut,
      commentaire,
      utilisateursup_id,
      lien_meeting,
      plateforme,
      duree,
    } = req.body;

    const existing = await prisma.entretien.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Entretien non trouvé' });
    if (existing.supprime) return res.status(400).json({ error: 'Cet entretien est annulé' });

    const newType = type !== undefined ? type : existing.type;

    if (type !== undefined && !['presentiel', 'visio'].includes(type)) {
      return res.status(400).json({ error: "Type invalide. Valeurs acceptées : 'presentiel', 'visio'" });
    }

    const data = {};
    if (date !== undefined) data.date = new Date(date);
    if (type !== undefined) data.type = type;
    if (statut !== undefined) data.statut = statut;
    if (commentaire !== undefined) data.commentaire = commentaire?.trim() || null;
    if (utilisateursup_id !== undefined) {
      data.utilisateursup_id = utilisateursup_id ? parseInt(utilisateursup_id) : null;
    }

    if (newType === 'visio') {
      if (lien_meeting !== undefined) data.lien_meeting = lien_meeting?.trim() || null;
      if (plateforme !== undefined) data.plateforme = plateforme?.trim() || null;
      if (duree !== undefined) data.duree = duree ? parseInt(duree) : null;
    } else if (type === 'presentiel') {
      data.lien_meeting = null;
      data.plateforme = null;
      data.duree = null;
    }

    const entretien = await prisma.entretien.update({ where: { id }, data, include: INCLUDE_FULL });

    // Notifier le candidat si le statut change
    if (statut !== undefined && statut !== existing.statut) {
      if (statut === 'TERMINE') {
        await creerNotification({
          id_utilisateur: entretien.candidature.utilisateur.id,
          titre: 'Entretien terminé ✅',
          contenu: `Votre entretien pour le poste "${entretien.candidature.offre.titre}" est terminé. Vous serez informé de la suite.`,
          type: 'entretien',
        });
      } else if (statut === 'ANNULE') {
        await creerNotification({
          id_utilisateur: entretien.candidature.utilisateur.id,
          titre: 'Entretien annulé ❌',
          contenu: `L'entretien pour le poste "${entretien.candidature.offre.titre}" a été annulé.`,
          type: 'entretien',
        });
      }
    }

    res.json(entretien);
  } catch (error) {
    console.error('Update entretien error:', error);
    res.status(500).json({ error: "Erreur lors de la modification de l'entretien" });
  }
});

// DELETE /api/entretiens/:id — Annuler un entretien (soft delete)
router.delete('/:id', requirePermission('annuler_entretien'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.entretien.findUnique({ where: { id } });

    if (!existing) return res.status(404).json({ error: 'Entretien non trouvé' });
    if (existing.supprime) return res.status(400).json({ error: 'Entretien déjà annulé' });

    await prisma.entretien.update({
      where: { id },
      data: { supprime: true, statut: 'ANNULE' },
    });

    res.json({ message: 'Entretien annulé avec succès' });
  } catch (error) {
    console.error('Annuler entretien error:', error);
    res.status(500).json({ error: "Erreur lors de l'annulation de l'entretien" });
  }
});

module.exports = router;
