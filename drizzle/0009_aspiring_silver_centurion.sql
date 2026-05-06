CREATE TABLE "hubdo_bulk_lookup_name_exclusions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"cpf" text NOT NULL,
	"target_name" text NOT NULL,
	"target_name_normalized" text NOT NULL,
	"last_found_name" text NOT NULL,
	"last_found_name_normalized" text NOT NULL,
	"last_found_birth_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hubdo_bulk_lookup_name_matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"cpf" text NOT NULL,
	"target_name" text NOT NULL,
	"target_name_normalized" text NOT NULL,
	"found_name" text NOT NULL,
	"found_name_normalized" text NOT NULL,
	"found_birth_date" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "target_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "target_name_normalized" text NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_name_exclusions" ADD CONSTRAINT "hubdo_bulk_lookup_name_exclusions_job_id_hubdo_bulk_lookup_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hubdo_bulk_lookup_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_name_matches" ADD CONSTRAINT "hubdo_bulk_lookup_name_matches_job_id_hubdo_bulk_lookup_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."hubdo_bulk_lookup_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_name_exclusions_job_id_idx" ON "hubdo_bulk_lookup_name_exclusions" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hubdo_bulk_lookup_name_exclusions_target_name_normalized_cpf_uidx" ON "hubdo_bulk_lookup_name_exclusions" USING btree ("target_name_normalized","cpf");--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_name_matches_job_id_idx" ON "hubdo_bulk_lookup_name_matches" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hubdo_bulk_lookup_name_matches_target_name_normalized_cpf_uidx" ON "hubdo_bulk_lookup_name_matches" USING btree ("target_name_normalized","cpf");--> statement-breakpoint
CREATE INDEX "hubdo_bulk_lookup_jobs_target_name_normalized_idx" ON "hubdo_bulk_lookup_jobs" USING btree ("target_name_normalized");