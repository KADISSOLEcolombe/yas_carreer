-- Link supervisors to a Departement (nullable — only meaningful for the
-- "superviseur" role, does not affect existing rows).
ALTER TABLE "users" ADD COLUMN "departement_id" INTEGER;
ALTER TABLE "users" ADD CONSTRAINT "users_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "departements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Structured availability slots submitted by a supervisor, used by the
-- automatic interview-slot generator (existing free-text availability_note
-- is kept as-is for backward compatibility / optional context).
ALTER TABLE "interview_requests" ADD COLUMN "available_slots" JSONB;
