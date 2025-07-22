/*
  # Storage Buckets for Provider Platform

  1. Buckets
    - `provider-documents` - For verification documents (PAN, Aadhaar, etc.)
    - `provider-images` - For profile, cover, and gallery images
    - `provider-videos` - For promotional videos

  2. Security
    - Providers can upload to their own folders
    - Public read access for approved provider images
    - Private access for documents
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('provider-documents', 'provider-documents', false),
  ('provider-images', 'provider-images', true),
  ('provider-videos', 'provider-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for provider-documents bucket (private)
CREATE POLICY "Providers can upload their own documents" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can view their own documents" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'provider-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can update their own documents" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'provider-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can delete their own documents" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'provider-documents' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policies for provider-images bucket (public read)
CREATE POLICY "Anyone can view provider images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'provider-images');

CREATE POLICY "Providers can upload their own images" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can update their own images" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'provider-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can delete their own images" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'provider-images' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policies for provider-videos bucket (public read)
CREATE POLICY "Anyone can view provider videos" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'provider-videos');

CREATE POLICY "Providers can upload their own videos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'provider-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can update their own videos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'provider-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Providers can delete their own videos" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'provider-videos' AND 
    (storage.foldername(name))[1] = auth.uid()::text
  );