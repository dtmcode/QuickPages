CREATE TYPE "public"."wb_page_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."wb_section_type" AS ENUM('hero', 'features', 'about', 'services', 'gallery', 'testimonials', 'team', 'pricing', 'cta', 'contact', 'faq', 'blog', 'stats', 'video', 'text', 'html', 'custom');--> statement-breakpoint
CREATE TABLE "wb_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"meta_title" varchar(255),
	"meta_description" text,
	"meta_keywords" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_homepage" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wb_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "wb_section_type" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"styling" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wb_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wb_pages" ADD CONSTRAINT "wb_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wb_pages" ADD CONSTRAINT "wb_pages_template_id_wb_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."wb_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wb_sections" ADD CONSTRAINT "wb_sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wb_sections" ADD CONSTRAINT "wb_sections_page_id_wb_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wb_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wb_templates" ADD CONSTRAINT "wb_templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wb_pages_tenant_idx" ON "wb_pages" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wb_pages_template_idx" ON "wb_pages" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "wb_pages_slug_idx" ON "wb_pages" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "wb_pages_tenant_slug_idx" ON "wb_pages" USING btree ("tenant_id","template_id","slug");--> statement-breakpoint
CREATE INDEX "wb_pages_homepage_idx" ON "wb_pages" USING btree ("is_homepage");--> statement-breakpoint
CREATE INDEX "wb_sections_tenant_idx" ON "wb_sections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wb_sections_page_idx" ON "wb_sections" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "wb_sections_order_idx" ON "wb_sections" USING btree ("order");--> statement-breakpoint
CREATE INDEX "wb_sections_type_idx" ON "wb_sections" USING btree ("type");--> statement-breakpoint
CREATE INDEX "wb_templates_tenant_idx" ON "wb_templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "wb_templates_default_idx" ON "wb_templates" USING btree ("is_default");