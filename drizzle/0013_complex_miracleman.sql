CREATE TABLE "credify_phone_lookup_job_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"lookup_id" uuid,
	"raw_phone" text NOT NULL,
	"normalized_phone" text NOT NULL,
	"ddd" text NOT NULL,
	"local_number" text NOT NULL,
	"status" text NOT NULL,
	"attempt_count" integer DEFAULT 0 NOT NULL,
	"provider_query_id" text NOT NULL,
	"provider_code" text,
	"error_code" text,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "credify_phone_lookup_job_items_provider_query_id_unique" UNIQUE("provider_query_id")
);
--> statement-breakpoint
CREATE TABLE "credify_phone_lookup_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"status" text NOT NULL,
	"total_items" integer NOT NULL,
	"queued_items" integer DEFAULT 0 NOT NULL,
	"processing_items" integer DEFAULT 0 NOT NULL,
	"success_items" integer DEFAULT 0 NOT NULL,
	"not_found_items" integer DEFAULT 0 NOT NULL,
	"error_items" integer DEFAULT 0 NOT NULL,
	"dead_letter_items" integer DEFAULT 0 NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "credify_phone_lookups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid,
	"job_item_id" uuid,
	"raw_phone" text NOT NULL,
	"normalized_phone" text NOT NULL,
	"ddd" text NOT NULL,
	"local_number" text NOT NULL,
	"provider_query_id" text NOT NULL,
	"status" text NOT NULL,
	"provider_code" text,
	"provider_message" text,
	"cpf" text,
	"nome" text,
	"tp_logradouro" text,
	"logradouro" text,
	"numero" text,
	"endereco" text,
	"complemento" text,
	"bairro" text,
	"cidade" text,
	"uf" text,
	"cep" text,
	"phone_type" text,
	"error_code" text,
	"error_message" text,
	"raw_response" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"finished_at" timestamp with time zone,
	CONSTRAINT "credify_phone_lookups_provider_query_id_unique" UNIQUE("provider_query_id")
);
--> statement-breakpoint
ALTER TABLE "credify_phone_lookup_job_items" ADD CONSTRAINT "credify_phone_lookup_job_items_job_id_credify_phone_lookup_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."credify_phone_lookup_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credify_phone_lookups" ADD CONSTRAINT "credify_phone_lookups_job_id_credify_phone_lookup_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."credify_phone_lookup_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cpji_job_id_idx" ON "credify_phone_lookup_job_items" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "cpji_status_idx" ON "credify_phone_lookup_job_items" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "cpji_job_phone_uidx" ON "credify_phone_lookup_job_items" USING btree ("job_id","normalized_phone");--> statement-breakpoint
CREATE INDEX "cpj_status_idx" ON "credify_phone_lookup_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpl_norm_phone_idx" ON "credify_phone_lookups" USING btree ("normalized_phone");--> statement-breakpoint
CREATE INDEX "cpl_status_idx" ON "credify_phone_lookups" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cpl_created_at_idx" ON "credify_phone_lookups" USING btree ("created_at");