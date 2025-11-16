/*
  # Add QR Code and Email Tracking to Bag Management System
  
  This migration adds support for:
  - QR code generation and storage
  - Email tracking for QR code delivery
  - Student email contact information
*/

-- Add columns to bag_checkins table for QR code tracking
ALTER TABLE bag_checkins 
ADD COLUMN IF NOT EXISTS qr_code_data text,
ADD COLUMN IF NOT EXISTS qr_code_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS qr_email_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS qr_scanned_for_checkout boolean DEFAULT false;

-- Ensure students table has email (might already exist)
ALTER TABLE students
ADD COLUMN IF NOT EXISTS email_verified boolean DEFAULT false;

-- Create an index for faster QR lookups by qr_code_data
CREATE INDEX IF NOT EXISTS idx_bag_checkins_qr_code_data ON bag_checkins(qr_code_data) WHERE qr_code_data IS NOT NULL;

-- Add index for email sent status (for querying unsent QRs)
CREATE INDEX IF NOT EXISTS idx_bag_checkins_qr_email_sent ON bag_checkins(qr_code_sent, status) WHERE status = 'checked_in';

-- Create a view for active bags with QR sent status
CREATE OR REPLACE VIEW active_checkins_with_qr AS
SELECT 
  bc.id,
  bc.student_id,
  bc.tag_code,
  bc.bag_description,
  bc.checkin_time,
  bc.qr_code_data,
  bc.qr_code_sent,
  bc.qr_email_sent_at,
  s.student_id as student_number,
  s.full_name,
  s.email,
  EXTRACT(EPOCH FROM (NOW() - bc.checkin_time)) as minutes_checked_in
FROM bag_checkins bc
JOIN students s ON bc.student_id = s.id
WHERE bc.status = 'checked_in'
ORDER BY bc.checkin_time DESC;

-- Ensure RLS policies still apply
ALTER TABLE bag_checkins ENABLE ROW LEVEL SECURITY;
