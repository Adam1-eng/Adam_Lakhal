CREATE TABLE "reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"token_hash" text NOT NULL,
	"project_id" text,
	"client_label" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 0 NOT NULL,
	"comment" text DEFAULT '' NOT NULL,
	"author" text DEFAULT '' NOT NULL,
	"business" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'invited' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"submitted_at" timestamp with time zone,
	"published_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "reviews_token_idx" ON "reviews" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "reviews_status_idx" ON "reviews" USING btree ("status");