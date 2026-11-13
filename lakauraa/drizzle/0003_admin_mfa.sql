ALTER TABLE "admins" ADD COLUMN "totp_secret" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "totp_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "totp_last_step" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "admins" ADD COLUMN "recovery_codes" jsonb DEFAULT '[]'::jsonb NOT NULL;