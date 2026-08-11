# YasCareer — Backend (API)

API de la plateforme de recrutement **Yas Togo**. Projet **autonome**, sans
frontend : uniquement des endpoints JSON. Conçu pour être consommé par le
frontend Next.js (ou toute autre app : mobile, etc.).

Réécriture du backend AdonisJS d'origine en **Route Handlers Next.js** adossés à
**Prisma** + **PostgreSQL**, avec IA **Ollama** auto-hébergée.

## Stack

- **Next.js 15** (App Router, mode API-only) — sert `/api/*` et `/uploads/*`
- **Prisma ORM** + **PostgreSQL**
- Auth **JWT** (Bearer) + mots de passe **bcrypt**
- Validation **Zod**
- IA via **Ollama** (API OpenAI-compatible ; fallback heuristique si absent)
- Lecture CV **PDF** (`pdf-parse`) et **DOCX** (`mammoth`)
- Recherche web candidats : Tavily / Serper / DuckDuckGo (optionnel)
- **CORS** activé (le frontend est sur une autre origine)

> React est présent uniquement parce que Next.js l'exige (layout racine). Aucune
> librairie UI n'est installée : le projet reste un backend.

## Prérequis

- Node.js 20+
- PostgreSQL (locale, Neon, Supabase, RDS, VPS aaPanel…)

## Installation

```bash
cp .env.example .env
# éditez .env : DATABASE_URL, APP_KEY (secret long), FRONTEND_URL, OLLAMA_URL

npm install
npx prisma generate          # client Prisma
npx prisma migrate deploy    # applique le schéma (migration 0001_init)
npm run db:seed              # données de démo Yas Togo
npm run dev                  # API sur http://localhost:3333
```

