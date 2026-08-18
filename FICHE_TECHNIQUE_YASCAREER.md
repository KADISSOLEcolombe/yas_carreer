# Fiche technique — YasCareer (état réel du code au 2026-08-12)

> Ce document décrit **ce qui est réellement implémenté et fonctionnel** dans le dépôt, pas les intentions ou la roadmap. Toute section "Documentation déclarée" est explicitement séparée du code réel. Objectif : servir de référence fiable pour vérifier la cohérence entre cas d'usage/spec produit et implémentation effective.

## ⚠️ Point critique à connaître avant toute analyse

Le dépôt contient **deux implémentations backend distinctes** :
- `backend/` — AdonisJS 7 + Lucid + SQLite/MySQL. **Vestige non branché au frontend actuellement**, en retard fonctionnel (pas de rôle "demandes d'entretien superviseur", "emplois", "notes de suivi").
- `yascareer-backend/` — Next.js 15 (API Route Handlers) + Prisma + PostgreSQL. **C'est celui-ci que le frontend appelle réellement** (`NEXT_PUBLIC_API_URL` par défaut `http://localhost:3333/api`, backend démarré via `next dev -p 3333`).

Le `README.md` à la racine du dépôt décrit le backend AdonisJS comme actif et mentionne un dossier `legacy/` qui n'existe pas — **cette doc racine est obsolète/trompeuse**. Toute la suite de cette fiche décrit exclusivement `yascareer-backend/` + `frontend/`, le duo réellement fonctionnel.

---

## 1. Stack technique réelle

- **Frontend** : Next.js 15.5.22 (App Router), React 19.1.0, TypeScript, Tailwind CSS v4, shadcn/ui + Radix UI, TanStack React Query 5, Zustand (store auth), React Hook Form + Zod.
- **Backend** : Next.js 15 en mode API-only (Route Handlers sous `src/app/api/**/route.ts`), pas d'Express/Fastify/NestJS.
- **Base de données** : PostgreSQL via Prisma ORM 6.2.1.
- **Auth** : JWT stateless (bcryptjs + jsonwebtoken), pas de sessions, pas de NextAuth/Passport.
- **IA/LLM** : Ollama auto-hébergé (SDK `openai` pointé sur un endpoint OpenAI-compatible local), avec fallback heuristique déterministe si absent. **Pas Groq ni OpenAI réel**, malgré ce que suggère le cahier des charges historique.
- **Emails** : Nodemailer/SMTP, 11 templates HTML, fire-and-forget (échec silencieux si SMTP non configuré).
- **Stockage fichiers** : système de fichiers local (`storage/uploads/`), pas de S3/Cloudinary.
- **Recherche web (enrichissement scoring candidat)** : Tavily / Serper avec fallback DuckDuckGo.
- **Paiement** : aucun (hors périmètre).
- **Tests** : aucun test automatisé n'existe dans le projet (pas de Jest/Vitest/Playwright/Cypress installés ou utilisés).
- **Pas de monorepo** : `frontend/`, `yascareer-backend/`, `backend/` sont trois projets totalement indépendants (pas de workspaces, pas de package.json racine fonctionnel).

---

## 2. Modèle de données (Prisma — `yascareer-backend/prisma/schema.prisma`)

**Rôles utilisateurs (enum `UserRole`)** : `admin`, `rh`, `candidat`, `superviseur`.

