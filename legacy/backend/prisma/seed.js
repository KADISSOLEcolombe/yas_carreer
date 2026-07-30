'use strict';

require('dotenv').config();
const prisma = require('../src/lib/prisma');
const { hashPassword, getProfilIdFromType } = require('../src/lib/crypto');
const { analyserCorrespondance } = require('../src/lib/matching');

const PROFILS = [
  { id_profil: 7, nom_profil: 'Administrateur' },
  { id_profil: 8, nom_profil: 'Responsable RH' },
  { id_profil: 9, nom_profil: 'RH' },
  { id_profil: 10, nom_profil: 'Superviseur' },
  { id_profil: 11, nom_profil: 'Candidat' },
];

/** Droits utilisés par requirePermission dans les routes */
const DROITS = [
  { nom: 'postuler', description: 'Postuler à une offre' },
  { nom: 'gerer_ses_candidatures', description: 'Gérer ses propres candidatures' },
  { nom: 'consulter_candidature', description: 'Consulter les candidatures' },
  { nom: 'changer_statut_candidature', description: 'Changer le statut d’une candidature' },
  { nom: 'consulter_offre', description: 'Consulter les offres (RH)' },
  { nom: 'creer_offre', description: 'Créer une offre' },
  { nom: 'modifier_offre', description: 'Modifier une offre' },
  { nom: 'publier_offre', description: 'Publier / dépublier une offre' },
  { nom: 'supprimer_offre', description: 'Supprimer une offre' },
  { nom: 'planifier_entretien', description: 'Planifier un entretien' },
  { nom: 'consulter_entretien', description: 'Consulter les entretiens' },
  { nom: 'modifier_entretien', description: 'Modifier un entretien' },
  { nom: 'annuler_entretien', description: 'Annuler un entretien' },
  { nom: 'creer_evaluation', description: 'Créer une évaluation' },
  { nom: 'consulter_ses_evaluations', description: 'Consulter ses évaluations' },
  { nom: 'creer_compte_rh', description: 'Créer un compte RH' },
  { nom: 'creer_compte_superviseur', description: 'Créer un compte superviseur' },
  { nom: 'gerer_utilisateur', description: 'Gérer les utilisateurs' },
  { nom: 'desactiver_compte', description: 'Désactiver un compte' },
  { nom: 'voir_statistique', description: 'Voir les statistiques' },
];

const DROITS_PAR_PROFIL = {
  7: DROITS.map((d) => d.nom), // Admin = tout
  8: [
    'consulter_candidature',
    'changer_statut_candidature',
    'consulter_offre',
    'creer_offre',
    'modifier_offre',
    'publier_offre',
    'supprimer_offre',
    'planifier_entretien',
    'consulter_entretien',
    'modifier_entretien',
    'annuler_entretien',
    'voir_statistique',
  ],
  9: [
    'consulter_candidature',
    'changer_statut_candidature',
    'consulter_offre',
    'creer_offre',
    'modifier_offre',
    'publier_offre',
    'supprimer_offre',
    'planifier_entretien',
    'consulter_entretien',
    'modifier_entretien',
    'annuler_entretien',
  ],
  10: ['creer_evaluation', 'consulter_ses_evaluations', 'consulter_entretien'],
  11: ['postuler', 'gerer_ses_candidatures'],
};

const DEPARTEMENTS = [
  { nom: 'Informatique', description: 'Développement, réseaux et systèmes' },
  { nom: 'Ressources Humaines', description: 'Recrutement et gestion du personnel' },
  { nom: 'Marketing', description: 'Communication et acquisition' },
  { nom: 'Finance', description: 'Comptabilité et contrôle de gestion' },
];

