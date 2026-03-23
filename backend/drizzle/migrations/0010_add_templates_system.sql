-- ==================== TEMPLATE SYSTEM ====================

-- Enums
CREATE TYPE template_category AS ENUM ('business', 'shop', 'blog', 'landing', 'portfolio', 'custom');

CREATE TYPE section_type AS ENUM ('hero', 'features', 'contact', 'newsletter', 'products', 'blog', 'gallery', 'testimonials', 'cta', 'team', 'pricing', 'faq', 'stats', 'footer', 'custom');

-- Templates Table
CREATE TABLE IF NOT EXISTS templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category template_category NOT NULL,
  description TEXT,
  thumbnail TEXT,
  is_preset BOOLEAN DEFAULT false NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Sections Table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type section_type NOT NULL,
  component VARCHAR(100) NOT NULL,
  description TEXT,
  config JSONB DEFAULT '{}'::jsonb NOT NULL,
  is_preset BOOLEAN DEFAULT false NOT NULL,
  is_public BOOLEAN DEFAULT false NOT NULL,
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Template Sections Junction
CREATE TABLE IF NOT EXISTS template_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  override_config JSONB DEFAULT '{}'::jsonb NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add fields to tenants table
ALTER TABLE tenants
ADD COLUMN IF NOT EXISTS active_template_id UUID REFERENCES templates (id) ON DELETE SET NULL;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS template_customizations JSONB DEFAULT '{}'::jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS templates_tenant_idx ON templates (tenant_id);

CREATE INDEX IF NOT EXISTS templates_category_idx ON templates (category);

CREATE INDEX IF NOT EXISTS templates_preset_idx ON templates (is_preset);

CREATE INDEX IF NOT EXISTS sections_tenant_idx ON sections (tenant_id);

CREATE INDEX IF NOT EXISTS sections_type_idx ON sections(type);

CREATE INDEX IF NOT EXISTS sections_preset_idx ON sections (is_preset);

CREATE INDEX IF NOT EXISTS template_sections_template_idx ON template_sections (template_id);

CREATE INDEX IF NOT EXISTS template_sections_section_idx ON template_sections (section_id);

CREATE INDEX IF NOT EXISTS template_sections_order_idx ON template_sections (order_index);