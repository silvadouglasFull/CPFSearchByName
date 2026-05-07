DROP INDEX "generator_cpf_history_records_history_id_idx";--> statement-breakpoint
DROP INDEX "generator_cpf_history_records_hubdo_lookup_id_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_job_items_job_id_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_job_items_status_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_job_items_job_id_cpf_uidx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_job_items_hubdo_lookup_id_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_jobs_status_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_jobs_target_name_normalized_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_name_exclusions_job_id_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_name_exclusions_target_name_normalized_cpf_uidx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_name_matches_job_id_idx";--> statement-breakpoint
DROP INDEX "hubdo_bulk_lookup_name_matches_target_name_normalized_cpf_uidx";--> statement-breakpoint
DROP INDEX "hubdo_cpf_lookups_cpf_hash_idx";--> statement-breakpoint
CREATE INDEX "gchr_hist_id_idx" ON "generator_cpf_history_records" USING btree ("history_id");--> statement-breakpoint
CREATE INDEX "gchr_hubdo_lu_id_idx" ON "generator_cpf_history_records" USING btree ("hubdo_lookup_id");--> statement-breakpoint
CREATE INDEX "hblji_job_id_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("job_id");--> statement-breakpoint
CREATE INDEX "hblji_status_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "hblji_job_cpf_uidx" ON "hubdo_bulk_lookup_job_items" USING btree ("job_id","cpf");--> statement-breakpoint
CREATE INDEX "hblji_hubdo_lu_id_idx" ON "hubdo_bulk_lookup_job_items" USING btree ("hubdo_lookup_id");--> statement-breakpoint
CREATE INDEX "hblj_status_idx" ON "hubdo_bulk_lookup_jobs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "hblj_tn_norm_idx" ON "hubdo_bulk_lookup_jobs" USING btree ("target_name_normalized");--> statement-breakpoint
CREATE INDEX "hblne_job_id_idx" ON "hubdo_bulk_lookup_name_exclusions" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hblne_tn_cpf_uidx" ON "hubdo_bulk_lookup_name_exclusions" USING btree ("target_name_normalized","cpf");--> statement-breakpoint
CREATE INDEX "hblnm_job_id_idx" ON "hubdo_bulk_lookup_name_matches" USING btree ("job_id");--> statement-breakpoint
CREATE UNIQUE INDEX "hblnm_tn_cpf_uidx" ON "hubdo_bulk_lookup_name_matches" USING btree ("target_name_normalized","cpf");--> statement-breakpoint
CREATE INDEX "hcl_cpf_hash_idx" ON "hubdo_cpf_lookups" USING btree ("cpf_hash");