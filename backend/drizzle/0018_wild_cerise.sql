CREATE TABLE "translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"field" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ui_translations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"locale" varchar(10) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "default_locale" varchar(10) DEFAULT 'de';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "enabled_locales" text[] DEFAULT '{"de"}';--> statement-breakpoint
ALTER TABLE "translations" ADD CONSTRAINT "translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ui_translations" ADD CONSTRAINT "ui_translations_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "translations_unique_idx" ON "translations" USING btree ("tenant_id","entity_type","entity_id","locale","field");--> statement-breakpoint
CREATE INDEX "translations_tenant_idx" ON "translations" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "translations_entity_idx" ON "translations" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ui_translations_unique_idx" ON "ui_translations" USING btree ("tenant_id","locale","key");--> statement-breakpoint
CREATE INDEX "ui_translations_tenant_idx" ON "ui_translations" USING btree ("tenant_id");