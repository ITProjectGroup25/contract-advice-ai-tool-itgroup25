-- Add missing tables that exist in schema.ts but not in previous migrations

-- Create grant_support_submissions table
CREATE TABLE IF NOT EXISTS "grant_support_submissions" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "submission_uid" VARCHAR(40) NOT NULL,
  "query_type" VARCHAR(16) NOT NULL,
  "status" VARCHAR(32) DEFAULT 'submitted' NOT NULL,
  "user_email" VARCHAR(320),
  "user_name" VARCHAR(200),
  "form_data" JSONB NOT NULL,
  "user_satisfied" BOOLEAN,
  "needs_human_review" BOOLEAN,
  "created_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMPTZ DEFAULT now() NOT NULL,
  CONSTRAINT "grant_support_submissions_submission_uid_key" UNIQUE("submission_uid")
);

-- Create indexes for grant_support_submissions
CREATE INDEX IF NOT EXISTS "idx_grant_support_submissions_created_at" 
  ON "grant_support_submissions"("created_at" DESC);

CREATE INDEX IF NOT EXISTS "idx_grant_support_submissions_status" 
  ON "grant_support_submissions"("status");

CREATE INDEX IF NOT EXISTS "idx_grant_support_submissions_query_type" 
  ON "grant_support_submissions"("query_type");

--> statement-breakpoint

-- Create grant_support_faqs table
CREATE TABLE IF NOT EXISTS "grant_support_faqs" (
  "id" BIGSERIAL PRIMARY KEY NOT NULL,
  "form_id" INTEGER,
  "selections" JSONB,
  "answer" TEXT,
  "created_at" TIMESTAMPTZ DEFAULT now(),
  "updated_at" TIMESTAMPTZ DEFAULT now(),
  "name" TEXT
);

-- Create indexes for grant_support_faqs
CREATE INDEX IF NOT EXISTS "idx_grant_support_faqs_form_id" 
  ON "grant_support_faqs"("form_id");

CREATE INDEX IF NOT EXISTS "idx_grant_support_faqs_selections" 
  ON "grant_support_faqs" USING GIN ("selections");

-- Add foreign key for grant_support_faqs
DO $$ BEGIN
 ALTER TABLE "grant_support_faqs" ADD CONSTRAINT "fk_grant_support_faqs_form" 
 FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Add unique constraint
DO $$ BEGIN
 ALTER TABLE "grant_support_faqs" ADD CONSTRAINT "grant_support_faqs_name_key" UNIQUE("name");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

--> statement-breakpoint

-- Create user_google_tokens table
CREATE TABLE IF NOT EXISTS "user_google_tokens" (
  "user_id" TEXT PRIMARY KEY NOT NULL,
  "access_token" TEXT,
  "refresh_token" TEXT,
  "expiry_date" TIMESTAMPTZ,
  "scope" TEXT,
  "token_type" TEXT
);

--> statement-breakpoint

-- Create email_config table
CREATE TABLE IF NOT EXISTS "email_config" (
  "id" SERIAL PRIMARY KEY NOT NULL,
  "service_id" TEXT,
  "public_key" TEXT,
  "template_ids" JSONB,
  "grant_team_email" TEXT,
  "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


