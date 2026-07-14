const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Statistiques du tableau de bord RH
router.get('/stats', requirePermission('voir_statistique'), async (_req, res) => {
  try {
    const [offresCount, candidaturesCount, enAttenteCount, candidatsCount] = await Promise.all([
      prisma.offre.count(),
      prisma.candidature.count(),
      prisma.candidature.count({ where: { statut: 'EN_ATTENTE' } }),
      prisma.utilisateur.count({ where: { type: 'Candidat' } }),
    ]);

    res.json({
      offresCount,
      candidaturesCount,
      enAttenteCount,
      candidatsCount,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques' });
  }
});

// Toutes les candidatures avec le candidat et l'offre
router.get('/candidatures', requirePermission('consulter_candidature'), async (_req, res) => {
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
    console.error('Candidatures error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des candidatures' });
  }
});

// Toutes les offres avec le nombre de candidatures
router.get('/offres', requirePermission('consulter_offre'), async (_req, res) => {
  try {
    const offres = await prisma.offre.findMany({
      orderBy: { date_publication: 'desc' },
      include: { _count: { select: { candidatures: true } } },
    });
    res.json(offres);
  } catch (error) {
    console.error('Offres error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des offres' });
  }
});

module.exports = router;