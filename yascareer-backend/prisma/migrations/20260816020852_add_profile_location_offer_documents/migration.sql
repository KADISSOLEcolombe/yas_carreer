-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "documents_urls" JSONB;

-- AlterTable
ALTER TABLE "candidate_profiles" ADD COLUMN     "annees_etude" TEXT,
ADD COLUMN     "quartier" TEXT,
ADD COLUMN     "ville" TEXT;

-- AlterTable
ALTER TABLE "offers" ADD COLUMN     "documents_requis" TEXT[] DEFAULT ARRAY[]::TEXT[];
