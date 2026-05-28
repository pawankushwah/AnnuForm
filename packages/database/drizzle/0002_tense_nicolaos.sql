ALTER TABLE "users" ADD COLUMN "plan" varchar(20) DEFAULT 'starter';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "plan_ends_at" timestamp;