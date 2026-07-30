# YasCareer

> Plateforme web de gestion des stages, des offres d'emploi et des candidatures — Yas Togo

**Stack :** AdonisJS 6 + MySQL (backend) · Next.js (frontend) · TypeScript de bout en bout · shadcn/ui · IA (Groq)

---

## Sommaire

1. [Présentation du projet](#1-présentation-du-projet)
2. [Contexte & problématique](#2-contexte--problématique)
3. [Objectifs](#3-objectifs)
4. [Acteurs du système](#4-acteurs-du-système)
5. [Fonctionnalités (modules métier)](#5-fonctionnalités-modules-métier)
6. [Architecture technique globale](#6-architecture-technique-globale)
7. [Backend — spécifications techniques](#7-backend--spécifications-techniques-adonisjs)
8. [Frontend — spécifications techniques](#8-frontend--spécifications-techniques-nextjs)
9. [Modèle de données](#9-modèle-de-données)
10. [API REST — endpoints principaux](#10-api-rest--endpoints-principaux)
11. [Sécurité](#11-sécurité)
12. [Exigences non fonctionnelles](#12-exigences-non-fonctionnelles)
13. [Structure des dossiers](#13-structure-des-dossiers)
14. [Variables d'environnement](#14-variables-denvironnement)
15. [Installation & scripts](#15-installation--scripts)
16. [Planning prévisionnel](#16-planning-prévisionnel)
17. [Livrables](#17-livrables)
18. [Limites du système (hors périmètre)](#18-limites-du-système-hors-périmètre)

---

## 1. Présentation du projet

**YasCareer** est une plateforme web destinée à moderniser et centraliser la gestion des stages, des offres d'emploi et des candidatures au sein de **Yas Togo**.

Aujourd'hui, ces processus reposent en partie sur des méthodes manuelles et dispersées (email, appels, messageries) : diffusion limitée des offres, suivi difficile des candidatures, organisation manuelle des entretiens. YasCareer propose une solution numérique unique, moderne et intuitive pour :

- publier et gérer les offres de stage et d'emploi ;
- permettre aux candidats de postuler en ligne ;
- suivre l'évolution de chaque candidature ;
- planifier des entretiens (présentiel / distanciel) ;
- automatiser les notifications et emails ;
- assister les utilisateurs via un chatbot intégré.

Ce document reprend le cahier des charges initial et le traduit en une **spécification technique complète**, avec une stack repensée en TypeScript de bout en bout.

## 2. Contexte & problématique

**Constat :** les offres circulent sur des canaux dispersés, les candidatures sont peu centralisées, le suivi est manuel et chronophage, et la communication RH ↔ candidats manque de traçabilité.

**Question centrale :** comment concevoir une plateforme web permettant de centraliser et gérer efficacement les offres, les candidatures, les entretiens et la communication avec les candidats au sein de Yas Togo ?

## 3. Objectifs

**Objectif général** — Concevoir et développer une application web moderne qui digitalise et centralise la gestion des stages, des offres d'emploi et des recrutements de Yas Togo.

**Objectifs spécifiques**

- Centraliser les offres de stage et d'emploi
- Permettre la consultation publique des offres
- Permettre la candidature en ligne
- Faciliter le suivi des candidatures (statuts)
- Organiser les entretiens à distance
- Automatiser notifications et emails
- Améliorer la communication RH ↔ candidats
- Optimiser globalement le processus de recrutement

## 4. Acteurs du système

Le système distingue trois rôles.

| Acteur | Rôle |
|---|---|
| **Admin** | Gère les comptes utilisateurs (création des comptes RH, activation/désactivation, attribution des rôles), supervise la plateforme dans son ensemble, accède à toutes les statistiques (recrutement + usage système). N'intervient pas dans le quotidien du recrutement, mais y a accès si besoin. |
| **RH (Responsable RH)** | Publie et gère les offres, gère les candidatures, programme les entretiens, modifie les statuts, envoie des notifications, consulte les statistiques de recrutement. C'est le rôle opérationnel au quotidien. |
| **Candidat** | Crée un compte, consulte les offres, postule, télécharge son CV, suit ses candidatures, participe aux entretiens à distance. |

Système de rôles géré via une colonne `role` (`admin` \| `rh` \| `candidat`) et des middlewares d'autorisation par rôle côté backend, avec garde de routes correspondante côté frontend. En pratique, l'**admin hérite des permissions du RH** (super-utilisateur) mais le RH n'a pas accès à la gestion des comptes/rôles, réservée à l'admin.

## 5. Fonctionnalités (modules métier)

### 5.1 Authentification & gestion des utilisateurs
Inscription (candidats), connexion, déconnexion, réinitialisation de mot de passe, gestion du profil (infos personnelles, CV). Côté **admin uniquement** : création des comptes RH, activation/désactivation de comptes, attribution/modification des rôles.

### 5.2 Gestion des offres
CRUD complet des offres (titre, type stage/emploi, description, compétences requises, date limite, localisation), recherche et filtrage (type, localisation, mots-clés, statut). Accessible au **RH** et à l'**admin**.

### 5.3 Gestion des candidatures
Candidature en ligne (candidat), upload de documents (CV, lettre de motivation), historique des candidatures par candidat. Consultation et gestion par le **RH** et l'**admin**.

### 5.4 Suivi des candidatures
Statuts : `envoyée` → `en_cours_analyse` → `entretien_programmé` → `acceptée` / `rejetée`. Historique horodaté de chaque changement de statut. Mise à jour par le **RH**.

### 5.5 Gestion des entretiens (visio)
Programmation (date, heure, candidat), ajout d'un lien Google Meet / Zoom (saisi manuellement, pas d'intégration d'appel vidéo native), envoi automatique du lien par email, calendrier des entretiens côté **RH**.

### 5.6 Notifications & emails automatiques
Déclenchés sur événements : confirmation d'inscription, confirmation de candidature, changement de statut, convocation à un entretien, acceptation/rejet.

### 5.7 Tableau de bord
- **Admin** : vue globale du système — nombre de comptes RH, nombre total d'offres/candidatures tous statuts confondus, indicateurs d'usage de la plateforme.
- **RH** : nombre d'offres publiées, nombre de candidatures, statistiques de recrutement, entretiens programmés.
- **Candidat** : candidatures envoyées, statuts, prochains entretiens.

### 5.8 Modules Intelligence Artificielle

L'IA est intégrée sur des cas d'usage concrets, choisis pour un gain de temps ou de qualité réel — pas de l'IA "gadget" plaquée sur le projet.

#### 5.8.1 Scoring & analyse automatique des candidatures
Dès qu'une candidature est soumise, le CV et la lettre de motivation sont comparés au contenu de l'offre (description, compétences requises) par un LLM. Le système calcule un **score de correspondance (0-100)** et génère un **court résumé** (points forts / points d'attention), affichés côté RH dans la liste des candidatures — pour prioriser sans tout relire manuellement. Le RH garde la main : le score aide à la décision, il ne filtre jamais automatiquement une candidature.

#### 5.8.2 Extraction structurée du CV
À l'upload du CV, un LLM extrait automatiquement les informations structurées (expériences, formations, compétences) pour **pré-remplir le profil du candidat**, ce qui réduit la saisie manuelle et améliore la qualité des données utilisées pour le scoring (5.8.1).

#### 5.8.3 Assistant de rédaction d'offres
Lors de la création/édition d'une offre par le RH, un assistant IA reformule et enrichit la description à partir d'un brief court, et suggère une liste de compétences requises — pour publier des offres claires et complètes plus rapidement.

#### 5.8.4 Chatbot d'assistance candidats
Assistant conversationnel pour guider les candidats (comment postuler, où voir ses candidatures, comment rejoindre un entretien). Réponses générées via un LLM sur une base de connaissance restreinte au fonctionnement de la plateforme (FAQ + contexte utilisateur), pas un agent généraliste.

## 6. Architecture technique globale

```
┌─────────────────────┐        HTTPS / REST JSON        ┌──────────────────────┐
│   Frontend (Next.js) │ ───────────────────────────────▶ │   Backend (AdonisJS)  │
│   TypeScript + shadcn│ ◀─────────────────────────────── │   TypeScript          │
└─────────────────────┘                                  └───────────┬──────────┘
                                                                       │
                                              ┌────────────────────────┼───────────────────────┐
                                              ▼                        ▼                        ▼
                                      MySQL (Lucid ORM)          Stockage fichiers        Service email
                                      (users, offres,            (CV / lettres)           (SMTP / Resend)
                                       candidatures, ...)
```

Communication 100 % via API REST (JSON), backend et frontend découplés et déployables indépendamment.

## 7. Backend — spécifications techniques (AdonisJS)

### 7.1 Pourquoi AdonisJS

AdonisJS 6 est retenu comme "framework top et simple" pour ce projet :

- **TypeScript natif** (pas un ajout après-coup) — typage de bout en bout, y compris sur les requêtes SQL via Lucid.
- **Architecture MVC structurée**, très proche de Laravel dans sa philosophie : controllers, models, middlewares, service providers, injection de dépendances via IoC container. Transition naturelle depuis un profil Laravel.
- **Lucid ORM** : syntaxe proche d'Eloquent (Active Record), migrations, seeders, relations (`hasMany`, `belongsTo`, etc.).
- **VineJS** pour la validation des requêtes, équivalent des `FormRequest` Laravel.
- **Auth module intégré** (sessions ou tokens d'accès opaques), gestion des guards.
- **Ace CLI** intégré (équivalent Artisan) pour générer controllers, models, migrations.
- **Mailer intégré**, queue-friendly, testable.
- Écosystème Node.js → cohérent avec un frontend Next.js et un futur passage éventuel à des Edge Functions / serverless.

### 7.2 Stack backend

| Élément | Choix |
|---|---|
| Framework | AdonisJS 6 |
| Langage | TypeScript |
| ORM | Lucid (driver `mysql2`) |
| Base de données | MySQL |
| Validation | VineJS |
| Authentification | Adonis Auth (tokens d'accès, JWT via package communautaire si besoin mobile futur) |
| Hash mots de passe | Adonis Hash (Scrypt / Argon2) |
| Envoi d'emails | Adonis Mail + provider SMTP (ou Resend) |
| Stockage fichiers (CV, LM) | Adonis Drive (local en dev, S3-compatible en prod — ex. Backblaze B2 / Cloudinary) |
| IA (scoring, extraction CV, rédaction, chatbot) | Service dédié appelant l'API **Groq** (LLM) |
| Tests | Japa (test runner natif AdonisJS) |
| Documentation API | OpenAPI/Swagger généré ou maintenu manuellement |

### 7.3 Découpage en modules (dossiers `app/`)

- `controllers/` — un controller par ressource (Auth, Offers, Applications, Interviews, Notifications, Dashboard, Ai)
- `models/` — entités Lucid
- `validators/` — schémas VineJS par action
- `middleware/` — `auth`, `role` (admin/rh/candidat), `silent_auth`
- `services/` — logique métier isolée (ex. `ApplicationStatusService`, `NotificationService`, `AiService`)
- `mailers/` — un mailer par type d'email automatique
- `policies/` — règles d'autorisation fines (ex. un candidat ne peut voir que ses propres candidatures ; seul l'admin peut gérer les comptes et les rôles)

### 7.4 Intégration IA côté backend

- **Fournisseur LLM : Groq** — rapide et économique, cohérent avec le reste de la stack habituelle du projet.
- Un service unique `services/ai_service.ts` centralise tous les appels au LLM : construction des prompts, parsing de la réponse en JSON structuré, gestion des erreurs et des timeouts. Les controllers ne parlent jamais directement à l'API Groq.
- **Exécution** : synchrone dans un premier temps (les réponses Groq sont rapides, quelques secondes) ; si le volume de candidatures augmente, prévoir une file d'attente (ex. BullMQ + Redis) pour ne pas bloquer les requêtes HTTP pendant l'analyse.
- **Cas particulier CV scanné/image** : si le texte n'est pas extractible directement du PDF (CV scanné), prévoir un passage par un OCR (ex. Gemini Vision) avant l'extraction structurée (5.8.2).
- Chaque résultat IA (score, résumé, extraction) est **stocké en base**, jamais recalculé à chaque affichage — un bouton "ré-analyser" permet de relancer l'IA à la demande (ex. après mise à jour du CV).

## 8. Frontend — spécifications techniques (Next.js)

### 8.1 Stack frontend

| Élément | Choix |
|---|---|
| Framework | Next.js (App Router) |
| Langage | TypeScript |
| UI Kit | shadcn/ui |
| Style | Tailwind CSS |
| Formulaires | React Hook Form + Zod (schémas partagés avec la validation backend dans l'esprit, même si dupliqués) |
| Data fetching / cache | TanStack Query (React Query) |
| État global léger | Zustand (session utilisateur, préférences UI) si nécessaire |
| Authentification côté client | Cookies httpOnly (token émis par AdonisJS) + middleware Next.js pour la protection des routes par rôle |
| Icônes | lucide-react (déjà inclus avec shadcn) |
| Rendu | SSR/ISR pour les pages publiques d'offres (SEO), CSR pour les espaces authentifiés (dashboard admin/RH/candidat) |

### 8.2 Découpage des espaces (routes)

- **Public** : accueil, liste des offres, détail d'une offre, page de candidature
- **Auth** : connexion, inscription, mot de passe oublié
- **Espace candidat** : dashboard, mes candidatures, mon profil / CV, mes entretiens
- **Espace RH** : dashboard recrutement, gestion des offres, gestion des candidatures, gestion des entretiens, notifications
- **Espace admin** : dashboard global, gestion des comptes utilisateurs et des rôles (accède aussi à l'espace RH en lecture/écriture)

### 8.3 Composants shadcn/ui à privilégier

`Table` (listes offres/candidatures), `Card` (dashboard), `Dialog` (création/édition rapide), `Form` + `Input`/`Select`/`Textarea`, `Badge` (statuts de candidature), `Calendar`/`Popover` (planification d'entretien), `Toast`/`Sonner` (notifications UI), `Tabs` (navigation dashboard).

## 9. Modèle de données

| Table | Champs clés |
|---|---|
| `users` | id, full_name, email, password_hash, role (`admin`\|`rh`\|`candidat`), phone, created_at |
| `candidate_profiles` | id, user_id (FK), bio, skills, cv_url, **ai_extracted_data** (json — sortie de l'extraction IA du CV) |
| `offers` | id, title, type (`stage`\|`emploi`), description, requirements, deadline, location, status, created_by (FK admin) |
| `applications` | id, offer_id (FK), user_id (FK), cv_url, cover_letter_url, status, applied_at, **ai_match_score** (int 0-100), **ai_summary** (text), **ai_analyzed_at** |
| `application_status_history` | id, application_id (FK), status, changed_by (FK), changed_at |
| `interviews` | id, application_id (FK), scheduled_at, meeting_link, mode (`presentiel`\|`distanciel`), status |
| `notifications` | id, user_id (FK), type, content, read_at, created_at |
| `chatbot_messages` | id, user_id (FK, nullable), role (`user`\|`assistant`), content, created_at |

Relations principales : `users 1—N applications`, `offers 1—N applications`, `applications 1—1 interviews`, `applications 1—N application_status_history`.

## 10. API REST — endpoints principaux

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

GET    /api/users                             (admin — liste des comptes)
POST   /api/users                             (admin — créer un compte RH)
PATCH  /api/users/:id/role                    (admin — modifier le rôle)
PATCH  /api/users/:id/status                  (admin — activer/désactiver)

GET    /api/offers                 (public, filtres query params)
GET    /api/offers/:id             (public)
POST   /api/offers                 (rh, admin)
PUT    /api/offers/:id             (rh, admin)
DELETE /api/offers/:id             (rh, admin)

POST   /api/applications                     (candidat)
GET    /api/applications/me                   (candidat)
GET    /api/applications                      (rh, admin — filtres par offre/statut)
PATCH  /api/applications/:id/status            (rh, admin)

POST   /api/interviews                         (rh, admin)
GET    /api/interviews/me                      (candidat)
GET    /api/interviews                         (rh, admin)

GET    /api/notifications/me
PATCH  /api/notifications/:id/read

GET    /api/dashboard/admin
GET    /api/dashboard/rh
GET    /api/dashboard/candidate

POST   /api/chatbot/message

# Endpoints IA
POST   /api/applications/:id/ai-analyze         (rh, admin — lance/relance le scoring IA d'une candidature)
POST   /api/candidate-profiles/ai-extract-cv    (candidat — extraction auto du CV après upload)
POST   /api/offers/ai-assist                    (rh, admin — suggestion/amélioration de la description d'une offre)
```

## 11. Sécurité

- Authentification sécurisée (tokens signés, hashing Argon2/Scrypt des mots de passe)
- Contrôle d'accès basé sur les rôles (middleware `role` sur chaque route sensible)
- Validation stricte des entrées (VineJS côté serveur, Zod côté client — jamais de confiance uniquement côté client)
- Upload de fichiers restreint (types MIME autorisés : PDF/DOCX, taille max, scan de nom de fichier)
- Protection CORS configurée explicitement pour le domaine du frontend
- Rate limiting sur les routes sensibles (login, inscription, envoi de candidature)
- Données personnelles des candidats accessibles uniquement au propriétaire, au RH et à l'admin (policies) ; la gestion des comptes/rôles est réservée à l'admin

## 12. Exigences non fonctionnelles

Accessible via navigateur, interface responsive et moderne, bonnes performances, facilité d'utilisation, confidentialité des données garantie, ergonomie soignée sur les trois espaces (Admin, RH et candidat).

## 13. Structure des dossiers

**Backend**
```
backend/
├── app/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── validators/
│   ├── services/
│   ├── mailers/
│   └── policies/
├── config/
├── database/
│   ├── migrations/
│   └── seeders/
├── start/
│   ├── routes.ts
│   └── kernel.ts
└── tests/
```

**Frontend**
```
frontend/
├── app/
│   ├── (public)/
│   │   └── offres/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (candidat)/
│   │   ├── dashboard/
│   │   ├── candidatures/
│   │   └── profil/
│   ├── (rh)/
│   │   ├── dashboard/
│   │   ├── offres/
│   │   ├── candidatures/
│   │   └── entretiens/
│   └── (admin)/
│       ├── dashboard/
│       └── utilisateurs/
├── components/
│   ├── ui/          ← composants shadcn
│   └── shared/
├── lib/
│   ├── api.ts
│   └── utils.ts
├── hooks/
└── types/
```

## 14. Variables d'environnement

**Backend (`.env`)**
```
PORT=3333
HOST=0.0.0.0
NODE_ENV=development
APP_KEY=
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=
DB_PASSWORD=
DB_DATABASE=yascareer
SMTP_HOST=
SMTP_PORT=
SMTP_USERNAME=
SMTP_PASSWORD=
GROQ_API_KEY=
STORAGE_DISK=local   # ou s3 en production
```

**Frontend (`.env.local`)**
```
NEXT_PUBLIC_API_URL=http://localhost:3333/api
```

## 15. Installation & scripts

```bash
# Backend
cd backend
npm install
node ace migration:run
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## 16. Planning prévisionnel

| Étape | Durée |
|---|---|
| Cahier des charges | 1 semaine |
| Analyse et UML | 1 semaine |
| Conception UI/UX | 1 semaine |
| Développement backend | 2 semaines |
| Développement frontend | 3 semaines |
| Intégration des modules avancés | 2 semaines |
| Tests et corrections | 1 semaine |
| Rédaction du mémoire | 1 semaine |

## 17. Livrables

- Application web fonctionnelle (frontend + backend)
- Code source (dépôts backend / frontend)
- Base de données
- Diagrammes UML
- Cahier des charges
- Documentation technique (ce document)
- Mémoire final

## 18. Limites du système (hors périmètre)

- Pas d'appels vidéo natifs — utilisation de liens Google Meet / Zoom externes
- Pas de paiement en ligne
- Pas de tests techniques automatisés pour les candidats

---

**Résumé stack finale**

| Couche | Technologie |
|---|---|
| Frontend | Next.js + TypeScript + shadcn/ui + Tailwind CSS |
| Backend | AdonisJS 6 + TypeScript + Lucid ORM |
| Base de données | MySQL |
| Emails | Adonis Mail (SMTP / Resend) |
| Fichiers (CV, LM) | Adonis Drive (local / S3-compatible) |
| IA | Groq (LLM) — scoring de candidatures, extraction de CV, aide à la rédaction d'offres, chatbot |
