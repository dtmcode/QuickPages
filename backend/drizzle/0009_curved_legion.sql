ALTER TABLE "page_sections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "template_sections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "website_template_page_sections" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "website_template_pages" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "website_templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "page_sections" CASCADE;--> statement-breakpoint
DROP TABLE "sections" CASCADE;--> statement-breakpoint
DROP TABLE "template_sections" CASCADE;--> statement-breakpoint
DROP TABLE "templates" CASCADE;--> statement-breakpoint
DROP TABLE "website_template_page_sections" CASCADE;--> statement-breakpoint
DROP TABLE "website_template_pages" CASCADE;--> statement-breakpoint
DROP TABLE "website_templates" CASCADE;--> statement-breakpoint
DROP INDEX "pages_applied_template_idx";--> statement-breakpoint
DROP INDEX "pages_source_template_page_idx";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "applied_website_template_id";--> statement-breakpoint
ALTER TABLE "pages" DROP COLUMN "source_template_page_id";--> statement-breakpoint
DROP TYPE "public"."section_type";--> statement-breakpoint
DROP TYPE "public"."template_category";--> statement-breakpoint
DROP TYPE "public"."website_template_category";