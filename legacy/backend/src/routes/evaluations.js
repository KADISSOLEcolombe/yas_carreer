const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

const INCLUDE_FULL = {
  emploi: {
    include: {
      departement: { select: { id: true, nom: true } },
      candidature: {
        include: {
          utilisateur: { select: { id: true, nom: true, prenom: true, email: true } },
        },
      },
    },
  },
  utilisateur: { select: { id: true, nom: true, prenom: true } },
};

// POST /api/evaluations — Créer une évaluation
router.post('/', requirePermission('creer_evaluation'), async (req, res) => {
  try {
    const { note, fichier_rapport, id_emploi, statut } = req.body;

    if (!fichier_rapport?.trim() || !id_emploi) {
      return res.status(400).json({ error: 'fichier_rapport et id_emploi sont requis' });
    }

    const emploi = await prisma.emploi.findUnique({ where: { id: parseInt(id_emploi) } });
    if (!emploi || emploi.supprime) {
      return res.status(404).json({ error: 'Affectation non trouvée' });
    }
    if (emploi.utilisateursup_id !== parseInt(req.user.id) && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Vous ne pouvez évaluer que les personnes qui vous sont affectées' });
    }

    const deja = await prisma.evaluation.findFirst({
      where: {
        id_emploi: parseInt(id_emploi),
        utilisateursup_id: parseInt(req.user.id),
        OR: [{ supprime: false }, { supprime: null }],
      },
    });
    if (deja) {
      return res.status(400).json({ error: 'Vous avez déjà évalué cette affectation' });
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        note: note !== undefined ? parseInt(note) : null,
        fichier_rapport: fichier_rapport.trim(),
        id_emploi: parseInt(id_emploi),
        utilisateursup_id: parseInt(req.user.id),
        statut: typeof statut === 'boolean' ? statut : false,
        supprime: false,
      },
      include: INCLUDE_FULL,
    });

    res.status(201).json(evaluation);
  } catch (error) {
    console.error('Create evaluation error:', error);
    res.status(500).json({ error: "Erreur lors de la création de l'évaluation" });
  }
});

// GET /api/evaluations — Lister les évaluations du superviseur connecté
router.get('/', requirePermission('consulter_ses_evaluations'), async (req, res) => {
  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        utilisateursup_id: parseInt(req.user.id),
        supprime: { not: true },
      },
      include: INCLUDE_FULL,
      orderBy: { id: 'desc' },
    });
    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des évaluations' });
  }
});

// GET /api/evaluations/:id — Voir une évaluation
router.get('/:id', requirePermission('consulter_ses_evaluations'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const evaluation = await prisma.evaluation.findUnique({ where: { id }, include: INCLUDE_FULL });

    if (!evaluation) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }

    if (evaluation.utilisateursup_id !== parseInt(req.user.id)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }

    res.json(evaluation);
  } catch (error) {
    console.error('Get evaluation error:', error);
    res.status(500).json({ error: "Erreur lors du chargement de l'évaluation" });
  }
});

module.exports = router;
