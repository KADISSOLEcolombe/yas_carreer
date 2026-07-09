export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ADMIN' | 'SUPERVISOR';

export interface StoredUser {
  id: string;
  nom: string;
  email: string;
  password: string;
  role: UserRole;
  active?: boolean;
}

export interface PublicUser {
  id: string;
  nom: string;
  email: string;
  role: UserRole;
}

const REGISTRY_KEY = 'yas_users_registry';

const SEED_USERS: StoredUser[] = [
  {
    id: 'rh-1',
    nom: 'Responsable RH',
    email: 'rh@yastogo.tg',
    password: 'rh123456',
    role: 'RECRUITER',
    active: true,
  },
  {
    id: 'admin-1',
    nom: 'Administrateur',
    email: 'admin@yastogo.tg',
    password: 'admin123456',
    role: 'ADMIN',
    active: true,
  },
  {
    id: 'sup-1',
    nom: 'Superviseur YAS',
    email: 'superviseur@yastogo.tg',
    password: 'sup123456',
    role: 'SUPERVISOR',
    active: true,
  },
];

function parseRegistry(): StoredUser[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) {
      console.log('parseRegistry: localStorage vide');
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.log('parseRegistry: données invalides (pas un tableau)');
      return [];
    }
    console.log('parseRegistry: registre chargé', parsed.length, 'utilisateurs');
    return parsed;
  } catch (error) {
    console.error('parseRegistry: erreur de parsing', error);
    return [];
  }
}

export function getRegistry(): StoredUser[] {
  if (typeof window === 'undefined') return SEED_USERS;
  initUsersRegistry();
  return parseRegistry();
}

export function saveRegistry(users: StoredUser[]) {
  try {
    localStorage.setItem(REGISTRY_KEY, JSON.stringify(users));
    console.log('saveRegistry: registre sauvegardé', users.length, 'utilisateurs');
  } catch (error) {
    console.error('saveRegistry: erreur de sauvegarde', error);
  }
}

export function initUsersRegistry() {
  if (typeof window === 'undefined') return;

  try {
    const registry = parseRegistry();
    console.log('initUsersRegistry: registre actuel', registry.length, 'utilisateurs');

    for (const seed of SEED_USERS) {
      const index = registry.findIndex(
        (u) => u.email.toLowerCase() === seed.email.toLowerCase()
      );
      if (index === -1) {
        console.log('initUsersRegistry: ajout utilisateur', seed.email);
        registry.push(seed);
      } else {
        console.log('initUsersRegistry: mise à jour utilisateur', seed.email);
        registry[index] = { ...registry[index], ...seed };
      }
    }

    // Ensure all users have active property
    for (const user of registry) {
      if (user.active === undefined) {
        user.active = true;
      }
    }

    saveRegistry(registry);
    console.log('initUsersRegistry: registre sauvegardé', registry.length, 'utilisateurs');
  } catch (error) {
    console.error('initUsersRegistry: erreur', error);
  }
}

export function toPublicUser(user: StoredUser): PublicUser {
  return { id: user.id, nom: user.nom, email: user.email, role: user.role };
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getRegistry().find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function registerCandidate(nom: string, email: string, password: string): PublicUser {
  initUsersRegistry();
  const normalizedEmail = email.trim().toLowerCase();

  if (SEED_USERS.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Cet email est réservé au personnel YAS Togo');
  }

  const registry = getRegistry();

  if (registry.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error('Cet email est déjà utilisé');
  }

  const newUser: StoredUser = {
    id: Math.random().toString(36).substr(2, 9),
    nom: nom.trim(),
    email: normalizedEmail,
    password: password.trim(),
    role: 'CANDIDATE',
    active: true,
  };

  registry.push(newUser);
  saveRegistry(registry);
  return toPublicUser(newUser);
}

export function authenticateUser(
  email: string,
  password: string,
  allowedRoles: UserRole[]
): PublicUser {
  initUsersRegistry();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();
  
  console.log('authenticateUser: tentative de connexion', {
    email: normalizedEmail,
    passwordLength: normalizedPassword.length,
    allowedRoles
  });

  const user = findUserByEmail(normalizedEmail);
  console.log('authenticateUser: utilisateur trouvé', user ? user.email : 'non');

  if (!user) {
    console.log('authenticateUser: utilisateur non trouvé');
    throw new Error('Identifiants invalides');
  }

  if (user.password !== normalizedPassword) {
    console.log('authenticateUser: mot de passe incorrect');
    throw new Error('Identifiants invalides');
  }

  if (user.active === false) {
    console.log('authenticateUser: compte désactivé');
    throw new Error('Ce compte a été désactivé. Contactez l\'administrateur.');
  }

  if (!allowedRoles.includes(user.role)) {
    console.log('authenticateUser: rôle non autorisé', user.role, allowedRoles);
    if (user.role === 'RECRUITER' || user.role === 'ADMIN') {
      throw new Error('Utilisez l\'espace RH pour vous connecter');
    }
    if (user.role === 'SUPERVISOR') {
      throw new Error('Utilisez l\'espace superviseur pour vous connecter');
    }
    throw new Error('Ce compte n\'a pas accès à l\'espace RH');
  }

  console.log('authenticateUser: connexion réussie', user.email, user.role);
  return toPublicUser(user);
}

export function resetUsersRegistry(): void {
  if (typeof window === 'undefined') return;
  console.log('resetUsersRegistry: réinitialisation forcée aux utilisateurs par défaut');
  localStorage.removeItem(REGISTRY_KEY);
  initUsersRegistry();
}
