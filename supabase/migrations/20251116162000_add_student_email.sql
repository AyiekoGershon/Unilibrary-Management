-- Migration: Add email fields to students table
-- Created: 2025-11-16

BEGIN;

-- Add email column (nullable for now)
ALTER TABLE IF EXISTS public.students
  ADD COLUMN IF NOT EXISTS email text;

-- Add email_verified column with default false
ALTER TABLE IF EXISTS public.students
  ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Add index to speed up lookups by email (nullable values allowed)
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students (email);

COMMIT;
