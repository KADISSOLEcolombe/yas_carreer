# YAS Career Backend

API REST pour YasCareer (Express, Prisma, PostgreSQL).

## Démarrage rapide

```bash
cd backend
cp .env.example .env   # DATABASE_URL, JWT_SECRET, FRONTEND_URL, SMTP_*
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev            # http://localhost:3001
```

## Endpoints principaux

### Auth — `/api/auth`
- `POST /register` — inscription candidat (+ e-mail de bienvenue)
- `POST /login`
- `GET /me`, `PUT /profile`

### Offres — `/api/offres`
- `GET /`, `GET /:id` (public)
- `GET /rh/toutes`, `POST /`, `PUT /:id`, `PUT /:id/statut`, `DELETE /:id` (RH)

### Candidatures — `/api/candidatures`
- `POST /` — postuler (+ e-mail confirmation candidat)
- `GET /mes`, `GET /`, `GET /:id`
- `PUT /:id/statut` (+ e-mail statut)
- `POST /:id/recalculer-score`, `GET /:id/historique`

### Entretiens — `/api/entretiens`
- `POST /` — planifier (+ e-mail avec lien visio si présent)
- `GET /`, `/mes`, `/candidat`, `/:id`
- `PUT /:id`, `DELETE /:id`

### Autres
- `/api/emplois`, `/api/evaluations`, `/api/files`, `/api/notifications`, `/api/favoris`
- `/api/rh/stats` — `offresCount`, `candidaturesCount`, `enAttenteCount`, `candidatsCount`, `entretiensCount`
- `/api/admin/*` — comptes et stats admin

## E-mails (CDC 8.6)

Config SMTP optionnelle (`SMTP_HOST`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASS`).  
Sans SMTP, les e-mails sont loggés (`[mail:skip]`) sans faire échouer l’API.

Templates : bienvenue, confirmation candidature, changement de statut, convocation entretien (lien Meet/Zoom/Jitsi), affectation emploi.

## Comptes seed (exemples)

Voir `prisma/seed.js` — typiquement `admin@yastogo.tg`, `rh@yastogo.tg`, `superviseur@yastogo.tg`, `candidat1@test.tg`.
