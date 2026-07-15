const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, requirePermission } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const path = require('path');

const router = express.Router();

// POST /api/files/upload — Uploader un fichier (CV, lettre de motivation, etc.)
router.post('/upload', requireAuth, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { id_candidature, libelle } = req.body;

    if (!id_candidature) {
      return res.status(400).json({ error: 'id_candidature est requis' });
    }

    // Vérifier que la candidature existe
    const candidature = await prisma.candidature.findUnique({
      where: { id: parseInt(id_candidature) },
    });

    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire de la candidature
    if (candidature.utilisateurcand_id !== parseInt(req.user.id)) {
      return res.status(403).json({ error: 'Vous n\'êtes pas autorisé à uploader des fichiers pour cette candidature' });
    }

    // Créer l'enregistrement du fichier
    const fichier = await prisma.fichier.create({
      data: {
        libelle: libelle || req.file.originalname,
        chemin: req.file.filename,
        extension: path.extname(req.file.originalname).substring(1),
        id_candidature: parseInt(id_candidature),
        supprime: false,
      },
    });

    res.status(201).json({
      id: fichier.id,
      libelle: fichier.libelle,
      chemin: `/uploads/${fichier.chemin}`,
      extension: fichier.extension,
      id_candidature: fichier.id_candidature,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
  }
});

// GET /api/files/candidature/:id — Lister les fichiers d'une candidature
router.get('/candidature/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const candidature = await prisma.candidature.findUnique({
      where: { id },
    });

    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un RH
    if (candidature.utilisateurcand_id !== parseInt(req.user.id) && req.user.role !== 'rh') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const fichiers = await prisma.fichier.findMany({
      where: {
        id_candidature: id,
        supprime: { not: true },
      },
      select: {
        id: true,
        libelle: true,
        chemin: true,
        extension: true,
        id_candidature: true,
      },
    });

    // Transformer les chemins pour inclure l'URL complète
    const fichiersAvecUrl = fichiers.map(f => ({
      ...f,
      chemin: `/uploads/${f.chemin}`,
    }));

    res.json(fichiersAvecUrl);
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des fichiers' });
  }
});

// DELETE /api/files/:id — Supprimer un fichier
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const fichier = await prisma.fichier.findUnique({
      where: { id },
      include: {
        candidature: true,
      },
    });

    if (!fichier) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    // Vérifier que l'utilisateur est le propriétaire ou un RH
    if (fichier.candidature.utilisateurcand_id !== parseInt(req.user.id) && req.user.role !== 'rh') {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    // Soft delete du fichier
    await prisma.fichier.update({
      where: { id },
      data: { supprime: true },
    });

    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

module.exports = router;
