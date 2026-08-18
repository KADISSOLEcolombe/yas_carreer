ALTER TABLE "supervision_notes" ALTER COLUMN "emploi_id" DROP NOT NULL;
ALTER TABLE "supervision_notes" ADD COLUMN "application_id" INTEGER;
ALTER TABLE "supervision_notes" ADD COLUMN "recommendation" TEXT;
ALTER TABLE "supervision_notes"
  ADD CONSTRAINT "supervision_notes_application_id_fkey"
  FOREIGN KEY ("application_id") REFERENCES "applications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "supervision_notes_application_id_idx" ON "supervision_notes"("application_id");
