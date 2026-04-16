CREATE TABLE "coupon_uses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"coupon_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"reference_id" uuid,
	"reference_type" varchar(30),
	"discount_amount" integer NOT NULL,
	"used_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"code" varchar(50) NOT NULL,
	"description" varchar(500),
	"type" varchar(20) NOT NULL,
	"value" integer NOT NULL,
	"min_order_amount" integer DEFAULT 0,
	"max_uses" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"applicable_module" varchar(30) DEFAULT 'all' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_chapters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"description" varchar(1000),
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"customer_email" varchar(255) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"access_granted_by" varchar(30) DEFAULT 'purchase' NOT NULL,
	"membership_id" uuid,
	"stripe_payment_intent_id" varchar(255),
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"progress" integer DEFAULT 0 NOT NULL,
	"certificate_url" varchar(500),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chapter_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"type" varchar(20) DEFAULT 'video' NOT NULL,
	"content" jsonb DEFAULT '{}'::jsonb,
	"video_url" varchar(500),
	"duration" integer DEFAULT 0,
	"position" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_free_preview" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(500) NOT NULL,
	"slug" varchar(500) NOT NULL,
	"description" text,
	"short_description" varchar(500),
	"thumbnail" varchar(500),
	"price" integer DEFAULT 0 NOT NULL,
	"is_free" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"requires_membership_plan_id" uuid,
	"level" varchar(30) DEFAULT 'beginner' NOT NULL,
	"language" varchar(10) DEFAULT 'de' NOT NULL,
	"total_duration" integer DEFAULT 0,
	"certificate_enabled" boolean DEFAULT false NOT NULL,
	"stripe_price_id" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "food_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_order_id" uuid NOT NULL,
	"menu_item_id" uuid,
	"menu_item_name" varchar(300) NOT NULL,
	"menu_item_price" integer NOT NULL,
	"quantity" integer NOT NULL,
	"selected_modifiers" jsonb DEFAULT '[]'::jsonb,
	"notes" varchar(500),
	"total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "food_order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"food_order_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"status" varchar(30) NOT NULL,
	"note" varchar(500),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "food_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"order_type" varchar(20) NOT NULL,
	"table_id" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"delivery_address" varchar(1000),
	"status" varchar(30) DEFAULT 'new' NOT NULL,
	"notes" varchar(1000),
	"subtotal" integer NOT NULL,
	"tax" integer DEFAULT 0 NOT NULL,
	"delivery_fee" integer DEFAULT 0 NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"pickup_code" varchar(20),
	"pickup_code_used" boolean DEFAULT false NOT NULL,
	"estimated_ready_at" timestamp,
	"payment_method" varchar(30) DEFAULT 'cash' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"paid_at" timestamp,
	"coupon_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funnel_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"title" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"step_type" varchar(30) NOT NULL,
	"content" jsonb DEFAULT '[]'::jsonb,
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"next_step_id" uuid,
	"views" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funnel_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"funnel_id" uuid NOT NULL,
	"step_id" uuid,
	"tenant_id" uuid NOT NULL,
	"customer_email" varchar(255),
	"customer_name" varchar(255),
	"data" jsonb DEFAULT '{}'::jsonb,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"ip_address" varchar(45),
	"user_agent" text,
	"converted_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "funnels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"description" varchar(1000),
	"is_active" boolean DEFAULT false NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"conversion_goal" varchar(30) DEFAULT 'email' NOT NULL,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"total_views" integer DEFAULT 0 NOT NULL,
	"total_conversions" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"completed_at" timestamp,
	"watch_time" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_deals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"local_product_id" uuid,
	"title" varchar(300) NOT NULL,
	"description" varchar(1000),
	"image" varchar(500),
	"discount_type" varchar(20) NOT NULL,
	"discount_value" integer NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"local_order_id" uuid NOT NULL,
	"local_product_id" uuid,
	"product_name" varchar(300) NOT NULL,
	"product_price" integer NOT NULL,
	"unit" varchar(30) NOT NULL,
	"quantity" integer NOT NULL,
	"total" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "local_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"order_number" varchar(50) NOT NULL,
	"order_type" varchar(20) DEFAULT 'pickup' NOT NULL,
	"pickup_slot_id" uuid,
	"pickup_date" varchar(10),
	"pickup_code" varchar(20),
	"pickup_code_used" boolean DEFAULT false NOT NULL,
	"pickup_confirmed_at" timestamp,
	"pickup_confirmed_by" uuid,
	"customer_name" varchar(255) NOT NULL,
	"customer_email" varchar(255),
	"customer_phone" varchar(50),
	"delivery_address" varchar(1000),
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"notes" varchar(1000),
	"subtotal" integer NOT NULL,
	"discount_amount" integer DEFAULT 0 NOT NULL,
	"total" integer NOT NULL,
	"payment_method" varchar(30) DEFAULT 'cash_on_pickup' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"paid_at" timestamp,
	"coupon_id" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_pickup_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"day_of_week" integer NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"max_orders" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category_id" uuid,
	"name" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"description" varchar(2000),
	"price" integer NOT NULL,
	"compare_at_price" integer,
	"unit" varchar(30) DEFAULT 'Stück' NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"stock" integer DEFAULT 0,
	"is_unlimited" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"is_organic" boolean DEFAULT false NOT NULL,
	"is_regional" boolean DEFAULT false NOT NULL,
	"origin" varchar(200),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "local_store_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"store_type" varchar(50) DEFAULT 'other' NOT NULL,
	"pickup_enabled" boolean DEFAULT true NOT NULL,
	"delivery_enabled" boolean DEFAULT false NOT NULL,
	"pickup_slot_duration" integer DEFAULT 30,
	"max_orders_per_slot" integer DEFAULT 5,
	"min_order_amount" integer DEFAULT 0,
	"cash_on_pickup_enabled" boolean DEFAULT true NOT NULL,
	"card_on_pickup_enabled" boolean DEFAULT true NOT NULL,
	"online_payment_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "local_store_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "membership_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(2000),
	"price" integer NOT NULL,
	"interval" varchar(20) DEFAULT 'monthly' NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_public" boolean DEFAULT true NOT NULL,
	"stripe_price_id" varchar(255),
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"plan_id" uuid,
	"customer_email" varchar(255) NOT NULL,
	"customer_name" varchar(255) NOT NULL,
	"status" varchar(30) DEFAULT 'active' NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"expires_at" timestamp,
	"cancelled_at" timestamp,
	"stripe_subscription_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"granted_manually" boolean DEFAULT false NOT NULL,
	"granted_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"slug" varchar(200) NOT NULL,
	"description" varchar(500),
	"image" varchar(500),
	"position" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"available_from" varchar(5),
	"available_to" varchar(5),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"category_id" uuid,
	"name" varchar(300) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"description" varchar(1000),
	"price" integer NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb,
	"allergens" text[] DEFAULT '{}',
	"is_vegan" boolean DEFAULT false NOT NULL,
	"is_vegetarian" boolean DEFAULT false NOT NULL,
	"is_spicy" boolean DEFAULT false NOT NULL,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"preparation_time" integer DEFAULT 15,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_modifier_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"min_selections" integer DEFAULT 0 NOT NULL,
	"max_selections" integer DEFAULT 1 NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "menu_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"price_modifier" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_available" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"status" varchar(30) NOT NULL,
	"note" varchar(500),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_variant_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"is_required" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"label" varchar(100) NOT NULL,
	"sku" varchar(100),
	"price_modifier" integer DEFAULT 0 NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "restaurant_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"dine_in_enabled" boolean DEFAULT true NOT NULL,
	"pickup_enabled" boolean DEFAULT true NOT NULL,
	"delivery_enabled" boolean DEFAULT false NOT NULL,
	"delivery_radius" integer DEFAULT 5,
	"delivery_fee" integer DEFAULT 0,
	"free_delivery_from" integer,
	"min_order_amount" integer DEFAULT 0,
	"estimated_pickup_time" integer DEFAULT 20,
	"estimated_delivery_time" integer DEFAULT 45,
	"cash_enabled" boolean DEFAULT true NOT NULL,
	"card_on_pickup_enabled" boolean DEFAULT true NOT NULL,
	"online_payment_enabled" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "restaurant_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
