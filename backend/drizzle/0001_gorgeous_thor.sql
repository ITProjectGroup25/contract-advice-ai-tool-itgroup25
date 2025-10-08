ALTER TABLE "form_details" DROP CONSTRAINT "form_details_form_id_fkey";
--> statement-breakpoint
ALTER TABLE "form_results" DROP CONSTRAINT "form_results_form_id_fkey";
--> statement-breakpoint
ALTER TABLE "form" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "form_results" ALTER COLUMN "submitted_at" SET DEFAULT now();--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_details" ADD CONSTRAINT "form_details_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "form_results" ADD CONSTRAINT "form_results_form_id_form_id_fk" FOREIGN KEY ("form_id") REFERENCES "form"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
