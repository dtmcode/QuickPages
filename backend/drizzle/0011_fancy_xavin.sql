CREATE TABLE "wb_global_template_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"is_homepage" boolean DEFAULT false NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wb_global_template_sections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "wb_section_type" NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"styling" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wb_global_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"thumbnail_url" text,
	"category" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_premium" boolean DEFAULT false NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb,
	"preview_url" text,
	"demo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "wb_templates_default_idx";--> statement-breakpoint
ALTER TABLE "wb_templates" ADD COLUMN "global_template_id" uuid;--> statement-breakpoint
ALTER TABLE "wb_global_template_pages" ADD CONSTRAINT "wb_global_template_pages_template_id_wb_global_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."wb_global_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wb_global_template_sections" ADD CONSTRAINT "wb_global_template_sections_page_id_wb_global_template_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wb_global_template_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wb_global_template_pages_template_idx" ON "wb_global_template_pages" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "wb_global_template_pages_slug_idx" ON "wb_global_template_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "wb_global_template_sections_page_idx" ON "wb_global_template_sections" USING btree ("page_id");--> statement-breakpoint
CREATE INDEX "wb_global_template_sections_order_idx" ON "wb_global_template_sections" USING btree ("order");--> statement-breakpoint
CREATE INDEX "wb_global_templates_category_idx" ON "wb_global_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "wb_global_templates_active_idx" ON "wb_global_templates" USING btree ("is_active");--> statement-breakpoint
ALTER TABLE "wb_templates" ADD CONSTRAINT "wb_templates_global_template_id_wb_global_templates_id_fk" FOREIGN KEY ("global_template_id") REFERENCES "public"."wb_global_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "wb_templates_global_template_idx" ON "wb_templates" USING btree ("global_template_id");--> statement-breakpoint
CREATE INDEX "wb_templates_default_idx" ON "wb_templates" USING btree ("tenant_id","is_default");