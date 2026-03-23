ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'shop_module';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'newsletter';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'booking';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'ai_content';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'form_builder';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'i18n';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'extra_products';
--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE IF NOT EXISTS 'extra_ai_credits';
--> statement-breakpoint
ALTER TYPE "public"."package" ADD VALUE IF NOT EXISTS 'page';
--> statement-breakpoint
ALTER TYPE "public"."package" ADD VALUE IF NOT EXISTS 'creator';
--> statement-breakpoint
ALTER TYPE "public"."package" ADD VALUE IF NOT EXISTS 'shop';
--> statement-breakpoint
ALTER TYPE "public"."package" ADD VALUE IF NOT EXISTS 'professional';
--> statement-breakpoint
ALTER TYPE "public"."package" ADD VALUE IF NOT EXISTS 'landing';

UPDATE tenants SET package = 'page' WHERE package = 'starter';

UPDATE subscriptions SET package = 'page' WHERE package = 'starter';