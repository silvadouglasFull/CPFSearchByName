ALTER TABLE "hubdo_cpf_lookups" ADD COLUMN "cpf_encrypted" text;--> statement-breakpoint
ALTER TABLE "hubdo_cpf_lookups" ADD COLUMN "cpf_hash" text;--> statement-breakpoint
CREATE INDEX "hubdo_cpf_lookups_cpf_hash_idx" ON "hubdo_cpf_lookups" USING btree ("cpf_hash");