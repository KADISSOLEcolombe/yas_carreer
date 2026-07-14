const express = require('express');
const prisma = require('../lib/prisma');
const { hashPassword, getRoleFromUser, sanitizeUser, getProfilIdFromType } = require('../lib/crypto');
const { requireAuth, requireRole, requirePermission } = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

// Fonction utilitaire : créer un compte avec un rôle donné (RH ou Superviseur)
async function creerCompte(req, res, typeRole, roleLabel) {
  try {
    const { nom, prenom, email, telephone, quartier, password } = req.body;

    if (!nom?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Nom, email et mot de passe sont requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existing = await prisma.utilisateur.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cet email' });
    }

    const user = await prisma.utilisateur.create({
      data: {
        nom: nom.trim(),
        prenom: prenom?.trim() || '',
        email: email.trim().toLowerCase(),
        mot_de_passe: hashPassword(password),
        telephone: telephone?.trim() || '',
        quartier: quartier?.trim() || '',
        type: typeRole,      // le rôle est stocké ici
        supprime: false,     // compte actif
        utilisateur_profil: {
          create: [{ id_profil: getProfilIdFromType(typeRole) }],
        },
      },
    });

    res.status(201).json({ user: sanitizeUser(user, roleLabel) });
  } catch (error) {
    console.error(`Create ${roleLabel} error:`, error);
    res.status(500).json({ error: `Erreur lors de la création du compte ${roleLabel}` });
  }
}

// Créer un compte RH
router.post('/users/rh', requirePermission('creer_compte_rh'), (req, res) => creerCompte(req, res, 'RH', 'RH'));

// Créer un compte Superviseur
router.post('/users/superviseur', requirePermission('creer_compte_superviseur'), (req, res) => creerCompte(req, res, 'Superviseur', 'SUPERVISEUR'));

// Lister tous les utilisateurs
router.get('/users', requirePermission('gerer_utilisateur'), async (_req, res) => {
  try {
    const users = await prisma.utilisateur.findMany({
      orderBy: { id: 'desc' },
    });

    const result = users.map((u) => sanitizeUser(u, getRoleFromUser(u)));
    res.json(result);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des utilisateurs' });
  }
});

// Activer / désactiver un compte (désactiver = marquer comme supprimé)
router.put('/users/:id/statut', requirePermission('desactiver_compte'), async (req, res) => {
  try {
    const { actif } = req.body;
    const id = parseInt(req.params.id);

    if (typeof actif !== 'boolean') {
      return res.status(400).json({ error: 'Le champ actif doit être un booléen' });
    }

    const user = await prisma.utilisateur.update({
      where: { id },
      data: { supprime: !actif },   // actif=true -> supprime=false
    });

    res.json({ user: sanitizeUser(user, getRoleFromUser(user)) });
  } catch (error) {
    console.error('Toggle statut error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// Supprimer un utilisateur (suppression définitive)
router.delete('/users/:id', requirePermission('gerer_utilisateur'), async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    if (id === parseInt(req.user.id)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }

    await prisma.utilisateur.delete({ where: { id } });
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur" });
  }
});

module.exports = router;