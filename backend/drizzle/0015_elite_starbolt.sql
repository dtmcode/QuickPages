CREATE TABLE "domain_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" varchar(50) NOT NULL,
	"domain" varchar(255),
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tenant_customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255),
	"first_name" varchar(100),
	"last_name" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"is_member" boolean DEFAULT false NOT NULL,
	"member_since" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenant_payment_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"stripe_publishable_key" varchar(500),
	"stripe_secret_key_encrypted" text,
	"stripe_webhook_secret_encrypted" text,
	"stripe_mode" varchar(10) DEFAULT 'test',
	"stripe_active" boolean DEFAULT false,
	"paypal_client_id" varchar(500),
	"paypal_secret_encrypted" text,
	"paypal_mode" varchar(10) DEFAULT 'sandbox',
	"paypal_active" boolean DEFAULT false,
	"bank_active" boolean DEFAULT false,
	"bank_iban" varchar(50),
	"bank_bic" varchar(20),
	"bank_account_holder" varchar(255),
	"bank_name" varchar(255),
	"bank_reference" varchar(255),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "tenant_payment_settings_tenant_id_unique" UNIQUE("tenant_id")
);
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "custom_domain" varchar(255);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "domain_verified" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "domain_verification_token" varchar(100);--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "domain_verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "dns_records_valid" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ssl_status" varchar(20) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "ssl_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "last_dns_check" timestamp;--> statement-breakpoint
ALTER TABLE "domain_events" ADD CONSTRAINT "domain_events_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_customers" ADD CONSTRAINT "tenant_customers_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tenant_payment_settings" ADD CONSTRAINT "tenant_payment_settings_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "tenant_customers_tenant_email_idx" ON "tenant_customers" USING btree ("tenant_id","email");--> statement-breakpoint
CREATE INDEX "tenant_customers_tenant_idx" ON "tenant_customers" USING btree ("tenant_id");