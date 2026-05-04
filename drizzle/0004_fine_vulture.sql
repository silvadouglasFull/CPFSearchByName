CREATE TABLE "get_cpfs_by_name_search_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_name" text NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "get_cpfs_by_name_search_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"search_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cpf" text NOT NULL,
	"relation" text NOT NULL,
	"details_link" text NOT NULL,
	"source_page" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "get_cpfs_by_name_search_records" ADD CONSTRAINT "get_cpfs_by_name_search_records_search_id_get_cpfs_by_name_search_history_id_fk" FOREIGN KEY ("search_id") REFERENCES "public"."get_cpfs_by_name_search_history"("id") ON DELETE cascade ON UPDATE no action;