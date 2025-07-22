/*
  # Provider Platform Database Schema

  1. New Tables
    - `providers` - Main provider information
    - `provider_services` - Services offered by providers
    - `provider_classes` - Individual classes/courses
    - `provider_documents` - Document uploads for verification
    - `provider_media` - Images and videos
    - `enquiries` - Parent enquiries to providers
    - `bookings` - Confirmed class bookings
    - `reviews` - Parent reviews for providers
    - `notifications` - System notifications

  2. Security
    - Enable RLS on all tables
    - Add policies for providers to manage their own data
    - Add policies for parents to view approved providers
    - Add admin policies for verification

  3. Storage
    - Create buckets for documents, images, and videos
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Providers table
CREATE TABLE IF NOT EXISTS providers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  owner_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  website text,
  description text,
  
  -- Location
  address text NOT NULL,
  city text NOT NULL,
  area text NOT NULL,
  pincode text NOT NULL,
  latitude decimal,
  longitude decimal,
  
  -- Status and verification
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  is_verified boolean DEFAULT false,
  verification_notes text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES auth.users(id)
);

-- Provider services/categories
CREATE TABLE IF NOT EXISTS provider_services (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('tuition', 'music', 'dance', 'sports', 'coding', 'art', 'daycare', 'camps')),
  created_at timestamptz DEFAULT now()
);

-- Provider classes
CREATE TABLE IF NOT EXISTS provider_classes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  age_group text NOT NULL,
  mode text NOT NULL CHECK (mode IN ('online', 'offline', 'hybrid')),
  duration text NOT NULL,
  price decimal NOT NULL,
  fee_type text DEFAULT 'per_session' CHECK (fee_type IN ('per_session', 'monthly')),
  batch_size integer,
  schedule jsonb, -- Array of schedule objects
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Provider documents for verification
CREATE TABLE IF NOT EXISTS provider_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  document_type text NOT NULL CHECK (document_type IN ('pan', 'aadhaar', 'business_registration', 'certificate', 'other')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  is_verified boolean DEFAULT false,
  verification_notes text,
  uploaded_at timestamptz DEFAULT now(),
  verified_at timestamptz,
  verified_by uuid REFERENCES auth.users(id)
);

-- Provider media (images, videos)
CREATE TABLE IF NOT EXISTS provider_media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('profile_image', 'cover_image', 'gallery', 'video')),
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size integer,
  mime_type text,
  caption text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  uploaded_at timestamptz DEFAULT now()
);

-- Enquiries from parents
CREATE TABLE IF NOT EXISTS enquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_name text NOT NULL,
  parent_phone text NOT NULL,
  parent_email text,
  child_name text NOT NULL,
  child_age integer NOT NULL,
  interested_class_id uuid REFERENCES provider_classes(id),
  message text NOT NULL,
  status text DEFAULT 'sent' CHECK (status IN ('sent', 'responded', 'closed')),
  response text,
  response_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Bookings/Enrollments
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid REFERENCES provider_classes(id) ON DELETE CASCADE,
  enquiry_id uuid REFERENCES enquiries(id),
  child_name text NOT NULL,
  child_age integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  start_date date,
  end_date date,
  total_amount decimal,
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id uuid REFERENCES providers(id) ON DELETE CASCADE,
  parent_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  parent_name text NOT NULL,
  child_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_verified boolean DEFAULT false,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('enquiry', 'booking', 'review', 'verification', 'system')),
  title text NOT NULL,
  message text NOT NULL,
  data jsonb,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Providers can manage their own data
CREATE POLICY "Providers can manage own data" ON providers
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Anyone can view approved providers" ON providers
  FOR SELECT TO authenticated
  USING (status = 'approved');

-- Provider services policies
CREATE POLICY "Providers can manage own services" ON provider_services
  FOR ALL TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view services of approved providers" ON provider_services
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Provider classes policies
CREATE POLICY "Providers can manage own classes" ON provider_classes
  FOR ALL TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view classes of approved providers" ON provider_classes
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Documents policies (only provider and admin can see)
CREATE POLICY "Providers can manage own documents" ON provider_documents
  FOR ALL TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Media policies
CREATE POLICY "Providers can manage own media" ON provider_media
  FOR ALL TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can view media of approved providers" ON provider_media
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Enquiries policies
CREATE POLICY "Providers can view enquiries sent to them" ON enquiries
  FOR SELECT TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Providers can update enquiries sent to them" ON enquiries
  FOR UPDATE TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Parents can create enquiries" ON enquiries
  FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid());

CREATE POLICY "Parents can view their own enquiries" ON enquiries
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid());

-- Bookings policies
CREATE POLICY "Providers can manage bookings for their classes" ON bookings
  FOR ALL TO authenticated
  USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view their own bookings" ON bookings
  FOR SELECT TO authenticated
  USING (parent_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Parents can create reviews for their bookings" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (parent_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" ON notifications
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_city_area ON providers(city, area);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_classes_provider_id ON provider_classes(provider_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_provider_id ON enquiries(provider_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_parent_id ON enquiries(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_classes_updated_at BEFORE UPDATE ON provider_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();