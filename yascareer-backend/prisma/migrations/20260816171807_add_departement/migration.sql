-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "departement_id" INTEGER;

-- CreateTable
CREATE TABLE "departements" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "departements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed a starter list of departments so the selector isn't empty out of the box.
INSERT INTO "departements" ("nom", "description") VALUES
    ('Informatique', 'Développement, infrastructure et systèmes d''information'),
    ('Marketing', 'Communication, marque et acquisition'),
    ('Finance', 'Comptabilité, contrôle de gestion et trésorerie'),
    ('Ressources Humaines', 'Recrutement, formation et administration du personnel'),
    ('Commercial & Ventes', 'Développement commercial et relation client'),
    ('Opérations', 'Réseau, exploitation et support technique'),
    ('Juridique', 'Conformité, contrats et affaires réglementaires');
