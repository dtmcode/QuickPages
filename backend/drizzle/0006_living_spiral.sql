CREATE TYPE "public"."section_type" AS ENUM('hero', 'features', 'contact', 'newsletter', 'products', 'blog', 'gallery', 'testimonials', 'cta', 'team', 'pricing', 'faq', 'stats', 'footer', 'custom');--> statement-breakpoint
CREATE TYPE "public"."template_category" AS ENUM('business', 'shop', 'blog', 'landing', 'portfolio', 'custom');--> statement-breakpoint
CREATE TABLE "sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"type" "section_type" NOT NULL,
	"component" varchar(100) NOT NULL,
	"description" text,
	"config" jsonb DEFAULT '{}'::jsonb,
	"is_preset" boolean DEFAULT false NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"thumbnail" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"section_id" uuid NOT NULL,
	"order_index" integer NOT NULL,
	"override_config" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid,
	"name" varchar(255) NOT NULL,
	"category" "template_category" NOT NULL,
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
ALTER TABLE "sections" ADD CONSTRAINT "sections_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_sections" ADD CONSTRAINT "template_sections_section_id_sections_id_fk" FOREIGN KEY ("section_id") REFERENCES "public"."sections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sections_tenant_idx" ON "sections" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "sections_type_idx" ON "sections" USING btree ("type");--> statement-breakpoint
CREATE INDEX "sections_preset_idx" ON "sections" USING btree ("is_preset");--> statement-breakpoint
CREATE INDEX "template_sections_template_idx" ON "template_sections" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_sections_section_idx" ON "template_sections" USING btree ("section_id");--> statement-breakpoint
CREATE INDEX "template_sections_order_idx" ON "template_sections" USING btree ("order_index");--> statement-breakpoint
CREATE INDEX "templates_tenant_idx" ON "templates" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "templates_preset_idx" ON "templates" USING btree ("is_preset");