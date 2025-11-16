# Email Service Setup Instructions

This document provides step-by-step instructions for configuring email sending in your UniLibrary system.

## Overview

The email service is currently **stubbed out** (logged to console). You need to implement ONE of these options.

---

## 📧 Option 1: SendGrid (Easiest)

### Step 1: Create SendGrid Account
1. Go to [sendgrid.com](https://sendgrid.com)
2. Create free account (12,000 emails/month free)
3. Verify sender email

### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create new API key with "Mail Send" permission
3. Copy the key (starts with `SG.`)

### Step 3: Update Environment
In your `.env` file (local) and Render environment variables:
```env
VITE_SENDGRID_API_KEY=SG.your_actual_key_here
VITE_SENDER_EMAIL=noreply@youruniversity.edu
```

### Step 4: Install SendGrid Package
```bash
npm install @sendgrid/mail
```

### Step 5: Update Email Service
Replace the `sendQRCodeEmail` function in `src/services/emailService.ts`:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

export async function sendQRCodeEmail(payload: EmailQRPayload): Promise<boolean> {
  try {
    // Generate QR code image as base64
    const qrImageBase64 = await generateQRImageBase64(payload);

    const msg = {
      to: payload.studentEmail,
      from: import.meta.env.VITE_SENDER_EMAIL || 'noreply@example.com',
      subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0;">UniLibrary</h1>
            <p style="margin: 5px 0 0 0;">Bag Management System</p>
          </div>
          
          <div style="padding: 30px; background: #f9fafb;">
            <p>Hi ${payload.studentName},</p>
            
            <p style="font-size: 16px;">Your bag has been successfully checked in at the library.</p>
            
            <div style="background: white; border-left: 4px solid #1e40af; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0 0 10px 0;"><strong>Bag Details:</strong></p>
              <p style="margin: 5px 0;"><strong>Item:</strong> ${payload.bagDescription}</p>
              <p style="margin: 5px 0;"><strong>Tag Code:</strong> <span style="font-size: 20px; color: #1e40af; font-weight: bold;">${payload.tagCode}</span></p>
              <p style="margin: 5px 0;"><strong>Check-in Time:</strong> ${payload.checkInTime}</p>
            </div>
            
            <p style="font-size: 14px; font-weight: bold; margin-top: 30px;">📱 To Retrieve Your Bag:</p>
            <p style="font-size: 14px;">Present the QR code below to the librarian, or tell them your tag code: <span style="color: #1e40af; font-weight: bold;">${payload.tagCode}</span></p>
            
            ${qrImageBase64 ? `
              <div style="text-align: center; margin: 20px 0;">
                <img src="${qrImageBase64}" alt="QR Code" style="width: 250px; height: 250px; border: 2px solid #e5e7eb; border-radius: 8px; padding: 10px; background: white;" />
              </div>
            ` : ''}
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px;"><strong>⏰ Important:</strong> This bag will be held for 7 days. Please retrieve it within this timeframe.</p>
            </div>
            
            <p style="font-size: 13px; color: #666; margin-top: 30px;">Questions? Contact the library desk or email us.</p>
          </div>
          
          <div style="background: #1e40af; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
            <p style="margin: 0;">© 2025 UniLibrary Bag Management System</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log('✅ QR email sent to', payload.studentEmail);
    return true;
  } catch (error) {
    console.error('❌ Failed to send QR email:', error);
    return false;
  }
}

// Helper function to generate QR as base64
async function generateQRImageBase64(payload: EmailQRPayload): Promise<string | null> {
  try {
    // This would use qr-code-styling to generate an image
    // For now, return null (SendGrid can embed it differently)
    return null;
  } catch (error) {
    console.error('Failed to generate QR image:', error);
    return null;
  }
}
```

### Step 6: Test
1. Check in a bag
2. Watch for SendGrid test in logs
3. Verify email arrives

---

## 🔷 Option 2: Supabase Edge Function

### Step 1: Create Edge Function
```bash
supabase functions new send-qr-email
```

### Step 2: Implement Function
File: `supabase/functions/send-qr-email/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const { studentEmail, studentName, tagCode, bagDescription, checkInTime } = await req.json();

  try {
    // Configure SMTP (use your email provider)
    const client = new SmtpClient({
      connection: {
        hostname: "smtp.sendgrid.net",
        port: 465,
        tls: true,
        auth: {
          username: "apikey",
          password: Deno.env.get("SENDGRID_API_KEY") || "",
        },
      },
    });

    await client.connectTLS();

    await client.send({
      from: Deno.env.get("SENDER_EMAIL") || "noreply@example.com",
      to: studentEmail,
      subject: `Your UniLibrary Bag Check-In - Code: ${tagCode}`,
      content: `Hi ${studentName}, your bag has been checked in. Tag code: ${tagCode}`,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent" }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
```

### Step 3: Deploy Function
```bash
supabase functions deploy send-qr-email
```

### Step 4: Update Email Service
```typescript
export async function sendQRCodeEmail(payload: EmailQRPayload): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('send-qr-email', {
      body: payload
    });

    if (error) throw error;
    return data.success;
  } catch (error) {
    console.error('Failed to send QR email:', error);
    return false;
  }
}
```

---

## 🔑 Option 3: Mailgun

### Step 1: Create Mailgun Account
1. Go to [mailgun.com](https://www.mailgun.com)
2. Create account
3. Add domain (or use sandbox domain)

### Step 2: Get Credentials
- API Key (from Account Security)
- Domain name

### Step 3: Install Package
```bash
npm install mailgun.js form-data
```

### Step 4: Update Email Service
```typescript
import Mailgun from 'mailgun.js';
import FormData from 'form-data';

const mailgun = new Mailgun(FormData);
const client = mailgun.client({
  username: 'api',
  key: import.meta.env.VITE_MAILGUN_API_KEY
});
const mg = client.messages;

export async function sendQRCodeEmail(payload: EmailQRPayload): Promise<boolean> {
  try {
    await mg.create(import.meta.env.VITE_MAILGUN_DOMAIN, {
      from: `UniLibrary <noreply@${import.meta.env.VITE_MAILGUN_DOMAIN}>`,
      to: payload.studentEmail,
      subject: `Your UniLibrary Bag Check-In - Code: ${payload.tagCode}`,
      html: /* email template */
    });
    return true;
  } catch (error) {
    console.error('Failed to send QR email:', error);
    return false;
  }
}
```

---

## 🧪 Testing Your Email Service

### Test Locally
```typescript
// Add this to CheckIn component temporarily
const result = await sendQRCodeEmail({
  studentEmail: 'test@example.com',
  studentName: 'Test Student',
  tagCode: 'TEST-001',
  bagDescription: 'Test bag',
  checkInTime: new Date().toLocaleString()
});

console.log('Email send result:', result);
```

### Monitor in Production
- Check Render logs: `npm run dev` locally
- Check email provider dashboard (SendGrid, Mailgun, etc.)
- Monitor bounces/failures

---

## 🎯 Recommended: SendGrid + Render

This is the easiest and most reliable setup:

1. ✅ Create free SendGrid account
2. ✅ Get API key
3. ✅ Add to Render environment variables
4. ✅ Install `@sendgrid/mail` package
5. ✅ Implement code above
6. ✅ Test and deploy

**Cost:** Free tier includes 12,000 emails/month - perfect for a library!

---

## 🔒 Security Checklist

- [ ] API key is in environment variables, NOT in code
- [ ] API key is different for staging vs production
- [ ] Sender email is verified with provider
- [ ] Email templates don't contain student secrets
- [ ] QR code data is validated before sending
- [ ] Rate limiting on email sends (optional)

---

## 📊 Monitoring

Once implemented, monitor:

1. **Email delivery rate** - should be 95%+
2. **Bounce rate** - should be < 1%
3. **Failed emails** - log for retry
4. **API calls** - check usage limits

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| Emails not sending | Check API key in env vars |
| Wrong sender email | Verify sender with email provider |
| Email goes to spam | Configure DKIM/SPF records |
| API rate limited | Use SendGrid's buffering |
| QR image not showing | Use base64 encoding or link |

---

## Next Steps After Email Setup

1. ✅ Implement email sending (this document)
2. ⏳ Update CheckOut component with QR scanner
3. ⏳ Test full workflow
4. ⏳ Monitor email delivery
5. ⏳ Gather student feedback

**Recommended:** Choose SendGrid and follow steps above!
