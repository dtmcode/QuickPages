ALTER TYPE "public"."addon_type" ADD VALUE 'shop_extra' BEFORE 'newsletter';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'booking_module' BEFORE 'newsletter';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'blog_module' BEFORE 'newsletter';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'newsletter_extra' BEFORE 'booking';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'extra_pages';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'members_module';--> statement-breakpoint
ALTER TYPE "public"."addon_type" ADD VALUE 'custom_domain';--> statement-breakpoint
ALTER TABLE "subscriptions" ALTER COLUMN "package" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "package" SET DATA TYPE varchar(50);--> statement-breakpoint
ALTER TABLE "tenants" ALTER COLUMN "package" SET DEFAULT 'website_micro';--> statement-breakpoint
DROP TYPE "public"."package";