require('dotenv').config();
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const { hashPassword } = require('../src/lib/crypto');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = 'admin@yascareer.com';

  const existing = await prisma.utilisateur.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const admin = await prisma.utilisateur.create({
      data: {
        nom: 'Administrateur',
        email: adminEmail,
        mot_de_passe: hashPassword('admin123456'),
        statut: true,
        administrateur: { create: {} },
      },
    });
    console.log(`Compte Admin créé : ${adminEmail} / admin123456 (id=${admin.id})`);
  } else {
    console.log('Compte Admin déjà existant');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
