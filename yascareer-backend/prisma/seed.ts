import "dotenv/config";
import { PrismaClient, type OfferStatus, type OfferType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

type SeedOffer = {
  title: string;
  type: OfferType;
  location: string;
  deadlineDays: number;
  status: OfferStatus;
  requirements: string;
  description: string;
};

const OFFERS: SeedOffer[] = [
  {
    title: 'Manager Réseau de Distribution — Plateaux',
    type: 'emploi',
    location: 'Atakpamé (Plateaux)',
    deadlineDays: 28,
    status: 'publiee',
    requirements:
      'Management commercial, Animation réseau, Distribution, Leadership, Maîtrise du terrain, Pack Office',
    description: `Yas Togo, 1er réseau internet mobile au Togo et dans l’UEMOA, certifié Top Employer Togo, recrute un(e) Manager Réseau de Distribution pour la région des Plateaux.

À propos du poste
Vous pilotez le développement du réseau de distribution Yas sur votre zone : partenaires, points de vente, performance commerciale et satisfaction client.

Missions principales
• Animer et développer le réseau de distribution (revendeurs, agents, points Yas)
• Atteindre les objectifs de ventes (SIM, forfaits, Mixx by Yas, devices)
• Manager et coacher les équipes terrain
• Suivre les indicateurs de performance et proposer des plans d’action
• Garantir la qualité de l’expérience client sur la zone

Profil recherché
• Bac+3/5 en commerce, marketing ou équivalent
• Expérience confirmée en management de réseau de distribution (télécoms ou FMCG apprécié)
• Excellente connaissance du terrain togolais
• Leadership, aisance relationnelle et orientation résultats

Ce que nous offrons
• CDI, package attractif + variable
• Formation continue et mobilité interne
• Environnement Top Employer, culture « Let’s grow together »`,
  },
  {
    title: 'Manager Réseau de Distribution — Savanes',
    type: 'emploi',
    location: 'Dapaong (Savanes)',
    deadlineDays: 28,
    status: 'publiee',
    requirements:
      'Management commercial, Distribution, Animation réseau, Leadership, Négociation, Reporting',
    description: `Renforcez la Direction Ventes et Distribution de Yas Togo dans la région des Savanes.

À propos du poste
Vous êtes le relais stratégique de Yas sur le nord du pays : croissance du réseau, part de marché et proximité clients.

Missions principales
• Structurer et animer le réseau de distribution local
• Développer les ventes voice, data et services financiers (Mixx by Yas)
• Manager les équipes et partenaires
• Assurer le reporting et la conformité terrain

Profil recherché
• Expérience en management commercial terrain
• Autonomie, résilience et sens du challenge
• Permis B et disponibilité pour déplacements fréquents

Ce que nous offrons
• CDI basé à Dapaong
• Véhicule de fonction selon package
• Opportunités d’évolution au sein du groupe`,
  },
  {
    title: 'Head of Business Development — Ventes & FTTH',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 21,
    status: 'publiee',
    requirements:
      'Business development, Stratégie commerciale, FTTH, B2B, Négociation, Leadership',
    description: `Yas Togo recrute un(e) Head of Business Development pour renforcer la Direction Ventes, Distribution & FTTH.

À propos du poste
Vous définissez et exécutez la stratégie de développement business (B2B, FTTH, partenariats) afin d’accélérer la croissance de Yas Togo.

Missions principales
• Piloter le pipeline business development et les grands comptes
• Développer les offres fibre (FTTH) et solutions entreprises
• Identifier et conclure des partenariats stratégiques
• Collaborer étroitement avec Marketing, Technique et Finance

Profil recherché
• Bac+5, 8+ ans d’expérience en business development télécoms / tech
• Vision business forte et goût du challenge
• Excellente capacité de négociation et de présentation C-level

Ce que nous offrons
• Poste stratégique à fort impact
• Package cadre + bonus
• Environnement innovant, Top Employer Togo`,
  },
  {
    title: 'Chargé(e) de Recrutement & Marque Employeur',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 35,
    status: 'publiee',
    requirements:
      'Recrutement, Marque employeur, Communication RH, LinkedIn, Entretiens, Droit du travail',
    description: `Au sein de la Direction du Capital Humain, vous pilotez le recrutement opérationnel et la marque employeur Yas Togo.

Missions principales
• Sourcer, qualifier et accompagner les candidatures (CDI, stages, alternance)
• Animer YasCareer et les campagnes LinkedIn / campus
• Organiser les entretiens avec les managers
• Contribuer aux actions SoWe et forums métiers

Profil recherché
• Bac+3/5 RH ou communication
• 2 à 5 ans en recrutement
• Sens du service, discrétion et excellent français oral/écrit

Ce que nous offrons
• CDI Lomé siège
• Outils digitaux de recrutement
• Culture collaborative et impact social`,
  },
  {
    title: 'Stage — Développement Web & Applications Internes',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 40,
    status: 'publiee',
    requirements: 'JavaScript, TypeScript, React, Node.js, Git, APIs REST, UI/UX',
    description: `Rejoignez l’équipe Digitale / IT de Yas Togo pour un stage de développement web.

À propos du stage
Vous participez à la conception et à l’évolution d’applications internes (RH, ventes, support) utilisées au quotidien par les équipes Yas.

Missions
• Développer des interfaces React / Next.js
• Contribuer aux APIs backend
• Écrire des tests et documenter vos livrables
• Participer aux rituels agile de l’équipe

Profil
• Étudiant(e) Bac+3 à Bac+5 en informatique
• Bases solides en JavaScript / TypeScript
• Curiosité, rigueur et esprit d’équipe

Durée & conditions
• 3 à 6 mois, gratifié
• Encadrement par un ingénieur senior
• Possibilité d’embauche selon performance`,
  },
  {
    title: 'Stage — Data Analyst & Reporting Commercial',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 32,
    status: 'publiee',
    requirements: 'Excel avancé, Power BI, SQL, Analyse de données, Data visualisation, Anglais',
    description: `Stage Data au sein de la Direction Ventes & Distribution.

Missions
• Construire des tableaux de bord Power BI (ventes, churn, Mixx)
• Extraire et nettoyer des données (SQL / Excel)
• Produire des analyses pour les managers régionaux
• Automatiser des reportings récurrents

Profil
• Formation data, stats, économie ou informatique
• Maîtrise Excel et intérêt pour la data visualisation
• Rigueur et sens du storytelling data`,
  },
  {
    title: 'Ingénieur(e) Réseau Radio (RAN)',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 25,
    status: 'publiee',
    requirements:
      'Réseaux mobiles, 4G/5G, RAN, Optimisation radio, Drive test, Troubleshooting',
    description: `Yas Togo recrute un(e) Ingénieur(e) Réseau Radio pour garantir la qualité et la performance du réseau mobile.

Missions
• Optimiser la couverture et la capacité RAN
• Analyser les KPIs radio et traiter les tickets incidents
• Participer aux projets de modernisation du réseau
• Coordonner avec les équipes terrain et les partenaires équipementiers

Profil
• Bac+5 télécoms / réseaux
• Expérience RAN (Huawei, Ericsson ou Nokia appréciée)
• Capacité d’astreinte et déplacements sur sites`,
  },
  {
    title: 'Technicien(ne) Fibre Optique FTTH',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 30,
    status: 'publiee',
    requirements:
      'Fibre optique, FTTH, Câblage, Mesures OTDR, Installation client, Sécurité chantier',
    description: `Renforcez l’équipe déploiement FTTH Yas Togo.

Missions
• Installer et raccordement clients fibre
• Réaliser les mesures et la mise en service
• Assurer le SAV et le dépannage
• Respecter les normes qualité et sécurité Yas

Profil
• Bac pro / BTS fibre ou expérience terrain équivalente
• Permis B indispensable
• Sens du service client`,
  },
  {
    title: 'Conseiller(ère) Clientèle — Boutique Yas',
    type: 'emploi',
    location: 'Lomé — Boulevard',
    deadlineDays: 20,
    status: 'publiee',
    requirements:
      'Relation client, Vente conseil, Produits télécoms, Mixx by Yas, Français, Ewe ou Mina',
    description: `Vous êtes le visage de Yas Togo en boutique.

Missions
• Accueillir et conseiller les clients
• Vendre forfaits, smartphones et services Mixx by Yas
• Traiter les demandes administratives (KYC, SIM, réclamations)
• Atteindre les objectifs individuels et d’équipe

Profil
• Bac+2 minimum, 1 an en vente / customer care
• Excellent relationnel et présentation soignée
• Langues locales appréciées`,
  },
  {
    title: 'Conseiller(ère) Clientèle — Kara',
    type: 'emploi',
    location: 'Kara',
    deadlineDays: 22,
    status: 'publiee',
    requirements: 'Relation client, Vente, Produits mobile, Caisse, Orientation résultats',
    description: `Yas Togo recrute pour sa boutique de Kara.

Missions
• Conseil et vente en point de vente
• Gestion de la caisse et du stock boutique
• Remontée des besoins clients vers le siège

Profil
• Expérience vente télécoms ou retail
• Dynamisme et autonomie`,
  },
  {
    title: 'Spécialiste Marketing Digital & Réseaux Sociaux',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 27,
    status: 'publiee',
    requirements:
      'Marketing digital, Social media, Meta Ads, Content, Canva, Analytics, Community management',
    description: `Au Marketing Yas Togo, vous animez la présence digitale de la marque.

Missions
• Piloter le calendrier éditorial (Facebook, Instagram, TikTok, LinkedIn)
• Créer ou brief des contenus engageants
• Gérer les campagnes paid social
• Analyser les performances et optimiser

Profil
• Bac+3/5 marketing digital
• Portfolio / exemples de campagnes
• Créativité + culture data`,
  },
  {
    title: 'Stage — Communication Interne & Événementiel',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 38,
    status: 'publiee',
    requirements:
      'Communication, Rédaction, Événementiel, Pack Office, Photo/vidéo, Réseaux sociaux',
    description: `Stage au sein de la Communication Interne Yas Togo.

Missions
• Contribuer aux newsletters et annonces internes
• Appuyer l’organisation d’événements collaborateurs
• Couvrir photos / vidéos des temps forts
• Soutenir les campagnes « Let’s grow together »

Profil
• Étudiant(e) en communication / journalisme
• Bonne plume et aisance relationnelle`,
  },
  {
    title: 'Comptable Fournisseur & Fiscalité',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 24,
    status: 'publiee',
    requirements:
      'Comptabilité, Fiscalité togolaise, SAP ou ERP, Excel, Facturation, Contrôle interne',
    description: `Direction Finance — poste Comptable Fournisseur & Fiscalité.

Missions
• Traiter les factures fournisseurs et les échéances
• Suivre la TVA et obligations fiscales
• Participer aux clôtures mensuelles
• Améliorer les process finance

Profil
• Bac+3/5 comptabilité / finance
• Expérience en télécoms ou industrie appréciée
• Rigueur et confidentialité`,
  },
  {
    title: 'Analyste Cybersécurité & SOC',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 26,
    status: 'publiee',
    requirements:
      'Cybersécurité, SOC, SIEM, Incident response, Réseaux, Normes ISO 27001',
    description: `Protégez les systèmes d’information Yas Togo.

Missions
• Surveiller les alertes SOC et traiter les incidents
• Renforcer les contrôles sécurité
• Sensibiliser les collaborateurs
• Participer aux audits et tests d’intrusion

Profil
• Bac+5 cybersécurité / réseaux
• Certifications (CompTIA Security+, CEH…) un plus
• Astreintes possibles`,
  },
  {
    title: 'Stage — UX/UI Design Produits Digitaux',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 42,
    status: 'publiee',
    requirements: 'Figma, UX research, UI design, Prototypage, Design system, Accessibilité',
    description: `Stage design au Product Studio Yas.

Missions
• Concevoir des maquettes Figma (app Mixx, selfcare, portails)
• Conduire des tests utilisateurs
• Contribuer au design system Yas
• Collaborer avec product owners et développeurs

Profil
• Portfolio design indispensable
• Sensibilité mobile-first Afrique`,
  },
  {
    title: 'Product Owner — Mixx by Yas',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 19,
    status: 'publiee',
    requirements:
      'Product ownership, Agile, Mobile money, Roadmap, User stories, Analytics',
    description: `Pilotez l’évolution du portefeuille produits Mixx by Yas (mobile money).

Missions
• Définir la roadmap produit avec le business
• Rédiger user stories et prioriser le backlog
• Suivre les KPIs d’adoption et de transaction
• Coordonner IT, Compliance, Marketing et Partenaires

Profil
• 4+ ans en product / fintech / télécoms
• Excellente communication stakeholders
• Culture data-driven`,
  },
  {
    title: 'Juriste Droit des Affaires & Télécoms',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 33,
    status: 'publiee',
    requirements:
      'Droit des affaires, Droit télécoms, Contrats, Contentieux, Compliance, Français juridique',
    description: `Direction Juridique Yas Togo.

Missions
• Rédiger et négocier contrats (fournisseurs, partenaires, distribution)
• Conseiller les directions métier
• Suivre la réglementation ARCEP / secteur
• Appuyer le contentieux

Profil
• Master 2 droit des affaires
• 3+ ans d’expérience
• Rigueur et sens du risque`,
  },
  {
    title: 'Chargé(e) de Formation & Développement RH',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 29,
    status: 'publiee',
    requirements:
      'Formation, Ingénierie pédagogique, LMS, Soft skills, Animation, Évaluation',
    description: `Vous développez les compétences des collaborateurs Yas Togo.

Missions
• Diagnostiquer les besoins de formation
• Concevoir et animer des parcours (présentiel / digital)
• Suivre l’efficacité des actions formation
• Accompagner les managers sur le feedback

Profil
• Expérience formateur / RH
• Aisance orale et créativité pédagogique`,
  },
  {
    title: 'Stage — Support IT & Helpdesk',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 36,
    status: 'publiee',
    requirements: 'Support utilisateurs, Windows, Active Directory, Ticketing, Réseaux LAN, Soft skills',
    description: `Stage Helpdesk au sein de l’IT Yas Togo.

Missions
• Prendre en charge les tickets N1
• Assister les utilisateurs (poste de travail, messagerie, VPN)
• Documenter les procédures
• Participer au déploiement de matériel

Profil
• BTS / Licence réseaux ou support
• Patience et pédagogie`,
  },
  {
    title: 'Responsable Qualité de Service Client (QoS)',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 23,
    status: 'publiee',
    requirements:
      'Qualité de service, NPS, Call center, Process, Lean, Reporting, Leadership',
    description: `Améliorez l’expérience client Yas de bout en bout.

Missions
• Suivre NPS, CES, délais de traitement
• Piloter les plans d’amélioration avec le contact center
• Auditer les parcours clients (boutique, app, USSD)
• Former les équipes aux standards Yas

Profil
• Expérience qualité / customer experience
• Leadership transverse`,
  },
  {
    title: 'Développeur(se) Mobile Flutter',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 31,
    status: 'publiee',
    requirements: 'Flutter, Dart, APIs REST, Firebase, CI/CD, Tests, Store publication',
    description: `Équipe Apps Yas — développement mobile Flutter.

Missions
• Développer et maintenir les apps Yas / Mixx
• Améliorer performance et accessibilité
• Collaborer avec UX et backend
• Participer aux releases Play Store / App Store

Profil
• 2+ ans Flutter en production
• Sens produit et qualité code`,
  },
  {
    title: 'Stage — Finance & Contrôle de Gestion',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 34,
    status: 'publiee',
    requirements: 'Contrôle de gestion, Excel, Budget, Analyse financière, Reporting, PowerPoint',
    description: `Stage Contrôle de Gestion Yas Togo.

Missions
• Appuyer le suivi budgétaire des directions
• Produire des analyses d’écarts
• Contribuer au reporting mensuel groupe
• Automatiser des fichiers Excel

Profil
• Master finance / contrôle de gestion
• Excellente maîtrise Excel`,
  },
  {
    title: 'Ingénieur(e) Core Network & IP',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 27,
    status: 'publiee',
    requirements: 'Core network, IP/MPLS, EPC/5GC, Routing, Haute disponibilité, Monitoring',
    description: `Garantir la disponibilité du cœur de réseau Yas.

Missions
• Exploiter et faire évoluer le core / IP
• Traiter les incidents critiques
• Participer aux projets de capacité et modernisation
• Documenter l’architecture

Profil
• Bac+5 réseaux
• Expérience opérateur télécoms
• Astreintes`,
  },
  {
    title: 'Community Manager — Programme SoWe',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 18,
    status: 'publiee',
    requirements:
      'Community management, Jeunesse, Événementiel, Content, Influence, Orientation résultats',
    description: `Animez la communauté SoWe (employabilité et immersion jeunes).

Missions
• Animer les réseaux et événements SoWe
• Relayer masterclass, immersions et opportunités stages
• Créer du contenu inspirant pour les jeunes
• Mesurer l’engagement et proposer des idées

Profil
• Passion pour l’employabilité des jeunes
• Expérience community / campus`,
  },
  {
    title: 'Chef(fe) de Projet Transformation Digitale RH',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 30,
    status: 'publiee',
    requirements:
      'Conduite de projet, SIRH, Change management, RH, Digitalisation, Stakeholders',
    description: `Digitalisez les process RH Yas Togo (évaluations, absences, onboarding…).

Missions
• Piloter les projets SIRH / digital RH
• Coordonner IT, RH et métiers
• Conduire le change et la formation utilisateurs
• Suivre budget, planning et risques

Profil
• 5+ ans en projets digitaux / RH
• Certification PMP / Prince2 un plus`,
  },
  {
    title: 'Stage — Marketing Offres & Pricing',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: 37,
    status: 'publiee',
    requirements: 'Marketing, Pricing, Analyse concurrentielle, Excel, Études de marché',
    description: `Stage Marketing Offres chez Yas Togo.

Missions
• Analyser la concurrence télécoms
• Appuyer le lancement de forfaits
• Suivre les performances d’offres
• Préparer des présentations COMEX

Profil
• Étudiant(e) marketing / économie
• Esprit analytique`,
  },
  {
    title: 'Superviseur(e) Contact Center',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 16,
    status: 'publiee',
    requirements:
      'Call center, Management de proximité, Qualité d’appel, Coaching, KPI, Soft skills',
    description: `Manager une équipe de conseillers clientèle à distance / centre d’appels.

Missions
• Superviser l’équipe au quotidien
• Coach qualité et performance
• Gérer les pics d’activité
• Remonter les irritants clients

Profil
• Expérience supervision call center
• Leadership bienveillant`,
  },
  {
    title: 'Architecte Solutions Cloud & DevOps',
    type: 'emploi',
    location: 'Lomé',
    deadlineDays: 41,
    status: 'brouillon',
    requirements: 'AWS/Azure, Kubernetes, Terraform, CI/CD, Observabilité, Sécurité cloud',
    description: `Brouillon — poste Architecte Cloud (non publié).

Missions prévues
• Définir l’architecture cloud Yas
• Industrialiser les déploiements
• Sécuriser et monitorer les plateformes`,
  },
  {
    title: 'Stage — Juridique & Compliance',
    type: 'stage',
    location: 'Lomé',
    deadlineDays: -10,
    status: 'fermee',
    requirements: 'Droit, Compliance, RGPD, Recherche juridique, Rédaction',
    description: `Offre fermée — stage juridique (archivée pour démo).`,
  },
];

const CANDIDATES = [
  {
    email: 'candidat@yascareer.tg',
    fullName: 'Afi Koffi',
    phone: '+22890000003',
    bio: 'Étudiante en informatique à l’Université de Lomé, passionnée par le digital et les télécoms.',
    skills: 'JavaScript, React, Communication, Git',
  },
  {
    email: 'kodjo.mensah@test.tg',
    fullName: 'Kodjo Mensah',
    phone: '+22890111222',
    bio: 'Commercial terrain avec 3 ans d’expérience en distribution FMCG au Togo.',
    skills: 'Vente, Négociation, Animation réseau, Leadership',
  },
  {
    email: 'ama.agbeko@test.tg',
    fullName: 'Ama Agbeko',
    phone: '+22890222333',
    bio: 'Diplômée en marketing digital, community manager freelance.',
    skills: 'Social media, Canva, Meta Ads, Rédaction',
  },
  {
    email: 'yawo.adjovi@test.tg',
    fullName: 'Yawo Adjovi',
    phone: '+22890333444',
    bio: 'Ingénieur télécoms junior, spécialisé réseaux mobiles.',
    skills: 'RAN, 4G, Drive test, Troubleshooting',
  },
  {
    email: 'esse.tchedre@test.tg',
    fullName: 'Essé Tchédre',
    phone: '+22890444555',
    bio: 'Comptable confirmée, expérience cabinet et entreprise.',
    skills: 'Comptabilité, Fiscalité, Excel, SAP',
  },
];

async function hash(pw: string) {
  return bcrypt.hash(pw, 10);
}

function addDays(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  // Reset business data for a clean demo dataset
  await prisma.interview.deleteMany();
  await prisma.applicationStatusHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.chatbotMessage.deleteMany();
  await prisma.offer.deleteMany();

  const password = await hash("Password123!");

  const admin = await prisma.user.upsert({
    where: { email: "admin@yascareer.tg" },
    update: {},
    create: {
      email: "admin@yascareer.tg",
      fullName: "Admin Yas Togo",
      password,
      role: "admin",
      phone: "+22890000001",
      isActive: true,
      mustChangePassword: false,
    },
  });

  const rh = await prisma.user.upsert({
    where: { email: "rh@yascareer.tg" },
    update: {},
    create: {
      email: "rh@yascareer.tg",
      fullName: "Kossi Amegbo — RH",
      password,
      role: "rh",
      phone: "+22890000002",
      isActive: true,
      mustChangePassword: false,
    },
  });

  await prisma.user.upsert({
    where: { email: "rh2@yascareer.tg" },
    update: {},
    create: {
      email: "rh2@yascareer.tg",
      fullName: "Akouvi Dossou — RH",
      password,
      role: "rh",
      phone: "+22890000004",
      isActive: true,
      mustChangePassword: false,
    },
  });

  for (const c of CANDIDATES) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        fullName: c.fullName,
        password,
        role: "candidat",
        phone: c.phone,
        isActive: true,
        mustChangePassword: false,
      },
    });
    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: { bio: c.bio, skills: c.skills },
      create: { userId: user.id, bio: c.bio, skills: c.skills, cvUrl: null },
    });
  }

  let published = 0;
  const createdOffers: { id: number; status: OfferStatus }[] = [];
  for (const item of OFFERS) {
    const offer = await prisma.offer.create({
      data: {
        title: item.title,
        type: item.type,
        description: item.description,
        requirements: item.requirements,
        deadline: addDays(item.deadlineDays),
        location: item.location,
        status: item.status,
        createdBy: rh.id,
      },
    });
    createdOffers.push({ id: offer.id, status: offer.status });
    if (item.status === "publiee") published++;
  }

  const candidats = await prisma.user.findMany({ where: { role: "candidat" } });
  const publishedOffers = createdOffers.filter((o) => o.status === "publiee");
  const demoTargets = publishedOffers.slice(0, 4);
  let appsCreated = 0;

  const letters = [
      'Je suis très motivé(e) pour rejoindre Yas Togo. Mon parcours digital et mes compétences en React, JavaScript et collaboration d’équipe correspondent bien au poste. Je souhaite contribuer à vos projets internes.',
      'Fort d’une expérience commerciale terrain, je maîtrise la vente, la négociation et l’animation de réseau. Yas Togo représente pour moi une opportunité d’impact national.',
      'Passionné(e) par le marketing digital et les réseaux sociaux, j’ai géré des campagnes Meta Ads et produit du contenu engageant. Je souhaite renforcer la marque Yas auprès des jeunes.',
      'Ingénieur télécoms junior, je travaille sur la RAN 4G, les drive tests et le troubleshooting. Je veux contribuer à la qualité du réseau Yas.',
      'Comptable confirmée, experte Excel, fiscalité et reporting. Je souhaite rejoindre la direction Finance de Yas Togo.',
    ];

  for (const [idx, offer] of demoTargets.entries()) {
    for (const [cIdx, candidat] of candidats.entries()) {
      if ((idx + cIdx) % 2 === 1 && cIdx > 2) continue;
      const application = await prisma.application.create({
        data: {
          offerId: offer.id,
          userId: candidat.id,
          cvUrl: null,
          coverLetterUrl: null,
          coverLetterText: letters[cIdx % letters.length],
          status: cIdx === 0 ? "en_cours_analyse" : "envoyee",
          appliedAt: addDays(-(cIdx + idx)),
        },
      });
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: application.status,
          changedBy: candidat.id,
          changedAt: new Date(),
        },
      });
      appsCreated++;
    }
  }

  console.log("Seed Yas Togo OK", {
    admin: admin.email,
    rh: rh.email,
    rh2: "rh2@yascareer.tg",
    offersTotal: OFFERS.length,
    offersPublished: published,
    applications: appsCreated,
    password: "Password123!",
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
