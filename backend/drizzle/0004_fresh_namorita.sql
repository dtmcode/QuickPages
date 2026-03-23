ALTER TABLE "pages" ADD COLUMN "excerpt" varchar(1000);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "featured_image" varchar(500);--> statement-breakpoint
ALTER TABLE "pages" ADD COLUMN "status" "post_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "category_id" uuid;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "pages_status_idx" ON "pages" USING btree ("status");