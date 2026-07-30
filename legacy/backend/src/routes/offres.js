const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');
const { creerNotification } = require('./notifications');

const router = express.Router();

// GET /api/offres — Liste publique des offres PUBLIÉES (recherche + filtres)
router.get('/', async (req, res) => {
  try {
    const { search, type, localisation } = req.query;

    const where = { statut: 'PUBLIEE', OR: [{ supprime: false }, { supprime: null }] };

    if (search) {
      where.OR = [
        { titre: { contains: search, mode: 'insensitive' } },
        { exigence: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) where.type = type;
    if (localisation) where.localisation = { contains: localisation, mode: 'insensitive' };

    const offres = await prisma.offre.findMany({
      where,
      include: {
        departement: { select: { id: true, nom: true } },
        _count: { select: { candidatures: true } },
      },
      orderBy: { date_publication: 'desc' },
    });

    res.json(offres);
  } catch (error) {
    console.error('Get offres error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des offres' });
  }
});

// GET /api/offres/rh/toutes — Toutes les offres (RH : brouillons + publiées + fermées)
router.get('/rh/toutes', requireAuth, requirePermission('consulter_offre'), async (_req, res) => {
  try {
    const offres = await prisma.offre.findMany({
      include: {
        departement: { select: { id: true, nom: true } },
        _count: { select: { candidatures: true } },
      },
      orderBy: { date_publication: 'desc' },
    });

    res.json(offres);
  } catch (error) {
    console.error('Get all offres error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des offres' });
  }
});

// GET /api/offres/:id — Détail d'une offre (public si publiée, sinon RH/Admin)
router.get('/:id', async (req, res) => {
  try {
    const offre = await prisma.offre.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        departement: { select: { id: true, nom: true } },
        _count: { select: { candidatures: true } },
      },
    });

    if (!offre || offre.supprime) {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    if (offre.statut !== 'PUBLIEE') {
      return res.status(404).json({ error: 'Offre non trouvée' });
    }

    res.json(offre);
  } catch (error) {
    console.error('Get offre error:', error);
    res.status(500).json({ error: "Erreur lors du chargement de l'offre" });
  }
});

// POST /api/offres — Créer une offre (RH uniquement)
router.post('/', requireAuth, requirePermission('creer_offre'), async (req, res) => {
  try {
    const { titre, type, exigence, localisation, date_limite, id_departement, exigences_fichier, competences } = req.body;

    if (!titre?.trim()) {
      return res.status(400).json({ error: 'Le titre est requis' });
    }
    if (!id_departement) {
      return res.status(400).json({ error: 'Le département est requis' });
    }

    const offre = await prisma.offre.create({
      data: {
        titre: titre.trim(),
        type: type?.trim() || 'CDD',
        exigence: exigence?.trim() || '',
        localisation: localisation?.trim() || '',
        date_limite: date_limite ? new Date(date_limite) : new Date(),
        date_publication: new Date(),
        exigences_fichier: exigences_fichier?.trim() || 'CV',
        competences: competences?.trim() || null,
        statut: 'BROUILLON',
        utilisateurrh_id: parseInt(req.user.id),
        dep_id: parseInt(id_departement),
        supprime: false,
      },
    });

    res.status(201).json(offre);
  } catch (error) {
    console.error('Create offre error:', error);
    res.status(500).json({ error: "Erreur lors de la création de l'offre" });
  }
});

// PUT /api/offres/:id — Modifier une offre (RH uniquement)
router.put('/:id', requireAuth, requirePermission('modifier_offre'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { titre, type, exigence, localisation, date_limite, id_departement, exigences_fichier, competences } = req.body;

    const existing = await prisma.offre.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Offre non trouvée' });

    const data = {};
    if (titre !== undefined) data.titre = titre.trim();
    if (type !== undefined) data.type = type?.trim() || 'CDD';
    if (exigence !== undefined) data.exigence = exigence?.trim() || '';
    if (localisation !== undefined) data.localisation = localisation?.trim() || '';
    if (date_limite !== undefined) data.date_limite = date_limite ? new Date(date_limite) : new Date();
    if (exigences_fichier !== undefined) data.exigences_fichier = exigences_fichier?.trim() || 'CV';
    if (competences !== undefined) data.competences = competences?.trim() || null;
    if (id_departement !== undefined) data.dep_id = parseInt(id_departement);

    const offre = await prisma.offre.update({ where: { id }, data });
    res.json(offre);
  } catch (error) {
    console.error('Update offre error:', error);
    res.status(500).json({ error: "Erreur lors de la modification de l'offre" });
  }
});

// PUT /api/offres/:id/statut — Publier / fermer une offre (RH uniquement)
router.put('/:id/statut', requireAuth, requirePermission('publier_offre'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { statut } = req.body;

    if (!['BROUILLON', 'PUBLIEE', 'FERMEE'].includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide. Valeurs : BROUILLON, PUBLIEE, FERMEE' });
    }

    const data = { statut };
    if (statut === 'PUBLIEE') data.date_publication = new Date();

    const offre = await prisma.offre.update({ where: { id }, data });

    // Notifier tous les candidats quand une offre est publiée
    if (statut === 'PUBLIEE') {
      const candidats = await prisma.utilisateur.findMany({
        where: { type: 'Candidat', supprime: false },
      });

      for (const candidat of candidats) {
        await creerNotification({
          id_utilisateur: candidat.id,
          titre: 'Nouvelle offre publiée 💼',
          contenu: `Une nouvelle offre "${offre.titre}" est disponible. Postulez maintenant !`,
          type: 'offre',
        });
      }
    }

    res.json(offre);
  } catch (error) {
    console.error('Update statut error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// DELETE /api/offres/:id — Supprimer une offre (RH uniquement)
router.delete('/:id', requireAuth, requirePermission('supprimer_offre'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.offre.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Offre non trouvée' });

    await prisma.offre.delete({ where: { id } });
    res.json({ message: 'Offre supprimée avec succès' });
  } catch (error) {
    console.error('Delete offre error:', error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'offre" });
  }
});

module.exports = router;