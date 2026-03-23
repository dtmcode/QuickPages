ALTER TABLE "tenants" ADD COLUMN "active_template_id" uuid;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "template_customizations" jsonb DEFAULT '{}'::jsonb;