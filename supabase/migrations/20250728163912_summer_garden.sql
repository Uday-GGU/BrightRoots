/*
  # Create users table for parent profiles

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches auth.users.id
      - `name` (text) - user's full name
      - `email` (text) - user's email address
      - `role` (text) - user role (parent, provider, admin)
      - `phone` (text, optional) - user's phone number
      - `location` (jsonb, optional) - user's location data
      - `children` (jsonb, optional) - array of children data
      - `wishlist` (jsonb, optional) - array of wishlisted provider IDs
      - `created_at` (timestamp) - when the record was created
      - `updated_at` (timestamp) - when the record was last updated

  2. Security
    - Enable RLS on `users` table
    - Add policy for users to read/update their own data
    - Add policy for authenticated users to read basic user info

  3. Indexes
    - Index on email for faster lookups
    - Index on role for filtering
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'parent' CHECK (role IN ('parent', 'provider', 'admin')),
  phone text,
  location jsonb,
  children jsonb DEFAULT '[]'::jsonb,
  wishlist jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();