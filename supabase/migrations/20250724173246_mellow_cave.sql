/*
  # Add is_published column to providers table

  1. Changes
    - Add `is_published` boolean column to providers table
    - Set default value to false for existing records
    - New providers will default to false (admin can publish them)

  2. Security
    - No RLS changes needed as existing policies will apply
*/

-- Add is_published column to providers table
ALTER TABLE providers ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT FALSE;

-- Update existing approved providers to be published
UPDATE providers SET is_published = TRUE WHERE status = 'approved';