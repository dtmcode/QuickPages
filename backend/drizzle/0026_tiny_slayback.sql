ALTER TABLE "wb_global_template_sections" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "wb_sections" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."wb_section_type";--> statement-breakpoint
CREATE TYPE "public"."wb_section_type" AS ENUM('freestyle', 'custom');--> statement-breakpoint
ALTER TABLE "wb_global_template_sections" ALTER COLUMN "type" SET DATA TYPE "public"."wb_section_type" USING "type"::"public"."wb_section_type";--> statement-breakpoint
ALTER TABLE "wb_sections" ALTER COLUMN "type" SET DATA TYPE "public"."wb_section_type" USING "type"::"public"."wb_section_type";