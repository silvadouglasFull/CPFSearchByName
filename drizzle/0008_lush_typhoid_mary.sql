CREATE TABLE "hubdo_bulk_lookup_job_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"cpf" text NOT NULL,
	"status" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"error_code" text,
	"error_message" text,
	"creditos_consumidos" integer DEFAULT 0 NOT NULL,
	"origin" text,
	"hubdo_lookup_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "hubdo_bulk_lookup_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mode" text NOT NULL,
	"status" text NOT NULL,
	"total_items" integer NOT NULL,
	"queued_items" integer DEFAULT 0 NOT NULL,
	"processing_items" integer DEFAULT 0 NOT NULL,
	"success_items" integer DEFAULT 0 NOT NULL,
	"error_items" integer DEFAULT 0 NOT NULL,
	"dead_letter_items" integer DEFAULT 0 NOT NULL,
	"requested_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_job_items" ADD CONSTRAINT "hubdo_bulk_lookup_job_items_job_id_hubdo_bulk_lookup_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hubdo_bulk_lookup_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_job_items" ADD CONSTRAINT "hubdo_bulk_lookup_job_items_hubdo_lookup_id_hubdo_cpf_lookups_id_fk" FOREIGN KEY ("hubdo_lookup_id") REFERENCES "public"."hubdo_cpf_lookups"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_job_items_job_id_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_job_items_status_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "hubdo_bulk_lookup_job_items_job_id_cpf_uidx" ON "hubdo_bulk_lookup_job_items" USING btree ("job_id","cpf");--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_job_items_hubdo_lookup_id_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("hubdo_lookup_id");--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_jobs_status_idx" ON "hubdo_bulk_lookup_jobs" USING btree ("status");