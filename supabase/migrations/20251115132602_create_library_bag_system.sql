/*
  # UniLibrary Bag Management System - Database Schema

  ## Overview
  This migration creates the core database structure for the UniLibrary Bag Management System,
  replacing the manual paper-based bag tracking with a digital solution.

  ## New Tables

  ### 1. `students` table
  Stores university student information for bag check-in purposes:
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (text, unique) - University student ID (e.g., U123X456)
  - `full_name` (text) - Student's full name
  - `email` (text) - Student email address
  - `phone` (text) - Student phone number
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `bag_checkins` table
  Tracks all bag check-in and check-out transactions:
  - `id` (uuid, primary key) - Unique identifier
  - `student_id` (uuid, foreign key) - References students table
  - `tag_code` (text, unique) - Auto-generated bag tag code (e.g., LIB-0542)
  - `bag_description` (text) - Description of the bag
  - `checkin_time` (timestamptz) - When bag was checked in
  - `checkout_time` (timestamptz, nullable) - When bag was checked out
  - `status` (text) - Current status: 'checked_in' or 'checked_out'
  - `librarian_id` (text) - ID of librarian processing the transaction
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Row Level Security (RLS) is enabled on all tables
  - Policies allow authenticated users to perform necessary operations
  - Students table: Read access for authenticated users
  - Bag checkins table: Full CRUD access for authenticated users (librarians)

  ## Indexes
  - Index on student_id for fast lookups
  - Index on tag_code for quick bag retrieval
  - Index on status for filtering active check-ins
*/

CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  full_name text NOT NULL,
  email text,
  phone text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bag_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  tag_code text UNIQUE NOT NULL,
  bag_description text NOT NULL,
  checkin_time timestamptz DEFAULT now(),
  checkout_time timestamptz,
  status text DEFAULT 'checked_in' NOT NULL,
  librarian_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_bag_checkins_tag_code ON bag_checkins(tag_code);
CREATE INDEX IF NOT EXISTS idx_bag_checkins_status ON bag_checkins(status);
CREATE INDEX IF NOT EXISTS idx_bag_checkins_student_id ON bag_checkins(student_id);

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE bag_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read students"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert students"
  ON students
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read bag checkins"
  ON bag_checkins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert bag checkins"
  ON bag_checkins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update bag checkins"
  ON bag_checkins
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete bag checkins"
  ON bag_checkins
  FOR DELETE
  TO authenticated
  USING (true);