const USERS = [
  {
    email: 'admin@yastogo.tg',
    password: 'admin123456',
    nom: 'Koffi',
    prenom: 'Admin',
    type: 'Administrateur',
    telephone: '90000001',
    quartier: 'Agoè',
    ville: 'Lomé',
  },
  {
    email: 'rh@yastogo.tg',
    password: 'rh123456',
    nom: 'Mensah',
    prenom: 'Afi',
    type: 'RH',
    telephone: '90000002',
    quartier: 'Tokoin',
    ville: 'Lomé',
  },
  {
    email: 'superviseur@yastogo.tg',
    password: 'super123456',
    nom: 'Agbéko',
    prenom: 'Jean',
    type: 'Superviseur',
    telephone: '90000003',
    quartier: 'Bè',
    ville: 'Lomé',
  },
  {
    email: 'superviseur2@yastogo.tg',
    password: 'super123456',
    nom: 'Amivi',
    prenom: 'Grace',
    type: 'Superviseur',
    telephone: '90000004',
    quartier: 'Adidogomé',
    ville: 'Lomé',
  },
  {
    email: 'candidat1@test.tg',
    password: 'candidat123',
    nom: 'Doe',
    prenom: 'Kodjo',
    type: 'Candidat',
    telephone: '90111111',
    quartier: 'Nukafu',
    ville: 'Lomé',
    sexe: 'Masculin',
    annees_experience: 2,
    niveau_etude: 'Bac+3',
    domaine_etudes: 'Informatique',
    competences: 'React, Node.js, SQL, Git',
  },
  {
    email: 'candidat2@test.tg',
    password: 'candidat123',
    nom: 'Amoussou',
    prenom: 'Akouvi',
    type: 'Candidat',
    telephone: '90222222',
    quartier: 'Hédzranawoé',
    ville: 'Lomé',
    sexe: 'Féminin',
    annees_experience: 1,
    niveau_etude: 'Bac+5',
    domaine_etudes: 'Marketing',
    competences: 'Marketing digital, Canva, SEO, Rédaction',
  },
  {
    email: 'candidat3@test.tg',
    password: 'candidat123',
    nom: 'Togbé',
    prenom: 'Yves',
    type: 'Candidat',
    telephone: '90333333',
    quartier: 'Kara-centre',
    ville: 'Kara',
    sexe: 'Masculin',
    annees_experience: 0,
    niveau_etude: 'Bac+2',
    domaine_etudes: 'Informatique',
    competences: 'HTML, CSS, JavaScript',
  },
  {
    email: 'candidat4@test.tg',
    password: 'candidat123',
    nom: 'Sessou',
    prenom: 'Nina',
    type: 'Candidat',
    telephone: '90444444',
    quartier: 'Nyékonakpoè',
    ville: 'Lomé',
    sexe: 'Féminin',
    annees_experience: 3,
    niveau_etude: 'Bac+5',
    domaine_etudes: 'Finance',
    competences: 'Excel, Comptabilité, Analyse financière',
  },
];

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function ensureDroits() {
  const byNom = {};
  for (const d of DROITS) {
    const existing = await prisma.droit.findFirst({ where: { nom: d.nom } });
    const row = existing
      ? await prisma.droit.update({
          where: { id: existing.id },
          data: { description: d.description, statut: true, supprime: false },
        })
      : await prisma.droit.create({
          data: { nom: d.nom, description: d.description, statut: true, supprime: false },
        });
    byNom[d.nom] = row;
  }
  console.log(`Droits prêts (${Object.keys(byNom).length})`);
  return byNom;
}

async function ensureProfils(droitsByNom) {
  for (const p of PROFILS) {
    await prisma.profil.upsert({
      where: { id_profil: p.id_profil },
      update: { nom_profil: p.nom_profil, supprime: false },
      create: { id_profil: p.id_profil, nom_profil: p.nom_profil, supprime: false },
    });

    // Réinitialise les droits du profil pour coller à la config
    await prisma.profil_droit.deleteMany({ where: { pro_id_profil: p.id_profil } });

    const noms = DROITS_PAR_PROFIL[p.id_profil] || [];
    for (const nomDroit of noms) {
      const droit = droitsByNom[nomDroit];
      if (!droit) continue;
      await prisma.profil_droit.create({
        data: { pro_id_profil: p.id_profil, id_droit: droit.id },
      });
    }
  }
  console.log('Profils + droits liés (ids 7–11)');
}

