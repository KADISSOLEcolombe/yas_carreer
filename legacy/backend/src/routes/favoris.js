const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth, requireRole('CANDIDAT'));

// GET /api/favoris — mes offres favorites
router.get('/', async (req, res) => {
  try {
    const favoris = await prisma.favori.findMany({
      where: { id_utilisateur: parseInt(req.user.id) },
      include: {
        offre: {
          include: {
            departement: { select: { id: true, nom: true } },
            _count: { select: { candidatures: true } },
          },
        },
      },
      orderBy: { date_ajout: 'desc' },
    });

    res.json(favoris);
  } catch (error) {
    console.error('Get favoris error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des favoris' });
  }
});

// POST /api/favoris — ajouter une offre aux favoris
router.post('/', async (req, res) => {
  try {
    const { id_offre } = req.body;
    if (!id_offre) {
      return res.status(400).json({ error: "L'offre est requise" });
    }

    const offre = await prisma.offre.findUnique({ where: { id: parseInt(id_offre) } });
    if (!offre) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    const favori = await prisma.favori.upsert({
      where: {
        id_utilisateur_id_offre: {
          id_utilisateur: parseInt(req.user.id),
          id_offre: parseInt(id_offre),
        },
      },
      update: {},
      create: {
        id_utilisateur: parseInt(req.user.id),
        id_offre: parseInt(id_offre),
      },
    });

    res.status(201).json(favori);
  } catch (error) {
    console.error('Create favori error:', error);
    res.status(500).json({ error: "Erreur lors de l'ajout aux favoris" });
  }
});

// POST /api/favoris/sync — synchronise une liste d'ids d'offres (favoris ajoutés avant connexion)
router.post('/sync', async (req, res) => {
  try {
    const { id_offres } = req.body;
    if (!Array.isArray(id_offres) || id_offres.length === 0) {
      return res.json({ message: 'Rien à synchroniser' });
    }

    const offresValides = await prisma.offre.findMany({
      where: { id: { in: id_offres.map((id) => parseInt(id)) } },
      select: { id: true },
    });

    await Promise.all(
      offresValides.map((offre) =>
        prisma.favori.upsert({
          where: {
            id_utilisateur_id_offre: {
              id_utilisateur: parseInt(req.user.id),
              id_offre: offre.id,
            },
          },
          update: {},
          create: { id_utilisateur: parseInt(req.user.id), id_offre: offre.id },
        })
      )
    );

    res.json({ message: 'Favoris synchronisés' });
  } catch (error) {
    console.error('Sync favoris error:', error);
    res.status(500).json({ error: 'Erreur lors de la synchronisation des favoris' });
  }
});

// DELETE /api/favoris/:id_offre — retirer une offre des favoris
router.delete('/:id_offre', async (req, res) => {
  try {
    const id_offre = parseInt(req.params.id_offre);

    await prisma.favori.deleteMany({
      where: { id_utilisateur: parseInt(req.user.id), id_offre },
    });

    res.json({ message: 'Retiré des favoris' });
  } catch (error) {
    console.error('Delete favori error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du favori' });
  }
});

module.exports = router;
