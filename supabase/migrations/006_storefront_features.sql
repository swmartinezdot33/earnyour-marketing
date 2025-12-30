-- Storefront Features Migration
-- Adds categories, featured flag, preview lessons, and course bundles

-- Add new columns to courses table
ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preview_lesson_id UUID REFERENCES lessons(id) ON DELETE SET NULL;

-- Create indexes for new fields
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_featured ON courses(featured);

-- Create course_bundles table
CREATE TABLE IF NOT EXISTS course_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  course_ids UUID[] NOT NULL,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_product_id TEXT,
  stripe_price_id TEXT
);

-- Create indexes for course_bundles
CREATE INDEX IF NOT EXISTS idx_course_bundles_slug ON course_bundles(slug);
CREATE INDEX IF NOT EXISTS idx_course_bundles_published ON course_bundles(published);
CREATE INDEX IF NOT EXISTS idx_course_bundles_featured ON course_bundles(featured);

-- Enable RLS on course_bundles
ALTER TABLE course_bundles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_bundles
-- Public can read published bundles
CREATE POLICY "Anyone can read published bundles" ON course_bundles
  FOR SELECT USING (published = true);

-- Admins can manage bundles
CREATE POLICY "Admins can manage bundles" ON course_bundles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
      AND users.role = 'admin'
    )
  );

-- Update RLS policy for courses to allow public read of published courses (already exists but ensuring it's correct)
-- The existing policy should work, but we ensure it allows reading category and featured fields

-- Add comment for documentation
COMMENT ON COLUMN courses.category IS 'Course category (e.g., Marketing, SEO, CRM, Ads)';
COMMENT ON COLUMN courses.featured IS 'Whether the course is featured on the storefront';
COMMENT ON COLUMN courses.preview_lesson_id IS 'Optional lesson ID that can be previewed for free';

