-- Discounts and Coupons Migration
-- Adds support for discounts and coupon codes

-- Discounts table (for course/bundle discounts)
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  -- For percentage: 0-100, for fixed_amount: dollar amount
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('course', 'bundle', 'all')),
  -- Specific course/bundle IDs (null means all)
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES course_bundles(id) ON DELETE CASCADE,
  min_purchase_amount DECIMAL(10, 2),
  max_discount_amount DECIMAL(10, 2), -- For percentage discounts
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- Total number of times discount can be used
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupon codes table
CREATE TABLE IF NOT EXISTS coupon_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL,
  -- For percentage: 0-100, for fixed_amount: dollar amount
  applicable_to TEXT NOT NULL CHECK (applicable_to IN ('course', 'bundle', 'all', 'cart')),
  -- Specific course/bundle IDs (null means all)
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  bundle_id UUID REFERENCES course_bundles(id) ON DELETE CASCADE,
  min_cart_amount DECIMAL(10, 2), -- Minimum cart total to use coupon
  max_discount_amount DECIMAL(10, 2), -- For percentage discounts
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  active BOOLEAN DEFAULT true,
  usage_limit INTEGER, -- Total number of times coupon can be used
  usage_count INTEGER DEFAULT 0,
  user_limit INTEGER, -- Number of times a single user can use this coupon
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Track coupon usage per user
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID REFERENCES coupon_codes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id TEXT, -- Stripe checkout session ID or order reference
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(coupon_id, user_id, order_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(active);
CREATE INDEX IF NOT EXISTS idx_discounts_course_id ON discounts(course_id);
CREATE INDEX IF NOT EXISTS idx_discounts_bundle_id ON discounts(bundle_id);
CREATE INDEX IF NOT EXISTS idx_discounts_dates ON discounts(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_coupon_codes_code ON coupon_codes(code);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_active ON coupon_codes(active);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_course_id ON coupon_codes(course_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_bundle_id ON coupon_codes(bundle_id);
CREATE INDEX IF NOT EXISTS idx_coupon_codes_dates ON coupon_codes(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_id ON coupon_usage(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- Enable RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Discounts: Public can read active discounts, admins can manage
CREATE POLICY "Public can read active discounts" ON discounts
  FOR SELECT USING (active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Admins can manage discounts" ON discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
      AND users.role = 'admin'
    )
  );

-- Coupon codes: Public can read active coupons, admins can manage
CREATE POLICY "Public can read active coupon codes" ON coupon_codes
  FOR SELECT USING (active = true AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

CREATE POLICY "Admins can manage coupon codes" ON coupon_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
      AND users.role = 'admin'
    )
  );

-- Coupon usage: Users can read their own usage, admins can read all
CREATE POLICY "Users can read own coupon usage" ON coupon_usage
  FOR SELECT USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "System can create coupon usage" ON coupon_usage
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read all coupon usage" ON coupon_usage
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id::text = current_setting('request.jwt.claims', true)::json->>'user_id'
      AND users.role = 'admin'
    )
  );

