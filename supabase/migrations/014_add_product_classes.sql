-- 014_add_product_classes.sql

-- 1. Create product_classes table
CREATE TABLE public.product_classes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL UNIQUE,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.product_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated read product_classes"
  ON public.product_classes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "public read active product_classes"
  ON public.product_classes FOR SELECT
  USING (is_active = true);

CREATE POLICY "franchisor admin write product_classes"
  ON public.product_classes FOR ALL
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'franchisor_admin');

-- Insert default product classes
INSERT INTO public.product_classes (id, name, sort_order) VALUES
  ('8d9ae3b4-0f9c-448c-8837-64fdaf1a8cba', 'Course', 1),
  (gen_random_uuid(), 'Camp', 2),
  (gen_random_uuid(), 'Event', 3),
  (gen_random_uuid(), 'Merchandise', 4);

-- 2. Add product_class_id to products
ALTER TABLE public.products
ADD COLUMN product_class_id UUID REFERENCES public.product_classes(id) ON DELETE RESTRICT;

-- Set the default for existing rows if any, though it should be empty
UPDATE public.products SET product_class_id = '8d9ae3b4-0f9c-448c-8837-64fdaf1a8cba' WHERE product_class_id IS NULL;

-- Make it NOT NULL
ALTER TABLE public.products
ALTER COLUMN product_class_id SET NOT NULL;

-- 3. Add name to product_variants
ALTER TABLE public.product_variants
ADD COLUMN name VARCHAR(100);

-- Set a default name for existing rows if any
UPDATE public.product_variants SET name = frequency_per_week || 'x per week' WHERE name IS NULL;

-- Make it NOT NULL
ALTER TABLE public.product_variants
ALTER COLUMN name SET NOT NULL;
