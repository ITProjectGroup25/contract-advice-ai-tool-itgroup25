-- Create form table
CREATE TABLE IF NOT EXISTS "form" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);

-- Create form_details table
CREATE TABLE IF NOT EXISTS "form_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"form_fields" jsonb NOT NULL,
	CONSTRAINT "form_details_form_id_key" UNIQUE("form_id")
);

-- Create form_results table
CREATE TABLE IF NOT EXISTS "form_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"form_id" integer NOT NULL,
	"submitted_at" timestamp DEFAULT now(),
	"results" jsonb NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "form_details" ADD CONSTRAINT "form_details_form_id_fkey" 
 FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "form_results" ADD CONSTRAINT "form_results_form_id_fkey" 
 FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
