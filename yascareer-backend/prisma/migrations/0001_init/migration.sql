-- YasCareer initial schema (PostgreSQL)

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'rh', 'candidat');
CREATE TYPE "OfferType" AS ENUM ('stage', 'emploi');
CREATE TYPE "OfferStatus" AS ENUM ('brouillon', 'publiee', 'fermee');
CREATE TYPE "ApplicationStatus" AS ENUM ('envoyee', 'en_cours_analyse', 'entretien_programme', 'acceptee', 'rejetee');
CREATE TYPE "InterviewMode" AS ENUM ('presentiel', 'distanciel');
CREATE TYPE "InterviewStatus" AS ENUM ('planifie', 'termine', 'annule');
CREATE TYPE "ChatRole" AS ENUM ('user', 'assistant');

-- CreateTable users
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" TEXT,
    "email" VARCHAR(254) NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'candidat',
    "phone" VARCHAR(30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "must_change_password" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable candidate_profiles
CREATE TABLE "candidate_profiles" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "bio" TEXT,
    "skills" TEXT,
    "cv_url" TEXT,
    "ai_extracted_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "candidate_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "candidate_profiles_user_id_key" ON "candidate_profiles"("user_id");

-- CreateTable offers
CREATE TABLE "offers" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "type" "OfferType" NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT,
    "deadline" TIMESTAMP(3),
    "location" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'brouillon',
    "ai_analysis_criteria" TEXT,
    "created_by" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable applications
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "offer_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cv_url" TEXT,
    "cover_letter_url" TEXT,
    "cover_letter_text" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'envoyee',
    "ai_match_score" INTEGER,
    "ai_summary" TEXT,
    "ai_analyzed_at" TIMESTAMP(3),
    "ai_analysis_data" JSONB,
    "applied_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "applications_offer_id_user_id_key" ON "applications"("offer_id", "user_id");

-- CreateTable application_status_histories
CREATE TABLE "application_status_histories" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "application_status_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable interviews
CREATE TABLE "interviews" (
    "id" SERIAL NOT NULL,
    "application_id" INTEGER NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "meeting_link" TEXT,
    "mode" "InterviewMode" NOT NULL DEFAULT 'distanciel',
    "status" "InterviewStatus" NOT NULL DEFAULT 'planifie',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "interviews_application_id_key" ON "interviews"("application_id");

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable chatbot_messages
CREATE TABLE "chatbot_messages" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "role" "ChatRole" NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    CONSTRAINT "chatbot_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable activity_logs
CREATE TABLE "activity_logs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" VARCHAR(80) NOT NULL,
    "category" VARCHAR(40) NOT NULL DEFAULT 'general',
    "summary" VARCHAR(500) NOT NULL,
    "resource_type" VARCHAR(60),
    "resource_id" INTEGER,
    "metadata" JSONB,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "activity_logs_user_id_created_at_idx" ON "activity_logs"("user_id", "created_at");
CREATE INDEX "activity_logs_action_idx" ON "activity_logs"("action");
CREATE INDEX "activity_logs_category_idx" ON "activity_logs"("category");

-- Foreign keys
ALTER TABLE "candidate_profiles" ADD CONSTRAINT "candidate_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "offers" ADD CONSTRAINT "offers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_status_histories" ADD CONSTRAINT "application_status_histories_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_status_histories" ADD CONSTRAINT "application_status_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chatbot_messages" ADD CONSTRAINT "chatbot_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
