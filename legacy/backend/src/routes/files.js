const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');
const { verifyToken } = require('../lib/crypto');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const uploadDir = path.join(__dirname, '../../uploads');

function publicFileUrl(fichier) {
  return `/api/files/${fichier.id}/content`;
}

async function resolveUserFromReq(req) {
  if (req.user) return req.user;
  const header = req.headers.authorization;
  const qToken = typeof req.query.token === 'string' ? req.query.token : null;
  const raw = header?.startsWith('Bearer ') ? header.slice(7) : qToken;
  if (!raw) return null;
  const payload = verifyToken(raw, JWT_SECRET);
  if (!payload?.id) return null;
  const user = await prisma.utilisateur.findUnique({ where: { id: payload.id } });
  if (!user || user.supprime) return null;
  const { getRoleFromUser, sanitizeUser } = require('../lib/crypto');
  return sanitizeUser(user, getRoleFromUser(user));
}

async function canAccessFichier(user, fichier) {
  if (!user) return false;
  if (['RH', 'ADMIN'].includes(user.role)) return true;
  const uid = parseInt(user.id);
  if (fichier.id_utilisateur === uid) return true;
  if (fichier.candidature?.utilisateurcand_id === uid) return true;
  return false;
}

// POST /api/files/upload
router.post('/upload', requireAuth, uploadSingle('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const { id_candidature, libelle } = req.body;
    const data = {
      libelle: libelle || req.file.originalname,
      chemin: req.file.filename,
      extension: path.extname(req.file.originalname).substring(1),
      supprime: false,
    };

    if (id_candidature) {
      const candidature = await prisma.candidature.findUnique({
        where: { id: parseInt(id_candidature) },
      });

      if (!candidature) {
        return res.status(404).json({ error: 'Candidature non trouvée' });
      }

      if (candidature.utilisateurcand_id !== parseInt(req.user.id)) {
        return res.status(403).json({ error: "Vous n'êtes pas autorisé à uploader des fichiers pour cette candidature" });
      }

      data.id_candidature = parseInt(id_candidature);
    } else {
      data.id_utilisateur = parseInt(req.user.id);
    }

    const fichier = await prisma.fichier.create({ data });

    res.status(201).json({
      id: fichier.id,
      libelle: fichier.libelle,
      chemin: publicFileUrl(fichier),
      extension: fichier.extension,
      id_candidature: fichier.id_candidature,
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ error: "Erreur lors de l'upload du fichier" });
  }
});

// GET /api/files/mes
router.get('/mes', requireAuth, async (req, res) => {
  try {
    const fichiers = await prisma.fichier.findMany({
      where: {
        id_utilisateur: parseInt(req.user.id),
        OR: [{ supprime: false }, { supprime: null }],
      },
      select: { id: true, libelle: true, chemin: true, extension: true },
      orderBy: { id: 'desc' },
    });

    res.json(fichiers.map((f) => ({ ...f, chemin: publicFileUrl(f) })));
  } catch (error) {
    console.error('Get mes fichiers error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement de vos documents' });
  }
});

// GET /api/files/candidature/:id
router.get('/candidature/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const candidature = await prisma.candidature.findUnique({ where: { id } });

    if (!candidature) {
      return res.status(404).json({ error: 'Candidature non trouvée' });
    }

    if (candidature.utilisateurcand_id !== parseInt(req.user.id) && !['RH', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const fichiers = await prisma.fichier.findMany({
      where: {
        id_candidature: id,
        OR: [{ supprime: false }, { supprime: null }],
      },
      select: { id: true, libelle: true, chemin: true, extension: true, id_candidature: true },
    });

    res.json(fichiers.map((f) => ({ ...f, chemin: publicFileUrl(f) })));
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des fichiers' });
  }
});

// GET /api/files/:id/content — Téléchargement protégé (Bearer ou ?token=)
router.get('/:id/content', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const user = await resolveUserFromReq(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    const fichier = await prisma.fichier.findUnique({
      where: { id },
      include: { candidature: true },
    });

    if (!fichier || fichier.supprime) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    if (!(await canAccessFichier(user, fichier))) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    const filename = path.basename(fichier.chemin);
    const abs = path.join(uploadDir, filename);
    if (!fs.existsSync(abs)) {
      return res.status(404).json({ error: 'Fichier absent du disque' });
    }

    res.download(abs, `${fichier.libelle || 'document'}.${fichier.extension || 'bin'}`);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement' });
  }
});

// DELETE /api/files/:id
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fichier = await prisma.fichier.findUnique({
      where: { id },
      include: { candidature: true },
    });

    if (!fichier) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    const estProprietaire =
      fichier.id_utilisateur === parseInt(req.user.id) ||
      fichier.candidature?.utilisateurcand_id === parseInt(req.user.id);

    if (!estProprietaire && !['RH', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Non autorisé' });
    }

    await prisma.fichier.update({ where: { id }, data: { supprime: true } });
    res.json({ message: 'Fichier supprimé avec succès' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
  }
});

module.exports = router;