CREATE TABLE "restaurant_tables" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"number" varchar(20) NOT NULL,
	"name" varchar(100),
	"capacity" integer DEFAULT 4 NOT NULL,
	"qr_code" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "protected_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"page_id" uuid NOT NULL,
	"requires_membership_plan_id" uuid,
	"requires_course_id" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_type" varchar(30) DEFAULT 'shipping' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_number" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "carrier" varchar(100);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_code" varchar(20);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_code_used" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_slot" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "pickup_confirmed_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "stripe_payment_intent_id" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "paid_at" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_id" uuid;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "has_variants" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "sku" varchar(100);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "weight" integer;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "is_digital" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "download_url" varchar(500);--> statement-breakpoint
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_coupon_id_coupons_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "public"."coupons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupon_uses" ADD CONSTRAINT "coupon_uses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coupons" ADD CONSTRAINT "coupons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_chapters" ADD CONSTRAINT "course_chapters_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_chapters" ADD CONSTRAINT "course_chapters_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_chapter_id_course_chapters_id_fk" FOREIGN KEY ("chapter_id") REFERENCES "public"."course_chapters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_requires_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("requires_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_order_items" ADD CONSTRAINT "food_order_items_food_order_id_food_orders_id_fk" FOREIGN KEY ("food_order_id") REFERENCES "public"."food_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_order_items" ADD CONSTRAINT "food_order_items_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_order_status_history" ADD CONSTRAINT "food_order_status_history_food_order_id_food_orders_id_fk" FOREIGN KEY ("food_order_id") REFERENCES "public"."food_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_order_status_history" ADD CONSTRAINT "food_order_status_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_orders" ADD CONSTRAINT "food_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "food_orders" ADD CONSTRAINT "food_orders_table_id_restaurant_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."restaurant_tables"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_steps" ADD CONSTRAINT "funnel_steps_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_submissions" ADD CONSTRAINT "funnel_submissions_funnel_id_funnels_id_fk" FOREIGN KEY ("funnel_id") REFERENCES "public"."funnels"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_submissions" ADD CONSTRAINT "funnel_submissions_step_id_funnel_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."funnel_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnel_submissions" ADD CONSTRAINT "funnel_submissions_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "funnels" ADD CONSTRAINT "funnels_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_enrollment_id_course_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."course_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_progress" ADD CONSTRAINT "lesson_progress_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_deals" ADD CONSTRAINT "local_deals_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_deals" ADD CONSTRAINT "local_deals_local_product_id_local_products_id_fk" FOREIGN KEY ("local_product_id") REFERENCES "public"."local_products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_order_items" ADD CONSTRAINT "local_order_items_local_order_id_local_orders_id_fk" FOREIGN KEY ("local_order_id") REFERENCES "public"."local_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_order_items" ADD CONSTRAINT "local_order_items_local_product_id_local_products_id_fk" FOREIGN KEY ("local_product_id") REFERENCES "public"."local_products"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_orders" ADD CONSTRAINT "local_orders_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_orders" ADD CONSTRAINT "local_orders_pickup_slot_id_local_pickup_slots_id_fk" FOREIGN KEY ("pickup_slot_id") REFERENCES "public"."local_pickup_slots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_orders" ADD CONSTRAINT "local_orders_pickup_confirmed_by_users_id_fk" FOREIGN KEY ("pickup_confirmed_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_pickup_slots" ADD CONSTRAINT "local_pickup_slots_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_products" ADD CONSTRAINT "local_products_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "local_store_settings" ADD CONSTRAINT "local_store_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership_plans" ADD CONSTRAINT "membership_plans_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_plan_id_membership_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_granted_by_users_id_fk" FOREIGN KEY ("granted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD CONSTRAINT "menu_categories_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_modifier_groups" ADD CONSTRAINT "menu_modifier_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_modifier_groups" ADD CONSTRAINT "menu_modifier_groups_menu_item_id_menu_items_id_fk" FOREIGN KEY ("menu_item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_modifiers" ADD CONSTRAINT "menu_modifiers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "menu_modifiers" ADD CONSTRAINT "menu_modifiers_group_id_menu_modifier_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."menu_modifier_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_groups" ADD CONSTRAINT "product_variant_groups_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_groups" ADD CONSTRAINT "product_variant_groups_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_group_id_product_variant_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."product_variant_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_settings" ADD CONSTRAINT "restaurant_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "restaurant_tables" ADD CONSTRAINT "restaurant_tables_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_pages" ADD CONSTRAINT "protected_pages_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_pages" ADD CONSTRAINT "protected_pages_page_id_wb_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."wb_pages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_pages" ADD CONSTRAINT "protected_pages_requires_membership_plan_id_membership_plans_id_fk" FOREIGN KEY ("requires_membership_plan_id") REFERENCES "public"."membership_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protected_pages" ADD CONSTRAINT "protected_pages_requires_course_id_courses_id_fk" FOREIGN KEY ("requires_course_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "coupon_uses_coupon_idx" ON "coupon_uses" USING btree ("coupon_id");--> statement-breakpoint
CREATE INDEX "coupon_uses_tenant_idx" ON "coupon_uses" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "coupons_tenant_code_idx" ON "coupons" USING btree ("tenant_id","code");--> statement-breakpoint
CREATE INDEX "coupons_tenant_idx" ON "coupons" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "cc_course_idx" ON "course_chapters" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "ce_course_idx" ON "course_enrollments" USING btree ("course_id");--> statement-breakpoint
CREATE INDEX "ce_email_idx" ON "course_enrollments" USING btree ("customer_email");--> statement-breakpoint
CREATE UNIQUE INDEX "ce_tenant_email_course_idx" ON "course_enrollments" USING btree ("tenant_id","customer_email","course_id");--> statement-breakpoint
CREATE INDEX "cl_chapter_idx" ON "course_lessons" USING btree ("chapter_id");--> statement-breakpoint
CREATE INDEX "cl_course_idx" ON "course_lessons" USING btree ("course_id");--> statement-breakpoint
CREATE UNIQUE INDEX "cl_tenant_slug_idx" ON "course_lessons" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "courses_tenant_slug_idx" ON "courses" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "courses_tenant_idx" ON "courses" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "foi_order_idx" ON "food_order_items" USING btree ("food_order_id");--> statement-breakpoint
CREATE INDEX "fosh_order_idx" ON "food_order_status_history" USING btree ("food_order_id");--> statement-breakpoint
CREATE INDEX "fo_tenant_idx" ON "food_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fo_order_number_idx" ON "food_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "fo_status_idx" ON "food_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "fs_funnel_idx" ON "funnel_steps" USING btree ("funnel_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fs_tenant_slug_idx" ON "funnel_steps" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "fsub_funnel_idx" ON "funnel_submissions" USING btree ("funnel_id");--> statement-breakpoint
CREATE INDEX "fsub_tenant_idx" ON "funnel_submissions" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "funnels_tenant_slug_idx" ON "funnels" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "funnels_tenant_idx" ON "funnels" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "lp_enrollment_idx" ON "lesson_progress" USING btree ("enrollment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lp_enrollment_lesson_idx" ON "lesson_progress" USING btree ("enrollment_id","lesson_id");--> statement-breakpoint
CREATE INDEX "ld_tenant_idx" ON "local_deals" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "loi_order_idx" ON "local_order_items" USING btree ("local_order_id");--> statement-breakpoint
CREATE INDEX "lo_tenant_idx" ON "local_orders" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lo_order_number_idx" ON "local_orders" USING btree ("order_number");--> statement-breakpoint
CREATE INDEX "lo_status_idx" ON "local_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lps_tenant_idx" ON "local_pickup_slots" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "lp_tenant_slug_idx" ON "local_products" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "lp_tenant_idx" ON "local_products" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mp_tenant_slug_idx" ON "membership_plans" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "mp_tenant_idx" ON "membership_plans" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mem_tenant_idx" ON "memberships" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mem_email_idx" ON "memberships" USING btree ("customer_email");--> statement-breakpoint
CREATE INDEX "mem_plan_idx" ON "memberships" USING btree ("plan_id");--> statement-breakpoint
CREATE INDEX "mem_stripe_idx" ON "memberships" USING btree ("stripe_subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mc_tenant_slug_idx" ON "menu_categories" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "mc_tenant_idx" ON "menu_categories" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mi_tenant_slug_idx" ON "menu_items" USING btree ("tenant_id","slug");--> statement-breakpoint
CREATE INDEX "mi_tenant_idx" ON "menu_items" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "mi_category_idx" ON "menu_items" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "mmg_menu_item_idx" ON "menu_modifier_groups" USING btree ("menu_item_id");--> statement-breakpoint
CREATE INDEX "mm_group_idx" ON "menu_modifiers" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "osh_order_idx" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "pvg_product_idx" ON "product_variant_groups" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "pv_group_idx" ON "product_variants" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX "pv_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "rt_tenant_idx" ON "restaurant_tables" USING btree ("tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "rt_tenant_number_idx" ON "restaurant_tables" USING btree ("tenant_id","number");--> statement-breakpoint
CREATE UNIQUE INDEX "pp_tenant_page_idx" ON "protected_pages" USING btree ("tenant_id","page_id");