async function ensureDepartements() {
  const map = {};
  for (const dep of DEPARTEMENTS) {
    const row = await prisma.departement.upsert({
      where: { nom: dep.nom },
      update: { description: dep.description, supprime: false },
      create: { nom: dep.nom, description: dep.description, supprime: false },
    });
    map[dep.nom] = row;
  }
  console.log(`Départements prêts (${Object.keys(map).length})`);
  return map;
}

async function ensureUser(u, depId = null) {
  const email = u.email.toLowerCase();
  const idProfil = getProfilIdFromType(u.type);
  const data = {
    nom: u.nom,
    prenom: u.prenom,
    mot_de_passe: hashPassword(u.password),
    telephone: u.telephone,
    quartier: u.quartier,
    type: u.type,
    supprime: false,
    sexe: u.sexe || null,
    ville: u.ville || null,
    annees_experience: u.annees_experience ?? null,
    niveau_etude: u.niveau_etude || null,
    domaine_etudes: u.domaine_etudes || null,
    competences: u.competences || null,
    dep_id: depId,
  };

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    const user = await prisma.utilisateur.update({ where: { email }, data });
    if (idProfil) {
      await prisma.utilisateur_profil.upsert({
        where: {
          id_utilisateur_id_profil: { id_utilisateur: user.id, id_profil: idProfil },
        },
        update: {},
        create: { id_utilisateur: user.id, id_profil: idProfil },
      });
    }
    console.log(`Maj : ${email} / ${u.password} (${u.type})`);
    return user;
  }

  const user = await prisma.utilisateur.create({
    data: {
      email,
      ...data,
      utilisateur_profil: idProfil ? { create: [{ id_profil: idProfil }] } : undefined,
    },
  });
  console.log(`Créé : ${email} / ${u.password} (${u.type})`);
  return user;
}

async function clearTransactionalDemo() {
  await prisma.evaluation.deleteMany({});
  await prisma.emploi.deleteMany({});
  await prisma.entretien.deleteMany({});
  await prisma.historique_statut.deleteMany({});
  await prisma.fichier.deleteMany({});
  await prisma.favori.deleteMany({});
  await prisma.candidature.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.offre.deleteMany({});
  console.log('Données transactionnelles réinitialisées (offres, candidatures, etc.)');
}

async function seedOffres(rh, deps) {
  const offresData = [
    {
      titre: 'Développeur Full Stack Junior',
      type: 'CDI',
      localisation: 'Lomé',
      dep: 'Informatique',
      statut: 'PUBLIEE',
      competences: 'React, Node.js, SQL, Git',
      exigence: 'Maîtrise de React et Node.js. Bonne connaissance SQL. Esprit d’équipe.',
      exigences_fichier: 'CV, Lettre de motivation',
    },
    {
      titre: 'Stage Marketing Digital',
      type: 'Stage',
      localisation: 'Lomé',
      dep: 'Marketing',
      statut: 'PUBLIEE',
      competences: 'Marketing digital, SEO, Canva, Réseaux sociaux',
      exigence: 'Intérêt pour le digital et les réseaux sociaux. Créativité.',
      exigences_fichier: 'CV',
    },
    {
      titre: 'Assistant Comptable',
      type: 'CDD',
      localisation: 'Lomé',
      dep: 'Finance',
      statut: 'PUBLIEE',
      competences: 'Excel, Comptabilité, Analyse financière',
      exigence: 'Bases solides en comptabilité générale. Maîtrise d’Excel.',
      exigences_fichier: 'CV, Diplômes',
    },
    {
      titre: 'Stagiaire Support IT',
      type: 'Stage',
      localisation: 'Kara',
      dep: 'Informatique',
      statut: 'PUBLIEE',
      competences: 'HTML, CSS, JavaScript, Support',
      exigence: 'Connaissances web de base. Disponibilité et autonomie.',
      exigences_fichier: 'CV',
    },
    {
      titre: 'Chargé de recrutement (brouillon)',
      type: 'CDI',
      localisation: 'Lomé',
      dep: 'Ressources Humaines',
      statut: 'BROUILLON',
      competences: 'Recrutement, Communication, Excel',
      exigence: 'Expérience RH souhaitée.',
      exigences_fichier: 'CV, Lettre',
    },
  ];

  const created = [];
  for (const o of offresData) {
    const offre = await prisma.offre.create({
      data: {
        titre: o.titre,
        type: o.type,
        localisation: o.localisation,
        dep_id: deps[o.dep].id,
        utilisateurrh_id: rh.id,
        date_publication: daysFromNow(-3),
        date_limite: daysFromNow(30),
        exigence: o.exigence,
        exigences_fichier: o.exigences_fichier,
        competences: o.competences,
        statut: o.statut,
        supprime: false,
      },
    });
    created.push(offre);
  }
  console.log(`Offres créées (${created.length})`);
  return created;
}

