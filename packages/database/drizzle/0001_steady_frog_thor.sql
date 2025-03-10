ALTER TABLE "users" RENAME TO "sample_users";--> statement-breakpoint
ALTER TABLE "sample_users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "sample_users" ADD CONSTRAINT "sample_users_email_unique" UNIQUE("email");