# YAS Career Backend

Backend API pour l'application YAS Career avec Express, Prisma et PostgreSQL.

## Configuration

### Prérequis
- Node.js (v18 ou supérieur)
- PostgreSQL (v12 ou supérieur)

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos configurations :
```env
DATABASE_URL="postgresql://user:password@localhost:5432/yas_career?schema=public"
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

3. Générer le client Prisma :
```bash
npm run db:generate
```

4. Exécuter les migrations :
```bash
npm run db:migrate
```

5. Peupler la base de données :
```bash
npm run db:seed
```

### Démarrage

En mode développement :
```bash
npm run dev
```

En production :
```bash
npm start
```

L'API sera accessible sur `http://localhost:3001`

## API Endpoints

### Authentification (`/api/auth`)
- `POST /api/auth/register` - Inscription candidat
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir le profil utilisateur (authentifié)

### Offres d'emploi (`/api/offers`)
- `GET /api/offers` - Lister toutes les offres actives (public)
- `GET /api/offers/:id` - Obtenir une offre par ID (public)
- `POST /api/offers` - Créer une offre (RH/Admin)
- `PUT /api/offers/:id` - Modifier une offre (RH/Admin)
- `DELETE /api/offers/:id` - Supprimer une offre (RH/Admin)
- `GET /api/offers/admin/all` - Lister toutes les offres (incluant inactives) (RH/Admin)

### Candidatures (`/api/applications`)
- `POST /api/applications` - Soumettre une candidature (Candidat)
- `GET /api/applications/my` - Lister mes candidatures (Candidat)
- `GET /api/applications` - Lister toutes les candidatures (RH/Admin)
- `PUT /api/applications/:id/status` - Modifier le statut d'une candidature (RH/Admin)
- `DELETE /api/applications/:id` - Supprimer une candidature (Candidat, propre candidature)

### RH (`/api/rh`)
- `GET /api/rh/stats` - Statistiques RH (RH/Admin)
- `GET /api/rh/applications` - Lister les candidatures (RH/Admin)
- `GET /api/rh/offers` - Lister les offres (RH/Admin)

### Admin (`/api/admin`)
- `GET /api/admin/dashboard` - Tableau de bord admin (Admin)
- `GET /api/admin/users` - Lister tous les utilisateurs avec stats (Admin)
- `PUT /api/admin/users/:id/role` - Modifier le rôle d'un utilisateur (Admin)
- `PUT /api/admin/users/:id/status` - Activer/désactiver un compte (Admin)
- `DELETE /api/admin/users/:id` - Supprimer un utilisateur (Admin)

## Comptes par défaut

Après le seed, les comptes suivants sont créés :

### RH
- Email : `rh@yastogo.tg`
- Mot de passe : `rh123456`
- Rôle : RECRUITER

### Admin
- Email : `admin@yastogo.tg`
- Mot de passe : `admin123456`
- Rôle : ADMIN

## Structure du projet

```
backend/
├── prisma/
│   ├── schema.prisma          # Schéma de la base de données
│   ├── seed.js                # Données initiales
│   └── migrations/            # Migrations Prisma
├── src/
│   ├── index.js               # Point d'entrée
│   ├── routes/                # Routes API
│   │   ├── auth.js           # Authentification
│   │   ├── offers.js         # Offres d'emploi
│   │   ├── applications.js   # Candidatures
│   │   ├── rh.js             # RH
│   │   └── admin.js          # Admin
│   ├── middleware/           # Middlewares
│   │   └── auth.js           # Authentification JWT
│   └── lib/                  # Utilitaires
│       └── crypto.js         # Hashage et JWT
├── .env.example              # Exemple de configuration
└── package.json              # Dépendances
```

## Sécurité

- Les mots de passe sont hashés avec scrypt
- Les tokens JWT expirent après 7 jours
- Les routes sont protégées par rôle
- Les comptes désactivés ne peuvent pas se connecter
- CORS configuré pour le frontend

## Développement

Pour générer un nouveau client Prisma après modification du schéma :
```bash
npm run db:generate
```

Pour créer une nouvelle migration :
```bash
npx prisma migrate dev --name migration_name
```

Pour réinitialiser la base de données :
```bash
npm run db:setup
```
