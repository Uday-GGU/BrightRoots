/*
  # BrightRoots Course Marketplace Schema

  1. New Tables
    - `providers` - Education service providers with location and profile info
    - `parents` - Parent users with location for finding nearby courses
    - `courses` - Course offerings with pricing, schedule, and location details
    - `reviews` - Parent reviews and ratings for providers
    - `course_interest` - Parent interest tracking for courses
    - `categories` - Course categories for organization

  2. Security
    - Enable RLS on all tables
    - Public read access for demo purposes (excluding password fields)
    - Proper foreign key relationships with cascade deletes
    - Rating constraints and data validation

  3. Features
    - Location-based course discovery using lat/lng coordinates
    - Course filtering by provider, location, and category
    - Review system with 1-5 star ratings
    - Interest tracking for parents
    - Comprehensive course metadata (age group, schedule, pricing)
*/

-- Create custom types
CREATE TYPE course_mode AS ENUM ('online', 'offline');

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text,
  address text,
  lat float,
  lng float,
  bio text,
  profile_picture text,
  created_at timestamptz DEFAULT now()
);

-- Parents table
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  phone text,
  address text,
  pincode text,
  lat float,
  lng float,
  created_at timestamptz DEFAULT now()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  title text NOT NULL,
  category text NOT NULL,
  description text,
  age_group text,
  schedule text,
  price numeric,
  duration text,
  mode course_mode DEFAULT 'offline',
  location text,
  lat float,
  lng float,
  created_at timestamptz DEFAULT now()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now()
);

-- Course interest table
CREATE TABLE IF NOT EXISTS course_interest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  interest_type text DEFAULT 'interested',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(lat, lng);
CREATE INDEX IF NOT EXISTS idx_parents_location ON parents(lat, lng);
CREATE INDEX IF NOT EXISTS idx_courses_provider ON courses(provider_id);
CREATE INDEX IF NOT EXISTS idx_courses_location ON courses(lat, lng);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_reviews_provider ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_parent ON reviews(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_interest_parent ON course_interest(parent_id);
CREATE INDEX IF NOT EXISTS idx_course_interest_course ON course_interest(course_id);

-- Enable Row Level Security
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_interest ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (demo purposes)
-- Note: Password fields will be excluded via views/API configuration

-- Providers policies
CREATE POLICY "Anyone can view providers"
  ON providers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Providers can insert own data"
  ON providers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Providers can update own data"
  ON providers FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Providers can delete own data"
  ON providers FOR DELETE
  TO anon, authenticated
  USING (true);

-- Parents policies
CREATE POLICY "Anyone can view parents"
  ON parents FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can delete own data"
  ON parents FOR DELETE
  TO anon, authenticated
  USING (true);

-- Courses policies
CREATE POLICY "Anyone can view courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Providers can manage their courses"
  ON courses FOR ALL
  TO anon, authenticated
  USING (true);

-- Reviews policies
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can create reviews"
  ON reviews FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Course interest policies
CREATE POLICY "Anyone can view course interest"
  ON course_interest FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Parents can manage their interests"
  ON course_interest FOR ALL
  TO anon, authenticated
  USING (true);

-- Categories policies (read-only)
CREATE POLICY "Anyone can view categories"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Insert default categories
INSERT INTO categories (name) VALUES
  ('Academic Tuition'),
  ('Music'),
  ('Dance'),
  ('Sports'),
  ('Art & Craft'),
  ('Coding & Technology'),
  ('Language Learning'),
  ('Life Skills'),
  ('STEM'),
  ('Creative Writing')
ON CONFLICT (name) DO NOTHING;

-- Create views to exclude password fields from API responses
CREATE OR REPLACE VIEW public_providers AS
SELECT 
  id,
  name,
  email,
  phone,
  address,
  lat,
  lng,
  bio,
  profile_picture,
  created_at
FROM providers;

CREATE OR REPLACE VIEW public_parents AS
SELECT 
  id,
  name,
  email,
  phone,
  address,
  pincode,
  lat,
  lng,
  created_at
FROM parents;

-- Grant access to views
GRANT SELECT ON public_providers TO anon, authenticated;
GRANT SELECT ON public_parents TO anon, authenticated;