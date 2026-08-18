-- Convert offers.documents_requis from text[] (plain names) to jsonb
-- (array of { nom, obligatoire, description? }). No offer currently has a
-- non-empty documents_requis (verified before running this migration), so
-- every row is simply reset to an empty array — nothing to preserve.
ALTER TABLE "offers"
  ALTER COLUMN "documents_requis" DROP DEFAULT,
  ALTER COLUMN "documents_requis" TYPE JSONB USING '[]'::jsonb,
  ALTER COLUMN "documents_requis" SET DEFAULT '[]';
