const express = require('express');
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Fonction interne réutilisable : créer une notification
// (on l'appellera depuis les autres modules : candidatures, entretiens...)
async function creerNotification({ id_utilisateur, titre, contenu, type }) {
  try {
    return await prisma.notification.create({
      data: {
        id_utilisateur,
        titre,
        contenu,
        type: type || null,
        lu: false,
        supprime: false,
      },
    });
  } catch (error) {
    console.error('Erreur création notification:', error);
    // On ne bloque pas l'action principale si la notif échoue
    return null;
  }
}

// GET /api/notifications — mes notifications (toutes, les plus récentes d'abord)
router.get('/', requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        id_utilisateur: parseInt(req.user.id),
        supprime: false,
      },
      orderBy: { date_envoi: 'desc' },
    });
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des notifications' });
  }
});

// GET /api/notifications/non-lues — mes notifications non lues (pour le badge de la cloche)
router.get('/non-lues', requireAuth, async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        id_utilisateur: parseInt(req.user.id),
        lu: false,
        supprime: false,
      },
      orderBy: { date_envoi: 'desc' },
    });
    res.json({ count: notifications.length, notifications });
  } catch (error) {
    console.error('Get non-lues error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des notifications' });
  }
});

// PUT /api/notifications/:id/lu — marquer une notification comme lue
router.put('/:id/lu', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Vérifier que la notification appartient bien à l'utilisateur
    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.id_utilisateur !== parseInt(req.user.id)) {
      return res.status(404).json({ error: 'Notification introuvable' });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { lu: true },
    });
    res.json(updated);
  } catch (error) {
    console.error('Marquer lu error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// PUT /api/notifications/tout-lu — marquer toutes mes notifications comme lues
router.put('/tout-lu', requireAuth, async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: {
        id_utilisateur: parseInt(req.user.id),
        lu: false,
      },
      data: { lu: true },
    });
    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Tout lu error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour' });
  }
});

// DELETE /api/notifications/:id — supprimer une notification
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const notif = await prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.id_utilisateur !== parseInt(req.user.id)) {
      return res.status(404).json({ error: 'Notification introuvable' });
    }

    await prisma.notification.delete({ where: { id } });
    res.json({ message: 'Notification supprimée' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
});

// On exporte le router ET la fonction creerNotification (pour l'utiliser ailleurs)
module.exports = router;
module.exports.creerNotification = creerNotification;
