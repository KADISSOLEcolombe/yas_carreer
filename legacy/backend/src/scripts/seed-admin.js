'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const prisma = require('../lib/prisma');
const { hashPassword, getProfilIdFromType } = require('../lib/crypto');

async function main() {
  const email = 'admin@yas.com';

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    console.log(`Administrateur déjà existant (id: ${existing.id}, email: ${existing.email}).`);
    return;
  }

  const admin = await prisma.utilisateur.create({
    data: {
      nom: 'Admin',
      prenom: 'YAS',
      email,
      mot_de_passe: hashPassword('Admin123'),
      telephone: '0000000000',
      quartier: 'Siège',
      type: 'Administrateur',
      supprime: false,
      utilisateur_profil: {
        create: [{ id_profil: getProfilIdFromType('Administrateur') }],
      },
    },
  });

  console.log(`Administrateur créé avec succès : ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((e) => {
    console.error('Erreur seed-admin :', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
