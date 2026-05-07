ALTER TABLE "hubdo_bulk_lookup_jobs" ALTER COLUMN "target_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ALTER COLUMN "target_name_normalized" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "skipped_items" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "find_match_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "found_cpf" text;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "found_name" text;--> statement-breakpoint
ALTER TABLE "hubdo_bulk_lookup_jobs" ADD COLUMN "found_birth_date" text;