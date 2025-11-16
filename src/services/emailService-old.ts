/**
 * Email Service using Resend
 * 
 * Handles sending QR codes and bag check-in/check-out emails to students
 * Uses Resend.com for reliable email delivery (free tier available)
 */

import { Resend } from 'resend';

const resendApiKey = import.meta.env.VITE_RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

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

    const apiKeyStatus = resendApiKey ? 'PRESENT' : 'MISSING';
    console.log('🔑 API Key status:', apiKeyStatus);
    
    if (!resend) {
      console.warn('⚠️ Resend client not initialized — will try HTTP fallback.');
    }

    console.log('📤 Sending QR code email to:', payload.studentEmail);
    console.log('📬 Subject: Your UniLibrary Bag Check-In - Reference Code: ' + payload.tagCode);
    // Try using SDK if available
    if (resend) {
      try {
        const result = await resend.emails.send({
          from: 'UniLibrary <onboarding@resend.dev>',
          to: payload.studentEmail,
          subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
          html: generateEmailHTML(payload),
        });

        console.log('📮 Resend SDK response:', result);

        if ((result as any).error) {
          console.error('❌ Resend SDK error:', (result as any).error);
        } else {
          console.log('✅ Email sent successfully via SDK! ID:', (result as any).data?.id);
          return true;
        }
      } catch (sdkErr) {
        console.warn('⚠️ Resend SDK send failed, falling back to HTTP API:', sdkErr);
      }
    }

    // HTTP fallback (works from browser as long as Resend allows CORS)
    if (!resendApiKey) {
      console.error('❌ No Resend API key available for HTTP fallback');
      return false;
    }

    try {
      const resp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'UniLibrary <onboarding@resend.dev>',
          to: [payload.studentEmail],
          subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
          html: generateEmailHTML(payload)
        })
      });

      const data = await resp.json().catch(() => ({}));
      console.log('📮 Resend HTTP response status:', resp.status, 'body:', data);

      if (!resp.ok) {
        console.error('❌ Resend HTTP error:', resp.status, data);
        return false;
      }

      console.log('✅ Email sent successfully via HTTP!');
      return true;
    } catch (httpErr) {
      console.error('❌ Failed to send via Resend HTTP API:', httpErr);
      return false;
    }
  } catch (error) {
    console.error('❌ Failed to send QR email exception:', error);
    return false;
  }
}

export async function sendCheckoutConfirmationEmail(
  studentEmail: string,
  studentName: string,
  tagCode: string,
  checkOutTime: string
): Promise<boolean> {
  if (!resend) return false;
  try {
    await resend.emails.send({
      from: 'UniLibrary <onboarding@resend.dev>',
      to: studentEmail,
      subject: `UniLibrary Bag Check-Out - Reference Code: ${tagCode}`,
      html: `<h2> Bag Retrieved</h2><p>Hi ${studentName}, your bag was picked up at ${checkOutTime}.</p>`,
    });
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function markQREmailSent(bagCheckinId: string): Promise<boolean> {
  return true;
}

export async function getPendingQREmails() {
  return [];
}

function generateEmailHTML(payload: EmailQRPayload): string {
  const checkInDateTime = new Date(payload.checkInTime).toLocaleString();
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: sans-serif; background: #f5f5f5; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px;">
          <h1 style="margin: 0; font-size: 24px;"> UniLibrary</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Bag Check-In Confirmation</p>
        </div>
        <p>Hi <strong>${payload.studentName}</strong>,</p>
        <p>Your bag has been successfully checked in!</p>
        <div style="background: #f0f4ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>Check-In Details:</strong><br />
           <strong>Bag:</strong> ${payload.bagDescription}<br />
           <strong>Time:</strong> ${checkInDateTime}<br />
           <strong>Reference Code:</strong> <span style="font-size: 16px; font-weight: bold; color: #3b82f6;">${payload.tagCode}</span>
        </div>
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong> To Retrieve Your Bag:</strong><br />
          Present your reference code to library staff and they will retrieve your bag immediately.
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          This is an automated message. Please do not reply.
        </p>
      </div>
    </body>
    </html>
  `;
}
