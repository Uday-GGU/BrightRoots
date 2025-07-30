/*
  # Create Sample Provider Data

  1. Sample Data
    - Insert sample provider with complete profile
    - Insert sample courses for the provider
    - Ensure proper relationships and data integrity

  2. Data Structure
    - Provider with realistic information
    - Multiple courses across different categories
    - Proper location data for distance calculations
*/

-- Insert sample provider
INSERT INTO providers (
  id,
  user_id,
  business_name,
  owner_name,
  email,
  phone,
  whatsapp,
  description,
  address,
  city,
  area,
  pincode,
  latitude,
  longitude,
  status,
  is_verified,
  is_published,
  created_at,
  updated_at
) VALUES (
  'sample-provider-1',
  null, -- No auth user for sample data
  'Bright Minds Learning Center',
  'Priya Sharma',
  'priya@brightminds.com',
  '+91 98765 43210',
  '+91 98765 43210',
  'Professional education center offering quality tuition and skill development classes for children of all ages.',
  'Sector 15, Gurgaon',
  'Gurgaon',
  'Sector 15',
  '122001',
  28.4595,
  77.0266,
  'approved',
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert sample services for the provider
INSERT INTO provider_services (provider_id, category) VALUES
  ('sample-provider-1', 'tuition'),
  ('sample-provider-1', 'coding'),
  ('sample-provider-1', 'art')
ON CONFLICT DO NOTHING;

-- Insert sample classes
INSERT INTO provider_classes (
  id,
  provider_id,
  name,
  description,
  category,
  age_group,
  mode,
  duration,
  price,
  fee_type,
  batch_size,
  schedule,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'sample-class-1',
  'sample-provider-1',
  'Mathematics Mastery',
  'Comprehensive math program covering algebra, geometry, and problem-solving techniques',
  'tuition',
  '10-14 years',
  'offline',
  '90 minutes',
  2000,
  'monthly',
  8,
  '{"timings": ["Mon 4-5:30 PM", "Wed 4-5:30 PM", "Fri 4-5:30 PM"]}',
  true,
  now(),
  now()
),
(
  'sample-class-2',
  'sample-provider-1',
  'Python for Kids',
  'Learn programming fundamentals with Python through fun projects and games',
  'coding',
  '8-16 years',
  'hybrid',
  '60 minutes',
  1800,
  'monthly',
  6,
  '{"timings": ["Sat 10-11 AM", "Sun 10-11 AM"]}',
  true,
  now(),
  now()
),
(
  'sample-class-3',
  'sample-provider-1',
  'Creative Art Workshop',
  'Explore creativity through painting, sketching, and craft activities',
  'art',
  '5-12 years',
  'offline',
  '75 minutes',
  1500,
  'monthly',
  10,
  '{"timings": ["Sat 2-3:15 PM", "Sun 2-3:15 PM"]}',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;

-- Insert another sample provider in different location
INSERT INTO providers (
  id,
  user_id,
  business_name,
  owner_name,
  email,
  phone,
  whatsapp,
  description,
  address,
  city,
  area,
  pincode,
  latitude,
  longitude,
  status,
  is_verified,
  is_published,
  created_at,
  updated_at
) VALUES (
  'sample-provider-2',
  null,
  'Harmony Music Academy',
  'Rajesh Kumar',
  'rajesh@harmonymusic.com',
  '+91 99887 76543',
  '+91 99887 76543',
  'Professional music education with experienced instructors for all age groups.',
  'Phase 2, Gurgaon',
  'Gurgaon',
  'Phase 2',
  '122002',
  28.4421,
  77.0382,
  'approved',
  true,
  true,
  now(),
  now()
) ON CONFLICT (id) DO NOTHING;

-- Insert services for second provider
INSERT INTO provider_services (provider_id, category) VALUES
  ('sample-provider-2', 'music'),
  ('sample-provider-2', 'dance')
ON CONFLICT DO NOTHING;

-- Insert classes for second provider
INSERT INTO provider_classes (
  id,
  provider_id,
  name,
  description,
  category,
  age_group,
  mode,
  duration,
  price,
  fee_type,
  batch_size,
  schedule,
  is_active,
  created_at,
  updated_at
) VALUES 
(
  'sample-class-4',
  'sample-provider-2',
  'Piano Fundamentals',
  'Learn piano basics with proper technique and music theory',
  'music',
  '6-16 years',
  'offline',
  '45 minutes',
  1600,
  'monthly',
  4,
  '{"timings": ["Mon 5-5:45 PM", "Wed 5-5:45 PM", "Sat 11-11:45 AM"]}',
  true,
  now(),
  now()
),
(
  'sample-class-5',
  'sample-provider-2',
  'Classical Dance',
  'Traditional Indian classical dance training with cultural appreciation',
  'dance',
  '8-18 years',
  'offline',
  '60 minutes',
  1400,
  'monthly',
  12,
  '{"timings": ["Tue 6-7 PM", "Thu 6-7 PM", "Sun 4-5 PM"]}',
  true,
  now(),
  now()
)
ON CONFLICT (id) DO NOTHING;