CREATE TYPE "public"."website_template_category" AS ENUM('business', 'shop', 'blog', 'landing', 'portfolio', 'agency', 'restaurant', 'saas', 'custom');--> statement-breakpoint
CREATE TABLE "page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"override_config" jsonb DEFAULT '{}'::jsonb,
	"source_template_page_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_template_page_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_page_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_template_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"order_index" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "website_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"category" "website_template_category" NOT NULL,
	"description" text,
	"thumbnail" text,
	"is_preset" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "navigation_menus" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "navigation_menus" CASCADE;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "applied_website_template_id" uuid;--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "source_template_page_id" uuid;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_source_template_page_id_website_template_pages_id_fk" FOREIGN KEY ("source_template_page_id") REFERENCES "public"."website_template_pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_template_page_sections" ADD CONSTRAINT "website_template_page_sections_template_page_id_website_template_pages_id_fk" FOREIGN KEY ("template_page_id") REFERENCES "public"."website_template_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_template_page_sections" ADD CONSTRAINT "website_template_page_sections_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_template_pages" ADD CONSTRAINT "website_template_pages_template_id_website_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."website_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_templates" ADD CONSTRAINT "website_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_templates" ADD CONSTRAINT "website_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "page_sections_page_idx" ON "page_sections" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "page_sections_section_idx" ON "page_sections" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "page_sections_order_idx" ON "page_sections" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "page_sections_source_page_idx" ON "page_sections" USING btree ("source_template_page_id");--> statement-breakpoint
CREATE INDEX "website_template_page_sections_page_idx" ON "website_template_page_sections" USING btree ("template_page_id");--> statement-breakpoint
CREATE INDEX "website_template_page_sections_section_idx" ON "website_template_page_sections" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "website_template_page_sections_order_idx" ON "website_template_page_sections" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "website_template_pages_template_idx" ON "website_template_pages" USING btree ("template_id");--> statement-breakpoint
CREATE UNIQUE INDEX "website_template_pages_template_slug_idx" ON "website_template_pages" USING btree ("template_id","slug");--> statement-breakpoint
CREATE INDEX "website_template_pages_order_idx" ON "website_template_pages" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "website_templates_tenant_idx" ON "website_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "website_templates_category_idx" ON "website_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "website_templates_preset_idx" ON "website_templates" USING btree ("is_preset");--> statement-breakpoint
CREATE INDEX "pages_applied_template_idx" ON "pages" USING btree ("applied_website_template_id");--> statement-breakpoint
CREATE INDEX "pages_source_template_page_idx" ON "pages" USING btree ("source_template_page_id");