Le port par défaut est **3333** (comme le backend AdonisJS d'origine). En
production : `npm run build && npm start`.

## Connexion depuis le frontend

Le front doit pointer sa variable `NEXT_PUBLIC_API_URL` vers cette API, par ex. :

```
NEXT_PUBLIC_API_URL="http://localhost:3333/api"     # dev
NEXT_PUBLIC_API_URL="https://api.yascareer.tg/api"  # prod
```

Et cette API doit connaître l'origine du front via `FRONTEND_URL` (pour le CORS
et les liens d'activation email).

## Comptes de démo (après seed)

| Rôle      | Email                   | Mot de passe   |
|-----------|-------------------------|----------------|
| Admin     | admin@yascareer.tg      | Password123!   |
| RH        | rh@yascareer.tg         | Password123!   |
| RH        | rh2@yascareer.tg        | Password123!   |
| Candidat  | candidat@yascareer.tg   | Password123!   |

## Variables d'environnement

| Clé | Rôle |
|-----|------|
| `DATABASE_URL` | Connexion PostgreSQL (**requis**) |
| `APP_KEY` | Secret : signe les JWT et les tokens d'activation HMAC (**requis**) |
| `FRONTEND_URL` | Origine du front — CORS + liens d'activation email |
| `OLLAMA_URL` | Endpoint Ollama OpenAI-compatible (ex. `http://localhost:11434/v1`). Absent → fallback |
| `OLLAMA_MODEL` | Modèle Ollama (défaut `llama3.1`) |
| `OLLAMA_API_KEY` | Optionnel : jeton si Ollama est derrière un proxy d'auth |
| `TAVILY_API_KEY` / `SERPER_API_KEY` | Recherche web candidats. Absent → DuckDuckGo |
| `SMTP_*` | Envoi d'emails. Absent → logué en console |

## Routes

Toutes les réponses ont la forme `{ "data": ... }` (sauf messages simples).
Authentification : en-tête `Authorization: Bearer <token>`.

### Auth
- `POST /api/auth/login` — connexion → `{ user, token, mustChangePassword }`
- `POST /api/auth/logout` — déconnexion (JWT stateless, côté client)
- `GET  /api/auth/me` — utilisateur courant + profil
- `PATCH /api/auth/profile` — mise à jour profil (nom, tél, bio, compétences)
- `POST /api/auth/change-password` — changement de mot de passe
- `POST /api/auth/activate-account` — activation compte candidat (token email)
- `POST /api/auth/register` — désactivé (410) par design

### Utilisateurs (admin)
- `GET  /api/users` — liste (filtre `?role=`)
- `POST /api/users` — créer un compte RH/admin (email d'invitation)
- `PATCH /api/users/:id/role` — changer le rôle
- `PATCH /api/users/:id/status` — activer/désactiver

### Offres
- `GET  /api/offers` — liste (filtres `?type=&location=&q=&status=`)
- `POST /api/offers` — créer (RH/admin)
- `GET  /api/offers/:id` — détail
- `PUT  /api/offers/:id` — modifier
- `DELETE /api/offers/:id` — supprimer
- `POST /api/offers/ai-assist` — rédaction d'offre assistée par IA
- `PATCH /api/offers/:id/ai-criteria` — critères d'analyse IA
- `POST /api/offers/:id/ai-rank` — classement IA des candidatures

### Candidatures
- `GET  /api/applications` — liste (RH/admin, triée par score IA)
- `POST /api/applications` — postuler (candidat, multipart CV/lettre)
- `GET  /api/applications/me` — mes candidatures (candidat)
- `POST /api/applications/guest` — candidature sans compte (crée le candidat)
- `POST /api/applications/extract-cv-public` — pré-remplissage via CV (public)
- `PATCH /api/applications/:id/status` — changer le statut (RH/admin)
- `POST /api/applications/:id/ai-analyze` — analyse IA d'un dossier
- `POST /api/applications/notify-selected` — email aux candidats sélectionnés

### Profils candidats
- `POST /api/candidate-profiles/ai-extract-cv` — extraction CV (candidat connecté)

### Entretiens
- `GET  /api/interviews` — liste (RH/admin)
- `POST /api/interviews` — programmer/replanifier
- `GET  /api/interviews/me` — mes entretiens (candidat)

### Notifications
- `GET   /api/notifications/me` — mes notifications
- `GET   /api/notifications/unread-count` — nombre de non-lues
- `PATCH /api/notifications/read-all` — tout marquer lu
- `PATCH /api/notifications/:id/read` — marquer une notif lue

### Dashboards
- `GET /api/dashboard/admin` — stats admin
- `GET /api/dashboard/rh` — stats RH
- `GET /api/dashboard/candidate` — stats candidat

### Journal d'activité (admin)
- `GET  /api/activity-logs` — logs (filtres `?userId=&category=&action=&q=&limit=`)
- `GET  /api/activity-logs/summary` — synthèse par utilisateur
- `POST /api/activity-logs/track` — tracer une action UI

### Chatbot
- `POST /api/chatbot/message` — question au chatbot (public ou connecté)

### Fichiers
- `GET /uploads/:path*` — sert les CV / lettres (stockés hors `public/`)

## IA auto-hébergée avec Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.1        # ~4.7 Go, gère bien le JSON strict
# alternatives : qwen2.5:7b (excellent en extraction), mistral (plus léger)
```

Ollama écoute sur `http://localhost:11434`. L'API cible
`OLLAMA_URL="http://localhost:11434/v1"`.

**Ollama sur un autre serveur** (ex. machine GPU) :

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve   # sur la machine Ollama
```
```
OLLAMA_URL="http://10.0.0.X:11434/v1"    # dans le .env de l'API
```

> **Sécurité** : Ollama n'a pas d'auth native. Ne l'exposez pas sur Internet —
> gardez-le sur le réseau privé (WireGuard) ou derrière un proxy avec
> `OLLAMA_API_KEY`.

Plusieurs routes exigent une sortie **JSON stricte** (analyse candidat,
extraction CV, assistant offre). `llama3.1` et `qwen2.5:7b` gèrent bien le mode
JSON. Si un modèle renvoie du JSON invalide, le code bascule automatiquement sur
ses **fallbacks heuristiques** — rien ne casse. Vous pouvez démarrer sans IA
(`OLLAMA_URL` vide) puis l'activer ensuite.

## Structure

```
prisma/
  schema.prisma            Modèle de données (PostgreSQL)
  migrations/0001_init/    Migration SQL initiale
  seed.ts                  Jeu de données Yas Togo
src/
  app/
    api/                   Route Handlers = l'API
    uploads/[...path]/     Sert les fichiers CV/lettres
    layout.tsx, page.tsx   Racine minimale (statut de l'API)
  server/                  Cœur backend
    db.ts                  Client Prisma singleton
    auth.ts                JWT + bcrypt + gardes de rôle
    http.ts                Réponses { data } + gestion d'erreurs
    validators.ts          Schémas Zod
    domain.ts              Statuts & transitions de candidature
    serialize.ts           Sérialisation user (initiales, sans password)
    services/              account-activation, storage, notification,
                           activity-log, mail, application-status,
                           document-reader, web-research, ai (Ollama)
storage/uploads/           Fichiers uploadés (hors public/)
```

## Production

```bash
npm run build      # prisma generate + next build
npm start          # port 3333
```

Derrière un reverse proxy (Nginx/Cloudflare). Montez un volume persistant pour
`storage/uploads`. Pensez à définir `FRONTEND_URL` sur l'origine réelle du front
pour restreindre le CORS.

## Note sur `.offline-types/`

Contient un stub `@prisma/client` servant **uniquement** à vérifier les types
dans un environnement sans réseau (où `prisma generate` ne peut pas télécharger
ses binaires). Exclu du build ; inutile en environnement normal.
