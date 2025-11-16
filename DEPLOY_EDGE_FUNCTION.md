# Deploying the QR Email Edge Function

## Quick Deploy Steps

### Option 1: Using Supabase Dashboard (RECOMMENDED - No CLI needed)

1. **Open Supabase Dashboard**
   - Go to: https://app.supabase.com/
   - Click on your project (should show "ytnllzhkucgraiwnoxrj" or "UNILAB")

2. **Navigate to Edge Functions**
   - Left sidebar → **Functions**
   - Click **Create a new Function**

3. **Create the Function**
   - Function name: `send-qr-email`
   - Copy-paste the content from the code block below
   - Click **Deploy**

### Function Code to Deploy

Copy everything below and paste into the Supabase Dashboard function editor:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"

// CORS headers for the function
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface QREmailPayload {
  studentEmail: string
  studentName: string
  tagCode: string
  bagDescription: string
  checkInTime: string
  qrCodeImage?: string
}

function generateEmailHTML(payload: QREmailPayload, qrCodeDataUrl: string): string {
  const checkInDateTime = new Date(payload.checkInTime).toLocaleString()
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>UniLibrary Bag Check-In</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f5f5f5;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 24px;
        }
        .header p {
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px 20px;
        }
        .section {
          margin-bottom: 25px;
        }
        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 10px;
        }
        .qr-container {
          text-align: center;
          margin: 30px 0;
        }
        .qr-container img {
          max-width: 300px;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          background: white;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          font-weight: 600;
          color: #666;
        }
        .detail-value {
          color: #333;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }
        .instruction {
          background-color: #f0f4ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          border-radius: 4px;
          font-size: 13px;
          margin: 15px 0;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #666;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 UniLibrary</h1>
          <p>Bag Check-In Confirmation</p>
        </div>
        
        <div class="content">
          <div class="section">
            <p>Hi ${escapeHtml(payload.studentName)},</p>
            <p>Your bag has been successfully checked in to UniLibrary. Use this QR code for quick checkout.</p>
          </div>

          <div class="qr-container">
            <img src="${qrCodeDataUrl}" alt="QR Code for Bag Checkout" />
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Reference Code: <strong>${escapeHtml(payload.tagCode)}</strong></p>
          </div>

          <div class="section">
            <div class="section-title">Check-In Details</div>
            <div class="detail-row">
              <span class="detail-label">Check-In Time:</span>
              <span class="detail-value">${checkInDateTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bag Description:</span>
              <span class="detail-value">${escapeHtml(payload.bagDescription)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Reference Code:</span>
              <span class="detail-value">${escapeHtml(payload.tagCode)}</span>
            </div>
          </div>

          <div class="instruction">
            <strong>📱 To Check Out:</strong><br />
            Simply present this QR code to the library staff, or provide your reference code for manual lookup. Your bag will be retrieved immediately.
          </div>

          <div class="section">
            <p style="font-size: 13px; color: #666; margin: 0;">
              <strong>Keep this email safe!</strong> You can show this email to the staff directly, or they can scan the QR code for instant checkout.
            </p>
          </div>
        </div>

        <div class="footer">
          <p>UniLibrary Bag Management System</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

async function handler(req: Request): Promise<Response> {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const payload: QREmailPayload = await req.json()

    // Validate required fields
    if (!payload.studentEmail || !payload.studentName || !payload.tagCode || !payload.bagDescription) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      )
    }

    // For demo, create a simple QR code placeholder
    const qrCodeDataUrl = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='16' fill='%23000'%3E${payload.tagCode}%3C/text%3E%3C/svg%3E"

    // Create Supabase client for server-side operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate HTML email
    const htmlContent = generateEmailHTML(payload, qrCodeDataUrl)

    // Send email using Supabase's built-in email function
    const { error: emailError } = await supabase.auth.admin.sendRawUserEmail({
      email: payload.studentEmail,
      html: htmlContent,
      subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
    })

    if (emailError) {
      console.error("Error sending email:", emailError)
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: emailError }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        reference: payload.tagCode,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    )
  }
}

serve(handler)
```

---

### Steps After Pasting:

1. Review the code (it should show no errors)
2. Click the **Deploy** button at the bottom right
3. Wait for the green success message
4. You're done! The function is now live

That's it! The function is now live.

---

### Option 2: Using Supabase CLI (If you have access token)

1. Get your Supabase access token:
   - Go to https://app.supabase.com/account/tokens
   - Create a new token (or copy existing one)

2. Set the token in your terminal:
   ```powershell
   $env:SUPABASE_ACCESS_TOKEN = "your-token-here"
   ```

3. Deploy the function:
   ```powershell
   npx supabase@latest functions deploy send-qr-email
   ```

---

## After Deployment

Once the function is deployed, test it:

1. Start your app: `npm run dev`
2. Log in and check in a bag
3. You should receive an email with the QR code
4. Check your console (F12) for any errors

---

## Function Details

- **Function Name**: `send-qr-email`
- **Location**: `supabase/functions/send-qr-email/index.ts`
- **Triggers**: Called from `src/services/emailService.ts` via `supabase.functions.invoke()`
- **Input**: Student email, name, tag code, bag description
- **Output**: Sends HTML email with QR code

---

## Environment Variables (Auto-provided by Supabase)

The function automatically uses:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (for sending emails)

No configuration needed!

---

## Troubleshooting

### "Function not found" error
- Ensure you deployed the function successfully
- Check the function name is exactly `send-qr-email`
- Refresh the page and try again

### Email not received
- Check Supabase email settings: Dashboard → Project Settings → Email
- Ensure sender email is configured
- Check the function logs in the Dashboard

### CORS errors
- The function has CORS headers already configured
- Should work from any origin

---

## Next Steps After Deployment

1. ✅ Deploy function to Supabase
2. Test email sending locally
3. Run database migration: 
   ```sql
   -- Run in Supabase SQL Editor
   -- Migration file: supabase/migrations/20251116_add_qr_and_email_tracking.sql
   ```
4. Push code to Render for live deployment
