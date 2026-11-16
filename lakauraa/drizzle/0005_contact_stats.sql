CREATE TABLE "contact_stats" (
	"day" text NOT NULL,
	"event" text NOT NULL,
	"path" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "contact_stats_key_idx" ON "contact_stats" USING btree ("day","event","path");--> statement-breakpoint
CREATE INDEX "contact_stats_day_idx" ON "contact_stats" USING btree ("day");