**Modèles principaux** :
- **User** — compte utilisateur (nom, email, mot de passe hashé, rôle, téléphone, actif/inactif, `mustChangePassword`).
- **CandidateProfile** — profil candidat 1-1 (bio, compétences, URL CV, données extraites par IA en JSON).
- **Offer** — offre (stage/emploi), statut brouillon/publiée/fermée, critères d'analyse IA, deadline, créée par un user RH/admin.
- **Application** — candidature à une offre (CV, lettre de motivation fichier + texte, statut, score/résumé/données d'analyse IA), unique par (offre, candidat).
- **ApplicationStatusHistory** — historique des changements de statut d'une candidature.
- **Interview** — entretien lié à une candidature (date, durée, lieu, lien visio, mode présentiel/distanciel, superviseur assigné, statut, notes).
- **InterviewRequest** — demande de disponibilité envoyée par RH à un superviseur pour organiser un entretien (statut en_attente/disponible/indisponible).
- **Emploi** — dossier d'embauche créé après acceptation d'une candidature (type de contrat stage/CDD/CDI, dates, superviseur, statut actif/terminé).
- **SupervisionNote** — note de suivi rédigée par un superviseur sur un employé (type rapport/évaluation/observation, note chiffrée).
- **Notification** — notifications utilisateur (type libre, contenu, lu/non lu).
- **ChatbotMessage** — historique des messages du chatbot IA.
- **ActivityLog** — journal d'activité (action, catégorie, résumé, IP, user-agent) pour audit admin.

**Statuts de candidature (`ApplicationStatus`)** : envoyée → en_cours_analyse → présélectionnée → entretien_programmé → entretien_réalisé → acceptée/rejetée.

**4 migrations appliquées**, sans dérive entre schéma et migrations : init → ajout rôle superviseur + module emplois → ajout statuts présélection/entretien réalisé → ajout durée/lieu entretien.

---

## 3. Rôles et parcours utilisateurs (côté frontend, avec garde d'accès par rôle)

- **Candidat** : parcourt/filtre les offres publiques, postule (upload CV + lettre), suit ses candidatures (stepper de statut), consulte ses entretiens, édite son profil (avec extraction IA du CV), gère des favoris **(stockés en localStorage uniquement, pas de persistance backend)**, reçoit des notifications.
- **RH** : dashboard KPIs, CRUD des offres (+ assistant de rédaction IA), gestion des candidatures (changement de statut, classement IA des candidats, finalisation de sélection en masse, notification des candidats retenus), planification d'entretiens, demande de disponibilité aux superviseurs, création de dossiers "emploi" pour les candidats acceptés.
- **Admin** : dashboard KPIs globaux, gestion des comptes (création admin/RH/superviseur avec mot de passe temporaire envoyé par email, activation/désactivation, changement de rôle), consultation du journal d'activité.
- **Superviseur** : répond aux demandes de disponibilité pour entretien, enregistre les résultats d'entretien qui lui sont assignés, suit ses collaborateurs (dossiers emploi), rédige des notes de suivi.

---

## 4. API — Endpoints réellement implémentés (44 routes)

Toutes sous `/api`, protégées par vérification de rôle inline dans chaque handler (pas de middleware global, pas de fichier `middleware.ts`).

**Auth** : `POST /auth/login`, `POST /auth/register` (inscription candidat publique — **fonctionnelle**, contrairement à ce qu'affirme le README backend qui la dit désactivée), `POST /auth/logout`, `GET /auth/me`, `PATCH /auth/profile`, `POST /auth/change-password`, `POST /auth/activate-account` (jeton HMAC, TTL 48h).

**Utilisateurs (admin)** : `GET/POST /users`, `PATCH /users/:id/role`, `PATCH /users/:id/status`.

**Offres** : `GET/POST /offers`, `GET/PUT/DELETE /offers/:id`, `PATCH /offers/:id/ai-criteria`, `POST /offers/:id/ai-rank`, `POST /offers/:id/finalize-selection`, `POST /offers/ai-assist`.

**Candidatures** : `GET/POST /applications`, `GET /applications/me`, `PATCH /applications/:id/status`, `POST /applications/:id/ai-analyze`, `POST /applications/notify-selected`.

**Profil candidat** : `POST /candidate-profiles/ai-extract-cv`.

**Entretiens** : `GET/POST /interviews`, `PATCH /interviews/:id`, `GET /interviews/me`.

**Demandes de disponibilité** : `GET/POST /interview-requests`, `PATCH /interview-requests/:id`, `GET /interview-requests/me`.

**Emplois** : `GET/POST /emplois`, `GET /emplois/me`.

**Notes de suivi** : `GET/POST /supervision-notes`, `PATCH /supervision-notes/:id`.

**Notifications** : `GET /notifications/me`, `PATCH /notifications/:id/read`, `PATCH /notifications/read-all`, `GET /notifications/unread-count`.

**Dashboards** : `GET /dashboard/admin`, `GET /dashboard/rh`, `GET /dashboard/candidate`.

**Journal d'activité (admin)** : `GET /activity-logs`, `GET /activity-logs/summary`, `POST /activity-logs/track`.

**Chatbot** : `POST /chatbot/message`.

**Fichiers** : `GET /uploads/:path*` — sert les CV/lettres stockés localement, **sans contrôle d'accès** (route publique).

Chaque endpoint listé côté frontend (`frontend/src/lib/api.ts`) correspond 1:1 à une route backend réelle — pas d'appel frontend orphelin détecté.

---

## 5. Fonctionnalités IA réellement câblées

- Scoring/analyse automatique d'une candidature par rapport à une offre (`ai-analyze`).
- Classement IA de toutes les candidatures d'une offre, avec synthèse (`ai-rank`).
- Extraction structurée des données d'un CV uploadé (`ai-extract-cv`) — lecture PDF (`pdf-parse`) et DOCX (`mammoth`).
- Génération assistée d'une offre d'emploi/stage (`ai-assist`).
- Chatbot conversationnel (`chatbot/message`).
- Enrichissement du scoring par recherche web publique sur le candidat (Tavily/Serper/DuckDuckGo).
- Toutes ces fonctions ont un **fallback heuristique non-IA** si aucun serveur Ollama n'est configuré (le produit reste utilisable sans IA, avec un scoring dégradé).

---

## 6. Sécurité — état réel

- Auth JWT (30 jours d'expiration), bcrypt (coût 10), contrôle de rôle manuel par route.
- Activation de compte par jeton HMAC signé, comparaison en temps constant.
- **Pas de rate limiting** (aucune protection anti brute-force sur login/register).
- **Pas de policies/permissions fines** — uniquement des vérifications de rôle grossières (admin/rh/candidat/superviseur) dans chaque handler.
- CORS géré via headers globaux Next.js (`next.config.ts`), origine = `FRONTEND_URL` ou `*` en fallback.
- Route d'upload de fichiers publique sans contrôle d'accès.

---

## 7. Ce qui N'EST PAS implémenté (mais parfois mentionné dans une doc/spec ailleurs)

- Pas de paiement en ligne.
- Pas de stockage cloud (S3/Cloudinary) — fichiers en local uniquement.
- Pas de rate limiting ni de policies par ressource.
- Pas de favoris persistés côté serveur (localStorage seulement).
- Pas de tests automatisés (aucun, sur les trois sous-projets).
- Pas de jobs planifiés/cron, pas de file d'attente (queue), pas de websockets.
- Endpoints `POST /applications/guest` et `POST /applications/extract-cv-public` (candidature/extraction CV sans compte) : **documentés dans le README backend mais absents du code** — n'existent pas.
- Type de notification `guest_application` référencé côté frontend mais jamais émis par le backend.
- Bascule thème sombre : librairie installée (`next-themes`) mais thème forcé en clair, aucune UI pour changer.
- Le fournisseur IA "Groq" mentionné dans d'anciens documents de cadrage n'est pas utilisé par le backend actif (qui utilise Ollama).

---

## 8. Question ouverte à trancher avec Claude Web

Cette fiche décrit `yascareer-backend/` comme le backend de référence car c'est celui que le frontend appelle réellement. Le dossier `backend/` (AdonisJS) existe en parallèle mais n'est pas branché — à clarifier s'il doit être abandonné, fusionné, ou s'il a une autre finalité (ex. tentative de migration en cours).
