const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/departements — liste de tous les départements
router.get('/', requireAuth, async (_req, res) => {
  try {
    const departements = await prisma.departement.findMany({
      orderBy: { nom: 'asc' },
    });
    res.json(departements);
  } catch (error) {
    console.error('Get departements error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des départements' });
  }
});

module.exports = router;
