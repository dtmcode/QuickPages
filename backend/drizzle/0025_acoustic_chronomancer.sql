ALTER TYPE "public"."addon_type" ADD VALUE 'restaurant_module';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'local_store_module';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'funnels_module';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "restaurant" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "local_store" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "funnels" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "max_funnels" integer DEFAULT 0 NOT NULL;