const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');
const { creerNotification } = require('./notifications');
const { sendAffectationEmail } = require('../lib/mail');

const router = express.Router();

router.use(requireAuth);

const INCLUDE_FULL = {
  departement: { select: { id: true, nom: true } },
  candidature: {
    include: {
      utilisateur: { select: { id: true, nom: true, prenom: true, email: true, telephone: true } },
      offre: { select: { id: true, titre: true, type: true } },
    },
  },
  utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
  evaluations: { select: { id: true, utilisateursup_id: true, note: true, statut: true } },
};

async function notifyAffectation(emploi) {
  const candidat = emploi.candidature?.utilisateur;
  const superviseur = emploi.utilisateur;
  const dateDebut = emploi.date_debut
    ? new Date(emploi.date_debut).toLocaleDateString('fr-FR')
    : '';
  const dateFin = emploi.date_fin ? new Date(emploi.date_fin).toLocaleDateString('fr-FR') : '';

  if (superviseur?.id) {
    await creerNotification({
      id_utilisateur: superviseur.id,
      titre: 'Nouvelle affectation à suivre',
      contenu: `${candidat?.prenom || ''} ${candidat?.nom || ''} vous a été affecté(e) — « ${emploi.sujet} » (${dateDebut} → ${dateFin}).`,
      type: 'affectation',
    });
    if (superviseur.email) {
      sendAffectationEmail({
        to: superviseur.email,
        prenom: superviseur.prenom,
        nom: superviseur.nom,
        sujet: emploi.sujet,
        role: 'superviseur',
        dateDebut,
        dateFin,
      }).catch(() => {});
    }
  }

  if (candidat?.id) {
    await creerNotification({
      id_utilisateur: candidat.id,
      titre: 'Affectation confirmée',
      contenu: `Votre affectation « ${emploi.sujet} » a été créée (${dateDebut} → ${dateFin}).`,
      type: 'affectation',
    });
    if (candidat.email) {
      sendAffectationEmail({
        to: candidat.email,
        prenom: candidat.prenom,
        nom: candidat.nom,
        sujet: emploi.sujet,
        role: 'candidat',
        dateDebut,
        dateFin,
      }).catch(() => {});
    }
  }
}

// POST /api/emplois — Le RH crée la période de stage/CDI/CDD d'un candidat accepté
router.post('/', requireRole('RH', 'ADMIN'), async (req, res) => {
  try {
    const { can_id, id_departement, date_debut, date_fin, sujet, lieu, utilisateursup_id } = req.body;

    if (!can_id || !id_departement || !date_debut || !date_fin || !sujet?.trim() || !lieu?.trim()) {
      return res.status(400).json({ error: 'can_id, id_departement, date_debut, date_fin, sujet et lieu sont requis' });
    }

    const candidature = await prisma.candidature.findUnique({ where: { id: parseInt(can_id) } });
    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }
    if (candidature.statut !== 'ACCEPTEE') {
      return res.status(400).json({ error: 'Seule une candidature acceptée peut donner lieu à une affectation' });
    }

    const emploi = await prisma.emploi.create({
      data: {
        can_id: parseInt(can_id),
        id_departement: parseInt(id_departement),
        date_debut: new Date(date_debut),
        date_fin: new Date(date_fin),
        sujet: sujet.trim(),
        lieu: lieu.trim(),
        statut: 'EN_COURS',
        utilisateursup_id: utilisateursup_id ? parseInt(utilisateursup_id) : null,
        supprime: false,
      },
      include: INCLUDE_FULL,
    });

    await notifyAffectation(emploi);

    res.status(201).json(emploi);
  } catch (error) {
    console.error('Create emploi error:', error);
    res.status(500).json({ error: "Erreur lors de la création de l'affectation" });
  }
});

// GET /api/emplois — Toutes les affectations (RH/Admin)
router.get('/', requireRole('RH', 'ADMIN'), async (_req, res) => {
  try {
    const emplois = await prisma.emploi.findMany({
      where: { supprime: { not: true } },
      include: INCLUDE_FULL,
      orderBy: { id: 'desc' },
    });
    res.json(emplois);
  } catch (error) {
    console.error('Get emplois error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des affectations' });
  }
});

