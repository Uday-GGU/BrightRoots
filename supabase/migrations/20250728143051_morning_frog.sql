/*
  # Fix duplicate trigger error

  This migration fixes the "trigger already exists" error by:
  1. Dropping existing triggers if they exist
  2. Recreating them properly with IF NOT EXISTS checks
  
  ## Changes
  - Drop and recreate update_providers_updated_at trigger
  - Drop and recreate update_provider_classes_updated_at trigger  
  - Drop and recreate update_bookings_updated_at trigger
  - Ensure update_updated_at_column function exists
*/

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_providers_updated_at ON providers;
DROP TRIGGER IF EXISTS update_provider_classes_updated_at ON provider_classes;
DROP TRIGGER IF EXISTS update_bookings_updated_at ON bookings;

-- Create or replace the trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate triggers
CREATE TRIGGER update_providers_updated_at
    BEFORE UPDATE ON providers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_classes_updated_at
    BEFORE UPDATE ON provider_classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();