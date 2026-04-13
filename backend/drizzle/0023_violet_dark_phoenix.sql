CREATE TABLE "page_views" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"path" varchar(500) DEFAULT '/' NOT NULL,
	"referrer" text,
	"user_agent" text,
	"ip_hash" varchar(16),
	"country" varchar(2),
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"session_id" varchar(32) NOT NULL,
	"is_unique" boolean DEFAULT true NOT NULL,
	"duration_seconds" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_pageviews" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "analytics_pageviews" CASCADE;--> statement-breakpoint
ALTER TABLE "analytics_daily" RENAME COLUMN "pageviews" TO "page_views";--> statement-breakpoint
ALTER TABLE "analytics_daily" RENAME COLUMN "avg_session_duration" TO "avg_duration";--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "sessions" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "orders_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "revenue" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "top_pages" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "top_referrers" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD COLUMN "devices" jsonb DEFAULT '{}'::jsonb;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_views_tenant_idx" ON "page_views" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "page_views_created_at_idx" ON "page_views" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "page_views_session_idx" ON "page_views" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "page_views_tenant_date_idx" ON "page_views" USING btree ("tenant_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_daily_tenant_idx" ON "analytics_daily" USING btree ("tenant_id");