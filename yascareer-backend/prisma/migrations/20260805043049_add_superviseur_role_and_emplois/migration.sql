-- CreateEnum
CREATE TYPE "InterviewRequestStatus" AS ENUM ('en_attente', 'disponible', 'indisponible');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('stage', 'cdd', 'cdi');

-- CreateEnum
CREATE TYPE "EmploiStatus" AS ENUM ('actif', 'termine');

-- CreateEnum
CREATE TYPE "SupervisionNoteType" AS ENUM ('rapport', 'evaluation', 'observation');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'superviseur';

-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "supervisor_id" INTEGER;

-- CreateTable
CREATE TABLE "interview_requests" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "requested_by" INTEGER NOT NULL,
    "status" "InterviewRequestStatus" NOT NULL DEFAULT 'en_attente',
    "availability_note" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "interview_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emplois" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "supervisor_id" INTEGER NOT NULL,
    "department" TEXT,
    "contract_type" "ContractType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "status" "EmploiStatus" NOT NULL DEFAULT 'actif',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "emplois_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supervision_notes" (
    "id" SERIAL NOT NULL,
    "emploi_id" INTEGER NOT NULL,
    "author_id" INTEGER NOT NULL,
    "type" "SupervisionNoteType" NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "supervision_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "interview_requests_application_id_idx" ON "interview_requests"("application_id");

-- CreateIndex
CREATE INDEX "interview_requests_supervisor_id_idx" ON "interview_requests"("supervisor_id");

-- CreateIndex
CREATE UNIQUE INDEX "emplois_application_id_key" ON "emplois"("application_id");

-- CreateIndex
CREATE INDEX "emplois_supervisor_id_idx" ON "emplois"("supervisor_id");

-- CreateIndex
CREATE INDEX "emplois_user_id_idx" ON "emplois"("user_id");

-- CreateIndex
CREATE INDEX "supervision_notes_emploi_id_idx" ON "supervision_notes"("emploi_id");

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_requests" ADD CONSTRAINT "interview_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emplois" ADD CONSTRAINT "emplois_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emplois" ADD CONSTRAINT "emplois_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emplois" ADD CONSTRAINT "emplois_supervisor_id_fkey" FOREIGN KEY ("supervisor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervision_notes" ADD CONSTRAINT "supervision_notes_emploi_id_fkey" FOREIGN KEY ("emploi_id") REFERENCES "emplois"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supervision_notes" ADD CONSTRAINT "supervision_notes_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
