const crypto = require('crypto');

const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const hashVerify = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(hashVerify, 'hex'));
}

function createToken(user, secret) {
  const payload = Buffer.from(
    JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString('base64url');

  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !token.includes('.')) return null;

  const [payload, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig !== expected) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

// Le rôle est stocké dans la colonne "type" de la table utilisateur.
// On normalise vers des valeurs constantes : ADMIN, RH, SUPERVISEUR, CANDIDAT.
function getRoleFromUser(user) {
  if (!user || !user.type) return null;
  const t = user.type.trim().toUpperCase();
  if (t.startsWith('ADMIN')) return 'ADMIN';
  if (t === 'RH') return 'RH';
  if (t.startsWith('SUPERV')) return 'SUPERVISEUR';
  if (t.startsWith('CAND')) return 'CANDIDAT';
  return t; // au cas où : renvoie le type tel quel, en majuscules
}

function sanitizeUser(user, role) {
  return {
    id: String(user.id),
    nom: user.nom,
    prenom: user.prenom || '',
    email: user.email,
    telephone: user.telephone || '',
    quartier: user.quartier || '',
    role: role,
    type: user.type,
    active: !user.supprime, // actif = non supprimé
    sexe: user.sexe || null,
    ville: user.ville || null,
    annees_experience: user.annees_experience ?? null,
    niveau_etude: user.niveau_etude || null,
    domaine_etudes: user.domaine_etudes || null,
  };
}

// Correspondance entre le type (rôle principal) d'un utilisateur et son id_profil.
const TYPE_TO_PROFIL_ID = {
  Administrateur: 7,
  'Responsable RH': 8,
  RH: 9,
  Superviseur: 10,
  Candidat: 11,
};

// Donne l'id_profil correspondant à un type d'utilisateur, ou null si inconnu.
function getProfilIdFromType(type) {
  return TYPE_TO_PROFIL_ID[type] ?? null;
}

module.exports = {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getRoleFromUser,
  sanitizeUser,
  getProfilIdFromType,
};