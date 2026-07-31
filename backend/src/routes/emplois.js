const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const INCLUDE_FULL = {
  departement: { select: { id: true, nom: true } },
  candidature: {
    include: {
      utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
      offre: { select: { id: true, titre: true, type: true } },
    },
  },
  utilisateur: { select: { id: true, nom: true, prenom: true } },
  evaluations: { select: { id: true, utilisateursup_id: true } },
};

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

module.exports = router;
