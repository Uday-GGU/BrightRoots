/*
  # Seed Sample Classes Data

  1. Sample Classes
    - Creates realistic sample classes for all service categories
    - Includes proper pricing, schedules, and descriptions
    - Only inserts if no classes exist to prevent duplicates

  2. Categories Covered
    - Tuition: Math, Science classes
    - Music: Piano, Guitar lessons
    - Dance: Classical, Hip Hop classes
    - Sports: Football, Swimming training
    - Coding: Python, Web Development courses
    - Art: Drawing, Painting workshops
    - Daycare: After-school, Full-day care
    - Camps: Summer Activity, STEM camps
*/

-- Only insert sample data if no classes exist
DO $$
BEGIN
  -- Check if any classes already exist
  IF NOT EXISTS (SELECT 1 FROM provider_classes LIMIT 1) THEN
    
    -- Insert sample classes for tuition providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Mathematics (Class 9-10)',
      'Comprehensive math coaching with concept clarity and problem-solving techniques',
      'tuition',
      '14-16 years',
      'offline',
      '90 minutes',
      1200,
      'per_session',
      8,
      '{"timings": ["Mon 4-5:30 PM", "Wed 4-5:30 PM", "Fri 4-5:30 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'tuition' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Science (Physics & Chemistry)',
      'Interactive science classes with practical experiments and theory',
      'tuition',
      '14-18 years',
      'offline',
      '2 hours',
      1500,
      'per_session',
      6,
      '{"timings": ["Tue 5-7 PM", "Thu 5-7 PM", "Sat 10-12 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'tuition' AND p.status = 'approved';

    -- Insert sample classes for music providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Piano for Beginners',
      'Learn piano basics with fun exercises and popular songs',
      'music',
      '6-12 years',
      'offline',
      '45 minutes',
      1500,
      'per_session',
      4,
      '{"timings": ["Mon 4-5 PM", "Wed 4-5 PM", "Sat 10-11 AM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'music' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Guitar Classes',
      'Acoustic and electric guitar lessons for all skill levels',
      'music',
      '10-18 years',
      'offline',
      '60 minutes',
      1800,
      'per_session',
      3,
      '{"timings": ["Tue 5-6 PM", "Thu 5-6 PM", "Sun 11-12 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'music' AND p.status = 'approved';

    -- Insert sample classes for dance providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Classical Dance (Bharatanatyam)',
      'Traditional Indian classical dance with proper technique and expressions',
      'dance',
      '8-16 years',
      'offline',
      '90 minutes',
      2000,
      'per_session',
      10,
      '{"timings": ["Mon 6-7:30 PM", "Wed 6-7:30 PM", "Sat 4-5:30 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'dance' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Hip Hop Dance',
      'Modern hip hop dance moves and choreography for kids and teens',
      'dance',
      '10-18 years',
      'offline',
      '60 minutes',
      1600,
      'per_session',
      12,
      '{"timings": ["Tue 6-7 PM", "Thu 6-7 PM", "Sun 5-6 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'dance' AND p.status = 'approved';

    -- Insert sample classes for sports providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Football Training',
      'Professional football coaching for young athletes with skill development',
      'sports',
      '8-16 years',
      'offline',
      '90 minutes',
      2000,
      'per_session',
      15,
      '{"timings": ["Tue 5-6:30 PM", "Thu 5-6:30 PM", "Sun 9-10:30 AM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'sports' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Swimming Classes',
      'Learn swimming techniques from basic to advanced levels',
      'sports',
      '6-14 years',
      'offline',
      '60 minutes',
      2500,
      'per_session',
      8,
      '{"timings": ["Mon 6-7 AM", "Wed 6-7 AM", "Fri 6-7 AM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'sports' AND p.status = 'approved';

    -- Insert sample classes for coding providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Python for Kids',
      'Learn programming with fun Python projects and games',
      'coding',
      '10-16 years',
      'online',
      '60 minutes',
      1800,
      'per_session',
      6,
      '{"timings": ["Mon 6-7 PM", "Wed 6-7 PM", "Sat 11-12 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'coding' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Web Development Basics',
      'HTML, CSS, and JavaScript fundamentals for teenagers',
      'coding',
      '13-18 years',
      'online',
      '90 minutes',
      2200,
      'per_session',
      5,
      '{"timings": ["Tue 7-8:30 PM", "Thu 7-8:30 PM", "Sun 2-3:30 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'coding' AND p.status = 'approved';

    -- Insert sample classes for art providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Drawing & Sketching',
      'Basic to advanced drawing techniques with pencil and charcoal',
      'art',
      '8-16 years',
      'offline',
      '90 minutes',
      1400,
      'per_session',
      8,
      '{"timings": ["Mon 4-5:30 PM", "Wed 4-5:30 PM", "Sat 2-3:30 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'art' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Painting Workshop',
      'Watercolor and acrylic painting techniques for creative expression',
      'art',
      '10-18 years',
      'offline',
      '2 hours',
      1800,
      'per_session',
      6,
      '{"timings": ["Tue 4-6 PM", "Thu 4-6 PM", "Sun 10-12 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'art' AND p.status = 'approved';

    -- Insert sample classes for daycare providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'After School Care',
      'Safe and supervised after-school care with homework assistance',
      'daycare',
      '6-12 years',
      'offline',
      '3 hours',
      8000,
      'monthly',
      20,
      '{"timings": ["Mon-Fri 2-5 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'daycare' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Full Day Care',
      'Complete daycare services with meals, activities, and learning',
      'daycare',
      '3-6 years',
      'offline',
      '8 hours',
      15000,
      'monthly',
      15,
      '{"timings": ["Mon-Fri 8 AM-4 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'daycare' AND p.status = 'approved';

    -- Insert sample classes for camps providers
    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'Summer Activity Camp',
      'Fun-filled summer camp with sports, arts, and outdoor activities',
      'camps',
      '8-14 years',
      'offline',
      '6 hours',
      12000,
      'monthly',
      25,
      '{"timings": ["Mon-Fri 9 AM-3 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'camps' AND p.status = 'approved';

    INSERT INTO provider_classes (provider_id, name, description, category, age_group, mode, duration, price, fee_type, batch_size, schedule)
    SELECT 
      p.id,
      'STEM Camp',
      'Science, technology, engineering, and math activities for curious minds',
      'camps',
      '10-16 years',
      'offline',
      '4 hours',
      10000,
      'monthly',
      15,
      '{"timings": ["Mon-Fri 10 AM-2 PM"]}'::jsonb
    FROM providers p
    JOIN provider_services ps ON p.id = ps.provider_id
    WHERE ps.category = 'camps' AND p.status = 'approved';

    RAISE NOTICE 'Sample class data inserted successfully!';
  ELSE
    RAISE NOTICE 'Sample class data already exists, skipping insertion.';
  END IF;
END $$;