/**
 * Email Service using Supabase Edge Function
 * 
 * Handles sending QR codes and bag check-in/check-out emails to students
 * Calls a Supabase Edge Function to send emails server-side (avoids CORS issues)
 */

import { supabase } from '../lib/supabase';

export interface EmailQRPayload {
  studentEmail: string;
  studentName: string;
  tagCode: string;
  bagDescription: string;
  checkInTime: string;
  qrCodeImage?: string;
}

export async function sendQRCodeEmail(payload: EmailQRPayload): Promise<boolean> {
  try {
    console.log('🔍 sendQRCodeEmail called with email:', payload.studentEmail);
    console.log('📤 Calling Supabase Edge Function: send-qr-email');

    const { data, error } = await supabase.functions.invoke('send-qr-email', {
      body: {
        studentEmail: payload.studentEmail,
        studentName: payload.studentName,
        tagCode: payload.tagCode,
        bagDescription: payload.bagDescription,
        checkInTime: payload.checkInTime,
      },
    });

    if (error) {
      console.error('❌ Edge Function error:', error);
      return false;
    }

    console.log('📮 Edge Function response:', data);
    
    if (data?.success) {
      console.log('✅ Email sent successfully! Message ID:', data.messageId);
      return true;
    } else {
      console.error('❌ Email send failed:', data?.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send QR email:', error);
    return false;
  }
}

export async function sendCheckoutConfirmationEmail(
  studentEmail: string,
  studentName: string,
  tagCode: string,
  checkOutTime: string
): Promise<boolean> {
  try {
    console.log('📤 Sending checkout confirmation to:', studentEmail);

    const { data, error } = await supabase.functions.invoke('send-qr-email', {
      body: {
        studentEmail,
        studentName,
        tagCode,
        bagDescription: 'Bag Check-Out Confirmation',
        checkInTime: checkOutTime,
      },
    });

    if (error || !data?.success) {
      console.error('❌ Failed to send checkout email:', error || data?.error);
      return false;
    }

    console.log('✅ Checkout confirmation sent!');
    return true;
  } catch (error) {
    console.error('❌ Checkout email error:', error);
    return false;
  }
}

export async function markQREmailSent(_bagCheckinId: string): Promise<boolean> {
  return true;
}

export async function getPendingQREmails() {
  return [];
}
