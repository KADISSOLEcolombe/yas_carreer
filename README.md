# YasCareer

Plateforme de recrutement Yas Togo — offres, candidatures, entretiens, notifications et assistance IA.

**Stack :** Next.js 15 (API Prisma/PostgreSQL + frontend) · TypeScript + shadcn/ui · RodiumAI (IA)

> Spec détaillée : [`README (4).md`](./README%20(4).md)  
> Ancien stack Express/Prisma : [`legacy/`](./legacy/)

---

## Prérequis

- Node.js 20+
- npm

MySQL n’est pas requis en local : le backend utilise **SQLite** (`backend/tmp/db.sqlite3`) par défaut.

---

## Installation

```bash
# Backend
cd backend
npm install
node ace migration:run
node ace db:seed
npm run dev
# → http://localhost:3333

# Frontend (autre terminal)
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Comptes de démo

Mot de passe pour tous : `Password123!`

| Rôle | Email |
|------|-------|
| Admin | `admin@yascareer.tg` |
| RH | `rh@yascareer.tg` |
| RH (2) | `rh2@yascareer.tg` |
| Candidat | `candidat@yascareer.tg` |
| Candidat commercial | `kodjo.mensah@test.tg` |
| Candidat marketing | `ama.agbeko@test.tg` |
| Candidat télécoms | `yawo.adjovi@test.tg` |
| Candidat finance | `esse.tchedre@test.tg` |

Le seed crée **~29 offres** Yas Togo (digital, réseau, vente, RH, finance, Mixx, FTTH, régions Plateaux/Savanes…).

```bash
cd backend && node ace db:seed
```

---

## Variables d’environnement

### Backend (`backend/.env`)

```env
PORT=3333
HOST=localhost
APP_KEY=...
APP_URL=http://localhost:3333
SESSION_DRIVER=cookie

# Optionnel — IA RodiumAI (backend réel : yascareer-backend/.env)
RODIUMAI_API_KEY=
RODIUMAI_MODEL=openai/gpt-4o-mini

# Optionnel — emails SMTP
SMTP_HOST=
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
SMTP_FROM=YasCareer <noreply@yascareer.tg>
```

Sans `RODIUMAI_API_KEY`, le scoring IA et le chatbot utilisent des **fallbacks** déterministes.  
Sans SMTP, les emails sont **journalisés** (`[mail:skip]`).

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

---

## API (préfixe `/api`)

- Auth : `POST /auth/register|login|logout`, `GET /auth/me`, `PATCH /auth/profile`
- Users (admin) : `GET|POST /users`, `PATCH /users/:id/role|status`
- Offres : `GET /offers`, `GET /offers/:id`, CRUD RH/admin, `POST /offers/ai-assist`
- Candidatures : `POST /applications`, `GET /applications/me`, `GET /applications`, `PATCH /applications/:id/status`, `POST /applications/:id/ai-analyze`
- Profil CV IA : `POST /candidate-profiles/ai-extract-cv`
- Entretiens / notifications / dashboards / chatbot — voir la spec

Auth : header `Authorization: Bearer <token>`.

---

## Structure

```
yas_carreer/
├── backend/          # AdonisJS API
├── frontend/         # Next.js App Router
├── legacy/           # Ancien Express + Next
└── README (4).md     # Cahier des charges / spec
```

---

## MySQL (production)

1. `cd backend && npm install mysql2`
2. Décommenter / activer la connexion `mysql` dans `config/database.ts`
3. Renseigner `DB_*` dans `.env`
4. `node ace migration:run && node ace db:seed`
