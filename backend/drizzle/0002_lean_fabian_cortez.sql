DO $$ BEGIN
 CREATE TYPE "audience_enum" AS ENUM('Requestor', 'Admin', 'Both');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "branch_effect_enum" AS ENUM('Show', 'Hide', 'Require', 'JumpTo');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "buckettype" AS ENUM('STANDARD', 'ANALYTICS');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "email_status_enum" AS ENUM('Queued', 'Sent', 'Failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "export_format_enum" AS ENUM('CSV', 'XLSX');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "export_status_enum" AS ENUM('Queued', 'Running', 'Completed', 'Failed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "form_status_enum" AS ENUM('Draft', 'Active', 'Archived');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "match_type_enum" AS ENUM('Exact', 'Contains', 'Regex');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "org_unit_type_enum" AS ENUM('Faculty', 'Department', 'School', 'Center', 'Other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "q_type_enum" AS ENUM('ShortText', 'LongText', 'Select', 'MultiSelect', 'File', 'Date', 'Email', 'Number');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "resource_type_enum" AS ENUM('Link', 'HTML', 'File', 'Video');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "rule_type_enum" AS ENUM('Regex', 'Range', 'EmailFormat', 'FileType', 'FileSize');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "submission_status_enum" AS ENUM('Stored', 'EmailQueued', 'EmailSent', 'EmailFailed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "workflow_type_enum" AS ENUM('Simple', 'Complex');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_user" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_user_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin_user_role" (
	"admin_user_id" bigint NOT NULL,
	"role_name" varchar(50) NOT NULL,
	CONSTRAINT "admin_user_role_pkey" PRIMARY KEY("admin_user_id","role_name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answer" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"value_text" text,
	"recorded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_answer_unique" UNIQUE("submission_id","question_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "answer_multi_value" (
	"answer_id" bigint NOT NULL,
	"item_value" varchar(255) NOT NULL,
	CONSTRAINT "answer_multi_value_pkey" PRIMARY KEY("answer_id","item_value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "attachment" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint NOT NULL,
	"question_id" bigint,
	"original_filename" varchar(255) NOT NULL,
	"mime_type" varchar(127) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"storage_uri" varchar(500) NOT NULL,
	"checksum_sha256" char(64),
	"uploaded_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "branch_rule" (
	"id" bigint PRIMARY KEY NOT NULL,
	"question_id" bigint NOT NULL,
	"condition_expr" text NOT NULL,
	"effect" "branch_effect_enum" NOT NULL,
	"target_ref" varchar(64),
	"order_index" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consent_log" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint NOT NULL,
	"policy_version" varchar(50) NOT NULL,
	"accepted_at" timestamp DEFAULT now() NOT NULL,
	"ip_address" varchar(45),
	"user_agent" varchar(400)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_attachment_map" (
	"email_id" bigint NOT NULL,
	"attachment_id" bigint NOT NULL,
	CONSTRAINT "email_attachment_map_pkey" PRIMARY KEY("email_id","attachment_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_message" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint NOT NULL,
	"to_address" varchar(320) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"body_text" text NOT NULL,
	"status" "email_status_enum" NOT NULL,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"next_attempt_at" timestamp,
	"queued_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "email_template" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint,
	"name" varchar(100) NOT NULL,
	"subject_tpl" varchar(255) NOT NULL,
	"body_tpl" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tpl_scope_name" UNIQUE("form_id","name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "export_job" (
	"id" bigint PRIMARY KEY NOT NULL,
	"requested_by" varchar(320) NOT NULL,
	"form_id" bigint,
	"date_from" date,
	"date_to" date,
	"workflow_type" "workflow_type_enum",
	"status" "export_status_enum" NOT NULL,
	"format" "export_format_enum" NOT NULL,
	"file_uri" varchar(500),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_default_recipient" (
	"form_id" bigint NOT NULL,
	"email" varchar(320) NOT NULL,
	CONSTRAINT "form_default_recipient_pkey" PRIMARY KEY("form_id","email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "form_section" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"order_index" integer NOT NULL,
	CONSTRAINT "uq_form_section_order" UNIQUE("form_id","order_index")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "grant_scheme" (
	"id" bigint PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(200) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"order_index" integer DEFAULT 100 NOT NULL,
	CONSTRAINT "grant_scheme_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guidance_binding" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint,
	"question_id" bigint NOT NULL,
	"resource_id" bigint NOT NULL,
	"display_order" integer DEFAULT 100 NOT NULL,
	"visibility_condition_expr" text,
	"note" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_binding" UNIQUE("question_id","resource_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guidance_resource" (
	"id" bigint PRIMARY KEY NOT NULL,
	"resource_type" "resource_type_enum" DEFAULT 'Link' NOT NULL,
	"title" varchar(255) NOT NULL,
	"summary" text,
	"content_html" text,
	"content_uri" varchar(500),
	"icon" varchar(64),
	"audience" "audience_enum" DEFAULT 'Requestor' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guidance_resource_tag" (
	"resource_id" bigint NOT NULL,
	"tag" varchar(64) NOT NULL,
	CONSTRAINT "guidance_resource_tag_pkey" PRIMARY KEY("resource_id","tag")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guidance_search_log" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint,
	"query_text" varchar(500) NOT NULL,
	"results_count" integer,
	"clicked_resource_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "guidance_trigger" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint,
	"question_id" bigint,
	"keyword" varchar(100) NOT NULL,
	"match_type" "match_type_enum" NOT NULL,
	"weight" integer DEFAULT 100 NOT NULL,
	"resource_id" bigint NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "org_unit" (
	"id" bigint PRIMARY KEY NOT NULL,
	"parent_id" bigint,
	"code" varchar(50),
	"name" varchar(200) NOT NULL,
	"unit_type" "org_unit_type_enum" NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "org_unit_code_key" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "person" (
	"id" bigint PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320),
	"org_unit_id" bigint,
	"role_label" varchar(100),
	"active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "person_email_key" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint NOT NULL,
	"section_id" bigint,
	"label" varchar(255) NOT NULL,
	"q_type" "q_type_enum" NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"help_text" text,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "question_option" (
	"id" bigint PRIMARY KEY NOT NULL,
	"question_id" bigint NOT NULL,
	"value_key" varchar(128) NOT NULL,
	"display_text" varchar(255) NOT NULL,
	"order_index" integer NOT NULL,
	CONSTRAINT "uq_question_value" UNIQUE("question_id","value_key")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_uid" varchar(40) NOT NULL,
	"form_id" bigint NOT NULL,
	"workflow_type" "workflow_type_enum" NOT NULL,
	"status" "submission_status_enum" NOT NULL,
	"created_by" varchar(200),
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submission_submission_uid_key" UNIQUE("submission_uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission_draft" (
	"id" bigint PRIMARY KEY NOT NULL,
	"form_id" bigint NOT NULL,
	"draft_uid" char(36) NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "submission_draft_draft_uid_key" UNIQUE("draft_uid")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission_draft_answer" (
	"id" bigint PRIMARY KEY NOT NULL,
	"draft_id" bigint NOT NULL,
	"question_id" bigint NOT NULL,
	"value_text" text,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_draft_question" UNIQUE("draft_id","question_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission_draft_answer_multi" (
	"draft_answer_id" bigint NOT NULL,
	"item_value" varchar(255) NOT NULL,
	CONSTRAINT "submission_draft_answer_multi_pkey" PRIMARY KEY("draft_answer_id","item_value")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "submission_status_history" (
	"id" bigint PRIMARY KEY NOT NULL,
	"submission_id" bigint NOT NULL,
	"from_status" "submission_status_enum",
	"to_status" "submission_status_enum" NOT NULL,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"changed_by" varchar(200),
	"note" varchar(500)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "system_setting" (
	"setting_key" varchar(100) PRIMARY KEY NOT NULL,
	"value_text" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "validation_rule" (
	"id" bigint PRIMARY KEY NOT NULL,
	"question_id" bigint NOT NULL,
	"rule_type" "rule_type_enum" NOT NULL,
	"error_message" varchar(255) NOT NULL,
	"order_index" integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "validation_rule_param" (
	"rule_id" bigint NOT NULL,
	"param_key" varchar(50) NOT NULL,
	"param_value" varchar(255) NOT NULL,
	CONSTRAINT "validation_rule_param_pkey" PRIMARY KEY("rule_id","param_key")
);
--> statement-breakpoint
ALTER TABLE "form_details" DROP CONSTRAINT "form_details_form_id_form_id_fk";
--> statement-breakpoint
ALTER TABLE "form_results" DROP CONSTRAINT "form_results_form_id_form_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'form'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "form" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "id" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "form_key" varchar(64);--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "title" varchar(200);--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "status" "form_status_enum" NOT NULL;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "version_no" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "email_subject_tpl" varchar(255);--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "email_body_tpl" text;--> statement-breakpoint
ALTER TABLE "form" ADD COLUMN "updated_at" timestamp NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_answer_submission" ON "answer" ("submission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_att_submission" ON "attachment" ("submission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_brule_question" ON "branch_rule" ("order_index","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_consent_submission" ON "consent_log" ("submission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_status_next" ON "email_message" ("next_attempt_at","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_email_submission" ON "email_message" ("submission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_export_status_time" ON "export_job" ("created_at","status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_export_filter" ON "export_job" ("date_from","date_to","form_id","workflow_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_binding_q_order" ON "guidance_binding" ("display_order","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_binding_form_q" ON "guidance_binding" ("form_id","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gslog_created" ON "guidance_search_log" ("created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gtrig_keyword" ON "guidance_trigger" ("keyword");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gtrig_active" ON "guidance_trigger" ("active","weight");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_gtrig_scope" ON "guidance_trigger" ("form_id","question_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_org_unit_type_active" ON "org_unit" ("active","unit_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_person_name" ON "person" ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_question_form_order" ON "question" ("form_id","order_index");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_submission_form_time" ON "submission" ("created_at","form_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_submission_type_time" ON "submission" ("created_at","workflow_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_draft_expiry" ON "submission_draft" ("expires_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_status_sub_time" ON "submission_status_history" ("changed_at","submission_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_vrule_question" ON "validation_rule" ("order_index","question_id");--> statement-breakpoint
ALTER TABLE "form" DROP COLUMN IF EXISTS "name";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "admin_user_role" ADD CONSTRAINT "admin_user_role_admin_user_id_admin_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "admin_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer" ADD CONSTRAINT "answer_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer" ADD CONSTRAINT "answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "answer_multi_value" ADD CONSTRAINT "answer_multi_value_answer_id_answer_id_fk" FOREIGN KEY ("answer_id") REFERENCES "answer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachment" ADD CONSTRAINT "attachment_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "attachment" ADD CONSTRAINT "attachment_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "branch_rule" ADD CONSTRAINT "branch_rule_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consent_log" ADD CONSTRAINT "consent_log_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_attachment_map" ADD CONSTRAINT "email_attachment_map_email_id_email_message_id_fk" FOREIGN KEY ("email_id") REFERENCES "email_message"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_attachment_map" ADD CONSTRAINT "email_attachment_map_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "attachment"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "email_message" ADD CONSTRAINT "email_message_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_binding" ADD CONSTRAINT "guidance_binding_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_binding" ADD CONSTRAINT "guidance_binding_resource_id_guidance_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "guidance_resource"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_resource_tag" ADD CONSTRAINT "guidance_resource_tag_resource_id_guidance_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "guidance_resource"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_search_log" ADD CONSTRAINT "guidance_search_log_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_search_log" ADD CONSTRAINT "guidance_search_log_clicked_resource_id_guidance_resource_id_fk" FOREIGN KEY ("clicked_resource_id") REFERENCES "guidance_resource"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_trigger" ADD CONSTRAINT "guidance_trigger_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "guidance_trigger" ADD CONSTRAINT "guidance_trigger_resource_id_guidance_resource_id_fk" FOREIGN KEY ("resource_id") REFERENCES "guidance_resource"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "org_unit" ADD CONSTRAINT "fk_org_parent" FOREIGN KEY ("parent_id") REFERENCES "org_unit"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "person" ADD CONSTRAINT "person_org_unit_id_org_unit_id_fk" FOREIGN KEY ("org_unit_id") REFERENCES "org_unit"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question" ADD CONSTRAINT "question_section_id_form_section_id_fk" FOREIGN KEY ("section_id") REFERENCES "form_section"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "question_option" ADD CONSTRAINT "question_option_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submission_draft_answer" ADD CONSTRAINT "submission_draft_answer_draft_id_submission_draft_id_fk" FOREIGN KEY ("draft_id") REFERENCES "submission_draft"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submission_draft_answer" ADD CONSTRAINT "submission_draft_answer_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submission_draft_answer_multi" ADD CONSTRAINT "submission_draft_answer_multi_draft_answer_id_submission_draft_answer_id_fk" FOREIGN KEY ("draft_answer_id") REFERENCES "submission_draft_answer"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "submission_status_history" ADD CONSTRAINT "submission_status_history_submission_id_submission_id_fk" FOREIGN KEY ("submission_id") REFERENCES "submission"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "validation_rule" ADD CONSTRAINT "validation_rule_question_id_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "question"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "validation_rule_param" ADD CONSTRAINT "validation_rule_param_rule_id_validation_rule_id_fk" FOREIGN KEY ("rule_id") REFERENCES "validation_rule"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
