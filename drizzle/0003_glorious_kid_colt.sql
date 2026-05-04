CREATE TABLE "generator_cpf_history_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"history_id" uuid NOT NULL,
	"cpf" text NOT NULL,
	"formatted_cpf" text NOT NULL,
	"base_nine_digits" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "generator_cpf_history_records" ADD CONSTRAINT "generator_cpf_history_records_history_id_generator_cpf_history_id_fk" FOREIGN KEY ("history_id") REFERENCES "public"."generator_cpf_history"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generator_cpf_history" DROP COLUMN "result_records";