// GET /api/emplois/a-evaluer — Stagiaires/employés assignés au superviseur connecté, pas encore évalués par lui
router.get('/a-evaluer', requirePermission('consulter_ses_evaluations'), async (req, res) => {
  try {
    const emplois = await prisma.emploi.findMany({
      where: {
        utilisateursup_id: parseInt(req.user.id),
        supprime: { not: true },
        evaluations: { none: { utilisateursup_id: parseInt(req.user.id), supprime: { not: true } } },
      },
      include: INCLUDE_FULL,
      orderBy: { date_debut: 'desc' },
    });
    res.json(emplois);
  } catch (error) {
    console.error('Get emplois a evaluer error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des affectations à évaluer' });
  }
});

// GET /api/emplois/mes — Tous les emplois du superviseur (suivis)
router.get('/mes', requirePermission('consulter_ses_evaluations'), async (req, res) => {
  try {
    const emplois = await prisma.emploi.findMany({
      where: {
        utilisateursup_id: parseInt(req.user.id),
        supprime: { not: true },
      },
      include: INCLUDE_FULL,
      orderBy: { date_debut: 'desc' },
    });
    res.json(emplois);
  } catch (error) {
    console.error('Get mes emplois error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de vos affectations' });
  }
});

// GET /api/emplois/:id — Détail (RH/Admin ou superviseur assigné)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const emploi = await prisma.emploi.findUnique({
      where: { id },
      include: {
        ...INCLUDE_FULL,
        evaluations: {
          where: { supprime: { not: true } },
          include: {
            utilisateur: { select: { id: true, nom: true, prenom: true } },
          },
        },
      },
    });

    if (!emploi || emploi.supprime) {
      return res.status(404).json({ error: 'Affectation non trouvée' });
    }

    const isRhOrAdmin = ['RH', 'ADMIN'].includes(req.user.role);
    const isSuperviseur = emploi.utilisateursup_id === parseInt(req.user.id);
    if (!isRhOrAdmin && !isSuperviseur) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(emploi);
  } catch (error) {
    console.error('Get emploi error:', error);
    res.status(500).json({ error: "Erreur lors du chargement de l'affectation" });
  }
});

// PUT /api/emplois/:id — Modifier affectation (superviseur, dates, etc.)
router.put('/:id', requireRole('RH', 'ADMIN'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existant = await prisma.emploi.findUnique({ where: { id } });
    if (!existant || existant.supprime) {
      return res.status(404).json({ error: 'Affectation non trouvée' });
    }

    const {
      id_departement,
      date_debut,
      date_fin,
      sujet,
      lieu,
      utilisateursup_id,
      statut,
    } = req.body;

    const data = {};
    if (id_departement !== undefined) data.id_departement = parseInt(id_departement);
    if (date_debut !== undefined) data.date_debut = new Date(date_debut);
    if (date_fin !== undefined) data.date_fin = new Date(date_fin);
    if (sujet !== undefined) data.sujet = String(sujet).trim();
    if (lieu !== undefined) data.lieu = String(lieu).trim();
    if (statut !== undefined) data.statut = String(statut).trim();
    if (utilisateursup_id !== undefined) {
      data.utilisateursup_id = utilisateursup_id ? parseInt(utilisateursup_id) : null;
    }

    const emploi = await prisma.emploi.update({
      where: { id },
      data,
      include: INCLUDE_FULL,
    });

    const superviseurChange =
      utilisateursup_id !== undefined &&
      parseInt(utilisateursup_id || 0) !== (existant.utilisateursup_id || 0);

    if (superviseurChange && emploi.utilisateursup_id) {
      await notifyAffectation(emploi);
    }

    res.json(emploi);
  } catch (error) {
    console.error('Update emploi error:', error);
    res.status(500).json({ error: "Erreur lors de la mise à jour de l'affectation" });
  }
});

module.exports = router;