async function seedCandidatures(candidats, offres, rh) {
  const [c1, c2, c3, c4] = candidats;
  const [offreDev, offreMkt, offreCompta, offreSupport] = offres;

  const specs = [
    { candidat: c1, offre: offreDev, statut: 'EN_ATTENTE' },
    { candidat: c1, offre: offreSupport, statut: 'EN_EXAMEN' },
    { candidat: c2, offre: offreMkt, statut: 'ENTRETIEN' },
    { candidat: c3, offre: offreDev, statut: 'EN_ATTENTE' },
    { candidat: c3, offre: offreSupport, statut: 'ACCEPTEE' },
    { candidat: c4, offre: offreCompta, statut: 'REJETEE' },
    { candidat: c4, offre: offreMkt, statut: 'EN_EXAMEN' },
  ];

  const created = [];
  for (const s of specs) {
    const analyse = analyserCorrespondance({
      competencesCandidat: s.candidat.competences,
      competencesOffre: s.offre.competences,
      villeCandidat: s.candidat.ville,
      localisationOffre: s.offre.localisation,
    });

    const candidature = await prisma.candidature.create({
      data: {
        id_offre: s.offre.id,
        utilisateurcand_id: s.candidat.id,
        statut: s.statut,
        date_soumission: daysFromNow(-2),
        score: analyse.score,
        supprime: false,
      },
    });

    await prisma.historique_statut.create({
      data: {
        id_candidature: candidature.id,
        ancien_statut: null,
        nouveau_statut: 'EN_ATTENTE',
        id_auteur: s.candidat.id,
      },
    });

    if (s.statut !== 'EN_ATTENTE') {
      await prisma.historique_statut.create({
        data: {
          id_candidature: candidature.id,
          ancien_statut: 'EN_ATTENTE',
          nouveau_statut: s.statut,
          id_auteur: rh.id,
        },
      });
    }

    created.push({ ...candidature, _meta: s });
  }
  console.log(`Candidatures créées (${created.length})`);
  return created;
}

async function seedEntretiens(candidatures, rh, superviseur) {
  const enEntretien = candidatures.find((c) => c.statut === 'ENTRETIEN');
  if (!enEntretien) return null;

  const entretien = await prisma.entretien.create({
    data: {
      date: daysFromNow(5),
      type: 'visio',
      statut: 'PLANIFIE',
      commentaire: 'Entretien technique et motivation',
      id_candidature: enEntretien.id,
      utilisateurrh_id: rh.id,
      utilisateursup_id: superviseur.id,
      lien_meeting: 'https://meet.google.com/yas-demo-entretien',
      plateforme: 'Google Meet',
      duree: 45,
      supprime: false,
    },
  });
  console.log(`Entretien planifié (id=${entretien.id})`);
  return entretien;
}

