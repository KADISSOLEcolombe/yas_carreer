const express = require('express');
const prisma = require('../lib/prisma');
const {
  hashPassword,
  verifyPassword,
  createToken,
  getRoleFromUser,
  sanitizeUser,
  getProfilIdFromType,
} = require('../lib/crypto');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');
const { sendWelcomeEmail } = require('../lib/mail');

const router = express.Router();

// Inscription publique — crée un candidat uniquement
router.post('/register', async (req, res) => {
  try {
    const { nom, email, password, prenom, telephone, quartier } = req.body;

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
        type: 'Candidat',   // inscription publique = candidat
        supprime: false,
        utilisateur_profil: {
          create: [{ id_profil: getProfilIdFromType('Candidat') }],
        },
      },
    });

    const role = getRoleFromUser(user);
    const token = createToken({ id: user.id, email: user.email, role }, JWT_SECRET);

    sendWelcomeEmail({
      to: user.email,
      prenom: user.prenom,
      nom: user.nom,
    }).catch(() => {});

    res.status(201).json({ user: sanitizeUser(user, role), token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: "Erreur lors de l'inscription" });
  }
});

// Connexion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const user = await prisma.utilisateur.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user || !user.mot_de_passe || !verifyPassword(password, user.mot_de_passe)) {
      return res.status(401).json({ error: 'Identifiants invalides' });
    }

    if (user.supprime === true) {
      return res.status(403).json({ error: "Ce compte a été désactivé. Contactez l'administrateur." });
    }

    const role = getRoleFromUser(user);
    const token = createToken({ id: user.id, email: user.email, role }, JWT_SECRET);

    res.json({ user: sanitizeUser(user, role), token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Profil de l'utilisateur connecté
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Mise à jour du profil
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { nom, password, prenom, telephone, quartier, sexe, ville, annees_experience, niveau_etude, domaine_etudes, competences } = req.body;
    const userId = parseInt(req.user.id);

    const data = {};
    if (nom?.trim()) data.nom = nom.trim();
    if (prenom !== undefined) data.prenom = prenom?.trim() || '';
    if (telephone !== undefined) data.telephone = telephone?.trim() || '';
    if (quartier !== undefined) data.quartier = quartier?.trim() || '';
    if (sexe !== undefined) data.sexe = sexe?.trim() || null;
    if (ville !== undefined) data.ville = ville?.trim() || null;
    if (annees_experience !== undefined) data.annees_experience = annees_experience === null || annees_experience === '' ? null : parseInt(annees_experience);
    if (niveau_etude !== undefined) data.niveau_etude = niveau_etude?.trim() || null;
    if (domaine_etudes !== undefined) data.domaine_etudes = domaine_etudes?.trim() || null;
    if (competences !== undefined) data.competences = competences?.trim() || null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
      }
      data.mot_de_passe = hashPassword(password);
    }

    if (Object.keys(data).length > 0) {
      await prisma.utilisateur.update({ where: { id: userId }, data });
    }

    const updated = await prisma.utilisateur.findUnique({ where: { id: userId } });
    const role = getRoleFromUser(updated);
    res.json({ user: sanitizeUser(updated, role) });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

module.exports = router;