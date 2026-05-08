CREATE TABLE "authenticated_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"profile_picture" text,
	"email" text NOT NULL,
	CONSTRAINT "authenticated_users_email_unique" UNIQUE("email")
);
