CREATE TABLE "analytics_daily" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"pageviews" integer DEFAULT 0 NOT NULL,
	"unique_visitors" integer DEFAULT 0 NOT NULL,
	"new_sessions" integer DEFAULT 0 NOT NULL,
	"bounce_rate" integer DEFAULT 0,
	"avg_session_duration" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "analytics_pageviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"page_slug" varchar(500),
	"page_title" varchar(500),
	"referrer" text,
	"user_agent" text,
	"ip_hash" varchar(64),
	"country" varchar(2),
	"device" varchar(20),
	"browser" varchar(50),
	"session_id" varchar(64),
	"is_new_session" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blog_comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"post_id" uuid NOT NULL,
	"parent_id" uuid,
	"author_name" varchar(255) NOT NULL,
	"author_email" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"is_spam" boolean DEFAULT false NOT NULL,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"ip_address" varchar(45),
	"depth" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_phone" varchar(50),
	"customer_notes" text,
	"date" varchar(10) NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed',
	"confirmation_token" varchar(100),
	"cancellation_reason" text,
	"cancelled_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) DEFAULT '09:00' NOT NULL,
	"end_time" varchar(5) DEFAULT '17:00' NOT NULL,
	"is_active" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "booking_blocked_dates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"date" varchar(10) NOT NULL,
	"reason" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"duration_minutes" integer DEFAULT 30 NOT NULL,
	"buffer_minutes" integer DEFAULT 0 NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"color" varchar(20) DEFAULT '#3b82f6',
	"max_bookings_per_slot" integer DEFAULT 1,
	"requires_confirmation" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "booking_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"timezone" varchar(100) DEFAULT 'Europe/Berlin',
	"min_notice_hours" integer DEFAULT 24,
	"max_advance_days" integer DEFAULT 60,
	"slot_interval_minutes" integer DEFAULT 30,
	"confirmation_email_enabled" boolean DEFAULT true,
	"reminder_email_hours" integer DEFAULT 24,
	"cancellation_policy" text,
	"booking_page_title" varchar(255),
	"booking_page_description" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "booking_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "comment_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"require_approval" boolean DEFAULT true NOT NULL,
	"allow_anonymous" boolean DEFAULT false NOT NULL,
	"allow_replies" boolean DEFAULT true NOT NULL,
	"max_depth" integer DEFAULT 3 NOT NULL,
	"spam_filter" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "comment_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"ip_address" varchar(45),
	"user_agent" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"is_starred" boolean DEFAULT false NOT NULL,
	"is_spam" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"fields" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"submit_button_text" varchar(100) DEFAULT 'Absenden',
	"success_message" text,
	"redirect_url" text,
	"email_notification" boolean DEFAULT false,
	"notification_email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analytics_daily" ADD CONSTRAINT "analytics_daily_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analytics_pageviews" ADD CONSTRAINT "analytics_pageviews_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blog_comments" ADD CONSTRAINT "blog_comments_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_appointments" ADD CONSTRAINT "booking_appointments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_appointments" ADD CONSTRAINT "booking_appointments_service_id_booking_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."booking_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_availability" ADD CONSTRAINT "booking_availability_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_blocked_dates" ADD CONSTRAINT "booking_blocked_dates_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_services" ADD CONSTRAINT "booking_services_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_settings" ADD CONSTRAINT "booking_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comment_settings" ADD CONSTRAINT "comment_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "analytics_daily_tenant_date_idx" ON "analytics_daily" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "analytics_pageviews_tenant_idx" ON "analytics_pageviews" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "analytics_pageviews_created_at_idx" ON "analytics_pageviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_pageviews_session_idx" ON "analytics_pageviews" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "blog_comments_tenant_idx" ON "blog_comments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "blog_comments_post_idx" ON "blog_comments" USING btree ("post_id");--> statement-breakpoint
CREATE INDEX "blog_comments_status_idx" ON "blog_comments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_appointments_tenant_idx" ON "booking_appointments" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "booking_appointments_date_idx" ON "booking_appointments" USING btree ("date");--> statement-breakpoint
CREATE INDEX "booking_appointments_status_idx" ON "booking_appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "booking_appointments_token_idx" ON "booking_appointments" USING btree ("confirmation_token");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_availability_tenant_day_idx" ON "booking_availability" USING btree ("tenant_id","day_of_week");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_blocked_dates_tenant_date_idx" ON "booking_blocked_dates" USING btree ("tenant_id","date");--> statement-breakpoint
CREATE INDEX "booking_services_tenant_idx" ON "booking_services" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "form_submissions_tenant_idx" ON "form_submissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "form_submissions_created_at_idx" ON "form_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "forms_tenant_idx" ON "forms" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "forms_tenant_slug_idx" ON "forms" USING btree ("tenant_id","slug");