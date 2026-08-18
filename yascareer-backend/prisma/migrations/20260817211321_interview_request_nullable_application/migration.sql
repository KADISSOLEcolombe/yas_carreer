-- Allow InterviewRequest.application_id to be null — a generic availability
-- request (not tied to any specific candidature) is now possible. Existing
-- rows keep their application_id untouched; the FK constraint itself still
-- applies whenever a value is present.
ALTER TABLE "interview_requests" ALTER COLUMN "application_id" DROP NOT NULL;
