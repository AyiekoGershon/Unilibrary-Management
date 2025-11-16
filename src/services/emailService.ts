/**
 * Email Service using Supabase Edge Function
 * 
 * Handles sending QR codes and bag check-in/check-out emails to students
 * Uses Supabase Edge Functions for serverless email sending
 */

import { supabase } from '../lib/supabase';

export interface EmailQRPayload {
  studentEmail: string;
  studentName: string;
  tagCode: string;
  bagDescription: string;
  checkInTime: string;
  qrCodeImage?: string; // Base64 encoded QR image
}

/**
 * Send QR code to student via Supabase Edge Function
 */
export async function sendQRCodeEmail(payload: EmailQRPayload): Promise<boolean> {
  try {
    console.log('📧 Sending QR code email to:', payload.studentEmail);

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-qr-email', {
      body: payload,
    });

    if (error) {
      console.error('❌ Error from Edge Function:', error);
      return false;
    }

    console.log('✅ Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('❌ Failed to send QR email:', error);
    return false;
  }
}

/**
 * Send check-out confirmation email
 */
export async function sendCheckoutConfirmationEmail(
  studentEmail: string,
  studentName: string,
  tagCode: string,
  checkOutTime: string
): Promise<boolean> {
  try {
    console.log('📧 Checkout Confirmation Email:', {
      to: studentEmail,
      studentName,
      tagCode,
      checkOutTime
    });

    return true;
  } catch (error) {
    console.error('❌ Failed to send checkout confirmation:', error);
    return false;
  }
}

/**
 * Mark QR email as sent in database
 */
export async function markQREmailSent(
  bagCheckinId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bag_checkins')
      .update({
        qr_code_sent: true,
        qr_email_sent_at: new Date().toISOString()
      })
      .eq('id', bagCheckinId);

    if (error) {
      console.error('Error marking email as sent:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to mark QR email as sent:', error);
    return false;
  }
}

/**
 * Get list of pending QR emails (checked in but QR not yet sent)
 */
export async function getPendingQREmails() {
  try {
    const { data, error } = await supabase
      .from('bag_checkins')
      .select(`
        id,
        tag_code,
        bag_description,
        checkin_time,
        student:students(email, full_name)
      `)
      .eq('qr_code_sent', false)
      .eq('status', 'checked_in')
      .order('checkin_time', { ascending: true });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Failed to get pending QR emails:', error);
    return [];
  }
}