async function seedEmploi(candidatures, superviseur, deps) {
  const acceptee = candidatures.find((c) => c.statut === 'ACCEPTEE');
  if (!acceptee) return null;

  const emploi = await prisma.emploi.create({
    data: {
      can_id: acceptee.id,
      id_departement: deps.Informatique.id,
      date_debut: daysFromNow(-10),
      date_fin: daysFromNow(80),
      sujet: 'Stage Support IT — YAS Togo',
      lieu: 'Kara',
      statut: 'EN_COURS',
      utilisateursup_id: superviseur.id,
      supprime: false,
    },
  });
  console.log(`Affectation créée (id=${emploi.id}) pour superviseur ${superviseur.email}`);
  return emploi;
}

async function seedNotifications(users) {
  const [admin, rh, superviseur, , c1, c2] = users;
  const items = [
    {
      id_utilisateur: c1.id,
      titre: 'Bienvenue sur YAS Career',
      contenu: 'Complète ton profil et postule aux offres disponibles.',
      type: 'systeme',
    },
    {
      id_utilisateur: c2.id,
      titre: 'Entretien planifié',
      contenu: 'Un entretien a été planifié pour ta candidature Marketing Digital.',
      type: 'entretien',
    },
    {
      id_utilisateur: rh.id,
      titre: 'Nouvelles candidatures',
      contenu: 'Plusieurs candidatures attendent ton examen.',
      type: 'candidature',
    },
    {
      id_utilisateur: superviseur.id,
      titre: 'Nouvelle affectation',
      contenu: 'Un stagiaire Support IT t’a été affecté pour suivi et rapport.',
      type: 'affectation',
    },
    {
      id_utilisateur: admin.id,
      titre: 'Plateforme prête',
      contenu: 'Les données de démonstration ont été chargées.',
      type: 'systeme',
    },
  ];

  for (const n of items) {
    await prisma.notification.create({
      data: { ...n, lu: false, supprime: false },
    });
  }
  console.log(`Notifications créées (${items.length})`);
}

async function seedFavoris(candidat, offres) {
  await prisma.favori.create({
    data: { id_utilisateur: candidat.id, id_offre: offres[0].id },
  });
  await prisma.favori.create({
    data: { id_utilisateur: candidat.id, id_offre: offres[1].id },
  });
  console.log('Favoris candidat1 créés');
}

async function main() {
  console.log('=== Seed YAS Career (données de test) ===\n');

  const droitsByNom = await ensureDroits();
  await ensureProfils(droitsByNom);
  const deps = await ensureDepartements();

  const users = [];
  for (const u of USERS) {
    const depId =
      u.type === 'Superviseur'
        ? deps.Informatique.id
        : u.type === 'RH'
          ? deps['Ressources Humaines'].id
          : null;
    users.push(await ensureUser(u, depId));
  }

  const [admin, rh, superviseur, superviseur2, c1, c2, c3, c4] = users;

  await clearTransactionalDemo();

  const offres = await seedOffres(rh, deps);
  const candidatures = await seedCandidatures([c1, c2, c3, c4], offres, rh);
  await seedEntretiens(candidatures, rh, superviseur2);
  await seedEmploi(candidatures, superviseur, deps);
  await seedNotifications(users);
  await seedFavoris(c1, offres);

  console.log('\n=== Comptes de test ===');
  console.log('Admin        : admin@yastogo.tg / admin123456');
  console.log('RH           : rh@yastogo.tg / rh123456');
  console.log('Superviseur  : superviseur@yastogo.tg / super123456  (a une personne à évaluer)');
  console.log('Superviseur2 : superviseur2@yastogo.tg / super123456');
  console.log('Candidat 1   : candidat1@test.tg / candidat123');
  console.log('Candidat 2   : candidat2@test.tg / candidat123  (entretien planifié)');
  console.log('Candidat 3   : candidat3@test.tg / candidat123  (accepté + affecté)');
  console.log('Candidat 4   : candidat4@test.tg / candidat123');
  console.log('\nSeed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
