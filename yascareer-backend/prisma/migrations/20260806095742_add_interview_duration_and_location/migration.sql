-- AlterTable
ALTER TABLE "interviews" ADD COLUMN     "duration_minutes" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "location" TEXT;
