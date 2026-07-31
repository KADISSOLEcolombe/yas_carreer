const prisma = require('../lib/prisma');
const { verifyToken, getRoleFromUser, sanitizeUser } = require('../lib/crypto');

const JWT_SECRET = process.env.JWT_SECRET || 'yas-career-dev-secret-change-in-production';

function extractToken(req) {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return null;
}

async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  const payload = verifyToken(token, JWT_SECRET);
  if (!payload) {
    return res.status(401).json({ error: 'Session expirée ou invalide' });
  }

  // On récupère l'utilisateur AVEC tous ses profils (relation plusieurs-à-plusieurs)
  // et les droits de chacun de ces profils
  const user = await prisma.utilisateur.findUnique({
    where: { id: payload.id },
    include: {
      utilisateur_profil: {
        include: {
          profil: {
            include: {
              profil_droit: {
                include: { droit: true },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    return res.status(401).json({ error: 'Utilisateur introuvable' });
  }

  // Un compte "supprimé" (supprime = true) est considéré comme désactivé
  if (user.supprime === true) {
    return res.status(403).json({ error: "Ce compte a été désactivé. Contactez l'administrateur." });
  }

  const role = getRoleFromUser(user);

  // Liste des droits de l'utilisateur, cumulés depuis TOUS ses profils, sans doublons
  const droitsSet = new Set();
  for (const up of user.utilisateur_profil || []) {
    for (const pd of up.profil?.profil_droit || []) {
      droitsSet.add(pd.droit.nom);
    }
  }
  const droits = [...droitsSet];

  req.user = sanitizeUser(user, role);
  req.user.droits = droits;

  next();
}

// Vérification par RÔLE (ancien système, on le garde)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    next();
  };
}

// Vérification par DROIT/PERMISSION (nouveau système)
function requirePermission(...permissions) {
  return (req, res, next) => {
    if (!req.user || !req.user.droits) {
      return res.status(403).json({ error: "vous n'avez pas la permission d'excuter cette action" });
    }
    // L'utilisateur doit posséder au moins un des droits demandés
    const aLeDroit = permissions.some((p) => req.user.droits.includes(p));
    if (!aLeDroit) {
      return res.status(403).json({ error: "Vous n'avez pas la permission pour cette action" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole, requirePermission, JWT_SECRET };