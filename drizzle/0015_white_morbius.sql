ALTER TABLE "app_settings" DROP CONSTRAINT "app_settings_singleton_key_unique";--> statement-breakpoint
ALTER TABLE "app_settings" ADD COLUMN "authenticated_user_id" uuid;--> statement-breakpoint
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_authenticated_user_id_authenticated_users_id_fk" FOREIGN KEY ("authenticated_user_id") REFERENCES "public"."authenticated_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "app_settings_auth_user_id_idx" ON "app_settings" USING btree ("authenticated_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_settings_user_singleton_uidx" ON "app_settings" USING btree ("authenticated_user_id","singleton_key");