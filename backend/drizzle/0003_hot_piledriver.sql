CREATE TABLE IF NOT EXISTS "referral_submissions" (
	"id" serial PRIMARY KEY NOT NULL,
	"submission_uid" varchar(64) NOT NULL,
	"form_id" integer,
	"query_type" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'submitted' NOT NULL,
	"user_name" varchar(200),
	"user_email" varchar(200),
	"form_data" jsonb NOT NULL,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "referral_submissions_submission_uid_key" UNIQUE("submission_uid")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "referral_submissions" ADD CONSTRAINT "referral_submissions_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
