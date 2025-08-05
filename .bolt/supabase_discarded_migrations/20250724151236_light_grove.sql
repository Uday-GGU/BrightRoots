-- BrightRoots Database Schema Update
-- This schema aligns with the existing application code and provides all necessary functionality

-- First, let's create a comprehensive schema that matches the application

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Users table (simplified - auth handled by Supabase Auth)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('parent', 'provider', 'admin')) NOT NULL DEFAULT 'parent',
    location JSONB, -- Store city, area, coordinates
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Providers table (comprehensive business information)
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    website TEXT,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    pincode TEXT NOT NULL,
    latitude NUMERIC,
    longitude NUMERIC,
    status TEXT CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')) DEFAULT 'pending',
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id)
);

-- Provider services/categories
CREATE TABLE IF NOT EXISTS provider_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    category TEXT CHECK (category IN ('tuition', 'music', 'dance', 'sports', 'coding', 'art', 'daycare', 'camps')) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider classes/offerings
CREATE TABLE IF NOT EXISTS provider_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    age_group TEXT NOT NULL,
    mode TEXT CHECK (mode IN ('online', 'offline', 'hybrid')) NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    fee_type TEXT CHECK (fee_type IN ('per_session', 'monthly')) DEFAULT 'per_session',
    batch_size INTEGER,
    schedule JSONB, -- Store flexible schedule data
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Provider documents for verification
CREATE TABLE IF NOT EXISTS provider_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    document_type TEXT CHECK (document_type IN ('pan', 'aadhaar', 'business_registration', 'certificate', 'other')) NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_notes TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id)
);

-- Provider media (images, videos)
CREATE TABLE IF NOT EXISTS provider_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    media_type TEXT CHECK (media_type IN ('profile_image', 'cover_image', 'gallery', 'video')) NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    caption TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries (parent to provider communication)
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_name TEXT NOT NULL,
    parent_phone TEXT NOT NULL,
    parent_email TEXT,
    child_name TEXT NOT NULL,
    child_age INTEGER NOT NULL,
    interested_class_id UUID REFERENCES provider_classes(id),
    message TEXT NOT NULL,
    status TEXT CHECK (status IN ('sent', 'responded', 'closed')) DEFAULT 'sent',
    response TEXT,
    response_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES provider_classes(id) ON DELETE CASCADE,
    enquiry_id UUID REFERENCES enquiries(id),
    child_name TEXT NOT NULL,
    child_age INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    start_date DATE,
    end_date DATE,
    total_amount NUMERIC,
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews and ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id),
    parent_name TEXT NOT NULL,
    child_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('enquiry', 'booking', 'review', 'verification', 'system')) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB, -- Additional data for the notification
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_city_area ON providers(city, area);
CREATE INDEX IF NOT EXISTS idx_providers_status ON providers(status);
CREATE INDEX IF NOT EXISTS idx_providers_user_id ON providers(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_services_provider_id ON provider_services(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_classes_provider_id ON provider_classes(provider_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_provider_id ON enquiries(provider_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_parent_id ON enquiries(parent_id);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_provider_classes_updated_at BEFORE UPDATE ON provider_classes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

-- RLS Policies

-- Providers policies
CREATE POLICY "Providers can manage own data" ON providers FOR ALL TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Anyone can view approved providers" ON providers FOR SELECT TO authenticated USING (status = 'approved');

-- Provider services policies
CREATE POLICY "Providers can manage own services" ON provider_services FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view services of approved providers" ON provider_services FOR SELECT TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Provider classes policies
CREATE POLICY "Providers can manage own classes" ON provider_classes FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view classes of approved providers" ON provider_classes FOR SELECT TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Provider documents policies (only providers can manage their own documents)
CREATE POLICY "Providers can manage own documents" ON provider_documents FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Provider media policies
CREATE POLICY "Providers can manage own media" ON provider_media FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Anyone can view media of approved providers" ON provider_media FOR SELECT TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE status = 'approved'));

-- Enquiries policies
CREATE POLICY "Parents can create enquiries" ON enquiries FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents can view their own enquiries" ON enquiries FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Providers can view enquiries sent to them" ON enquiries FOR SELECT TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));
CREATE POLICY "Providers can update enquiries sent to them" ON enquiries FOR UPDATE TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Bookings policies
CREATE POLICY "Parents can view their own bookings" ON bookings FOR SELECT TO authenticated USING (parent_id = auth.uid());
CREATE POLICY "Providers can manage bookings for their classes" ON bookings FOR ALL TO authenticated USING (provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid()));

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Parents can create reviews for their bookings" ON reviews FOR INSERT TO authenticated WITH CHECK (parent_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can manage their own notifications" ON notifications FOR ALL TO authenticated USING (user_id = auth.uid());

-- Insert seed data
INSERT INTO users (id, name, email, role, location) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'Asha Mehta', 'asha@example.com', 'parent', '{"city": "Bangalore", "area": "Koramangala", "pincode": "560034"}'),
    ('550e8400-e29b-41d4-a716-446655440002', 'Rohan Sharma', 'rohan@example.com', 'provider', '{"city": "Bangalore", "area": "Indiranagar", "pincode": "560038"}'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Priya Singh', 'priya@example.com', 'parent', '{"city": "Gurgaon", "area": "Sector 15", "pincode": "122001"}')
ON CONFLICT (email) DO NOTHING;

-- Insert sample providers
INSERT INTO providers (id, user_id, business_name, owner_name, email, phone, description, address, city, area, pincode, latitude, longitude, status, is_verified) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440002', 'Excel Maths Academy', 'Rohan Sharma', 'rohan@example.com', '+91 9876543210', 'Top quality mathematics coaching for all grades', '123 Main Street, Indiranagar', 'Bangalore', 'Indiranagar', '560038', 12.9716, 77.5946, 'approved', true)
ON CONFLICT (id) DO NOTHING;

-- Insert provider services
INSERT INTO provider_services (provider_id, category) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'tuition')
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', 'Mathematics Grade 9-10', 'Comprehensive math coaching for CBSE students', 'tuition', '14-16 years', 'offline', '90 minutes', 1500, 'per_session')
ON CONFLICT DO NOTHING;

-- Insert sample enquiry
INSERT INTO enquiries (provider_id, parent_id, parent_name, parent_phone, child_name, child_age, message, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440001', 'Asha Mehta', '+91 9123456789', 'Arjun', 15, 'Looking for math tuition for my son who is in grade 10', 'sent')
ON CONFLICT DO NOTHING;