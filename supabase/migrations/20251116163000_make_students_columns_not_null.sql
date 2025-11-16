-- Migration: Make students columns NOT NULL (safe defaults applied)
-- Created: 2025-11-16
--
-- This migration will:
-- 1) Populate NULL values with safe defaults for columns that will be set NOT NULL
-- 2) Alter the table to set NOT NULL on each column
-- Run in a transaction so it can be rolled back on error.

BEGIN;

-- 1) Populate safe defaults for records that have NULLs
-- Use the `id` (assumed unique) to seed student_id when missing
UPDATE public.students
SET student_id = id
WHERE student_id IS NULL;

-- Ensure full_name exists
UPDATE public.students
SET full_name = 'Unknown Student'
WHERE full_name IS NULL OR trim(full_name) = '';

-- Provide an email for test/delivery when missing: derive from student_id
-- This avoids duplicates when student_id is set to id above
UPDATE public.students
SET email = student_id || '@students.university.test'
WHERE email IS NULL OR trim(email) = '';

-- Phone: set empty string if missing (you may prefer a default value)
UPDATE public.students
SET phone = ''
WHERE phone IS NULL;

-- email_verified: set false where NULL
UPDATE public.students
SET email_verified = false
WHERE email_verified IS NULL;

-- created_at: set to now() where missing
UPDATE public.students
SET created_at = now()
WHERE created_at IS NULL;

-- 2) Alter columns to be NOT NULL (and set sensible defaults where appropriate)
ALTER TABLE IF EXISTS public.students
  ALTER COLUMN student_id SET NOT NULL;

ALTER TABLE IF EXISTS public.students
  ALTER COLUMN full_name SET NOT NULL;

ALTER TABLE IF EXISTS public.students
  ALTER COLUMN email SET NOT NULL;

ALTER TABLE IF EXISTS public.students
  ALTER COLUMN phone SET NOT NULL;

ALTER TABLE IF EXISTS public.students
  ALTER COLUMN email_verified SET DEFAULT false;
ALTER TABLE IF EXISTS public.students
  ALTER COLUMN email_verified SET NOT NULL;

ALTER TABLE IF EXISTS public.students
  ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE IF EXISTS public.students
  ALTER COLUMN created_at SET NOT NULL;

-- Optional: add unique constraint on student_id if your app expects uniqueness
-- ALTER TABLE public.students ADD CONSTRAINT unique_student_id UNIQUE (student_id);

COMMIT;
