/*
  # Smart Water Distribution Management System - Database Schema

  ## Overview
  Creates the complete database schema for the water distribution management system
  with multi-language SMS alerts and scheduling capabilities.

  ## New Tables

  ### 1. areas
  - `id` (uuid, primary key) - Unique identifier for each area
  - `name` (text) - Area name (e.g., "Anna Nagar", "T Nagar")
  - `created_at` (timestamp) - Record creation timestamp
  - `updated_at` (timestamp) - Record update timestamp

  ### 2. users (for water distribution recipients)
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text) - User's name
  - `phone` (text) - Phone number for SMS
  - `area_id` (uuid, foreign key) - References areas table
  - `created_at` (timestamp) - Record creation timestamp
  - `updated_at` (timestamp) - Record update timestamp

  ### 3. water_schedules
  - `id` (uuid, primary key) - Unique identifier
  - `area_id` (uuid, foreign key) - References areas table
  - `start_time` (text) - Start time (e.g., "06:00 AM")
  - `end_time` (text) - End time (e.g., "09:00 AM")
  - `is_active` (boolean) - Whether schedule is active
  - `created_at` (timestamp) - Record creation timestamp
  - `updated_at` (timestamp) - Record update timestamp

  ### 4. sms_logs
  - `id` (uuid, primary key) - Unique identifier
  - `user_id` (uuid, foreign key) - References users table
  - `message` (text) - SMS content (in Tamil)
  - `status` (text) - 'sent' or 'failed'
  - `area_name` (text) - Area name for reference
  - `phone` (text) - Phone number (denormalized for reporting)
  - `sent_at` (timestamp) - SMS send timestamp

  ## Security
  - Enable RLS on all tables
  - Create policies for authenticated admin access
  - Restrict all operations to authenticated users only
*/

-- Create areas table
CREATE TABLE IF NOT EXISTS areas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users table (water distribution recipients)
CREATE TABLE IF NOT EXISTS distribution_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  area_id uuid REFERENCES areas(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create water_schedules table
CREATE TABLE IF NOT EXISTS water_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id uuid REFERENCES areas(id) ON DELETE CASCADE,
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sms_logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES distribution_users(id) ON DELETE SET NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  area_name text NOT NULL,
  phone text NOT NULL,
  sent_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE distribution_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for areas table
CREATE POLICY "Authenticated users can view areas"
  ON areas FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert areas"
  ON areas FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update areas"
  ON areas FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete areas"
  ON areas FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for distribution_users table
CREATE POLICY "Authenticated users can view distribution users"
  ON distribution_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert distribution users"
  ON distribution_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update distribution users"
  ON distribution_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete distribution users"
  ON distribution_users FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for water_schedules table
CREATE POLICY "Authenticated users can view water schedules"
  ON water_schedules FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert water schedules"
  ON water_schedules FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update water schedules"
  ON water_schedules FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete water schedules"
  ON water_schedules FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for sms_logs table
CREATE POLICY "Authenticated users can view sms logs"
  ON sms_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert sms logs"
  ON sms_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_area_id ON distribution_users(area_id);
CREATE INDEX IF NOT EXISTS idx_schedules_area_id ON water_schedules(area_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_user_id ON sms_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_logs_sent_at ON sms_logs(sent_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_areas_updated_at
  BEFORE UPDATE ON areas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_distribution_users_updated_at
  BEFORE UPDATE ON distribution_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();