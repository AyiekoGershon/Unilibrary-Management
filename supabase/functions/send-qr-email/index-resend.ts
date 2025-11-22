// Supabase Edge Function: send-qr-email (Resend Email Service)
// Sends QR code confirmation emails using Resend API

// @ts-expect-error - Deno imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

declare const Deno: any
type Request = any

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface EmailPayload {
  template?: 'checkin' | 'checkout'
  studentEmail: string
  studentName: string
  tagCode: string
  bagDescription?: string
  checkInTime?: string
  checkoutTime?: string
  visitDurationMinutes?: number
  visitDurationLabel?: string
  streakDays?: number
  thanksNote?: string
}

async function generateQRImageUrl(data: string): Promise<string> {
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encoded}&format=png`
}

function generateCheckInEmailHTML(payload: EmailPayload, qrImageUrl: string): string {
  const checkInDateTime = payload.checkInTime ? new Date(payload.checkInTime).toLocaleString() : ''
  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #f5f5f5; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -30px -30px 20px;">
      <h1 style="margin: 0; font-size: 24px;">📦 UniLibrary</h1>
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
    
    <div style="text-align: center; margin: 25px 0; padding: 20px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px;">
      <p style="margin-top: 0; font-weight: bold; color: #374151;">📱 QR Code - Scan to Retrieve Your Bag</p>
      <img src="${qrImageUrl}" alt="Bag QR Code" style="width: 200px; height: 200px; border: 2px solid #3b82f6; border-radius: 4px;" />
      <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280;">Scan this QR code at the UniLibrary desk to retrieve your bag</p>
    </div>

    <div style="background: #f3f4f6; padding: 15px; border-radius: 4px; margin-top: 20px; font-size: 13px; color: #4b5563;">
      <p style="margin: 0 0 10px;">💡 <strong>Tips:</strong></p>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Keep this email for your records</li>
        <li>Present the QR code to retrieve your bag</li>
        <li>Check-in is valid until the end of the day</li>
      </ul>
    </div>

    <p style="margin-top: 30px; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 15px;">
      This is an automated message from UniLibrary. Please do not reply to this email.
    </p>
  </div>
</body>
</html>`
}

function generateCheckoutEmailHTML(payload: EmailPayload): string {
  const checkoutTime = payload.checkoutTime ? new Date(payload.checkoutTime).toLocaleString() : 'Today'
  const duration = payload.visitDurationLabel || formatVisitDuration(payload.visitDurationMinutes || 0)
  const streak =
    payload.streakDays && payload.streakDays > 1
      ? `<p style="margin: 8px 0 0;color:#f97316;font-weight:bold;">🔥 ${payload.streakDays}-day streak</p>`
      : ''
  const thanks = payload.thanksNote || 'Thank you for spending time at UniLibrary. We hope to see you again soon!'

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family: sans-serif; background: #0f172a; padding: 20px;">
  <div style="max-width: 640px; margin: 0 auto; background: white; padding: 32px; border-radius: 18px; box-shadow: 0 25px 45px rgba(15, 23, 42, 0.2);">
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #0ea5e9 100%); color: white; padding: 24px; border-radius: 14px;">
      <p style="margin:0; letter-spacing:0.4em; font-size:11px; text-transform:uppercase; opacity:0.8;">UniLibrary</p>
      <h1 style="margin:8px 0 0; font-size: 26px;">Thanks for Visiting, ${payload.studentName}!</h1>
      <p style="margin:6px 0 0; opacity:0.9;">Reference code ${payload.tagCode}</p>
    </div>

    <div style="margin: 24px 0; padding: 20px; background:#f1f5f9; border-radius:12px;">
      <p style="margin:0; color:#0f172a;">You checked out at <strong>${checkoutTime}</strong></p>
      <p style="margin:6px 0 0; color:#0f172a;">Total time in the library: <strong>${duration}</strong></p>
      ${streak}
    </div>

    <div style="margin: 24px 0; padding: 20px; background:#eef2ff; border-left:4px solid #4f46e5; border-radius:12px;">
      <p style="margin:0; font-weight:bold; color:#312e81;">Bag Reference</p>
      <p style="margin:4px 0 0; font-size:28px; font-weight:700; color:#4338ca; letter-spacing:0.2em;">${payload.tagCode}</p>
    </div>

    <p style="margin: 24px 0; color:#334155; line-height:1.6;">${thanks}</p>

    <div style="margin-top:32px; font-size:12px; color:#94a3b8; border-top:1px solid #e2e8f0; padding-top:14px;">
      This message confirms your bag was checked out successfully. Need help? Reply to this email.
    </div>
  </div>
</body>
</html>`
}

function formatVisitDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hrs && mins) return `${hrs}h ${mins}m`
  if (hrs) return `${hrs}h`
  return `${mins}m`
}

async function sendEmailViaResend(
  toEmail: string,
  studentName: string,
  subject: string,
  htmlBody: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resendApiKey = Deno.env.get("RESEND_API_KEY")

  if (!resendApiKey) {
    console.error("[send-qr-email] RESEND_API_KEY not found in environment")
    return { success: false, error: "Resend API key not configured" }
  }

  console.log("[send-qr-email] Sending email via Resend API...")

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "onboarding@resend.dev", // Resend trial default sender
      to: toEmail,
      subject: subject,
      html: htmlBody,
      reply_to: "support@unilibrary.app",
    }),
  })

  const resendData = await resendResponse.json()

  if (!resendResponse.ok) {
    console.error("[send-qr-email] Resend error:", resendData)
    return {
      success: false,
      error: resendData.message || "Failed to send email via Resend",
    }
  }

  console.log("[send-qr-email] ✅ Email sent via Resend! ID:", resendData.id)
  return { success: true, messageId: resendData.id }
}

serve(async (req: Request) => {
  console.log("[send-qr-email] 📨 Request received")

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  try {
    const payload: EmailPayload = await req.json()

    console.log("[send-qr-email] Payload received for:", payload.studentEmail)

    // Validate required fields
    if (!payload.studentEmail || !payload.studentName || !payload.tagCode) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: studentEmail, studentName, tagCode",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    const template = payload.template === 'checkout' ? 'checkout' : 'checkin'
    let html = ''
    let subject = ''

    if (template === 'checkin') {
      if (!payload.bagDescription || !payload.checkInTime) {
        return new Response(
          JSON.stringify({
            error: "Missing bagDescription or checkInTime for check-in email",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
      const qrUrl = await generateQRImageUrl(payload.tagCode)
      html = generateCheckInEmailHTML(payload, qrUrl)
      subject = `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`
    } else {
      if (!payload.checkoutTime) {
        return new Response(
          JSON.stringify({
            error: "Missing checkoutTime for checkout email",
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        )
      }
      html = generateCheckoutEmailHTML(payload)
      subject = `Thanks for visiting UniLibrary today`
    }

    // Send via Resend
    const result = await sendEmailViaResend(
      payload.studentEmail,
      payload.studentName,
      subject,
      html
    )

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, messageId: result.messageId }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    } else {
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error("[send-qr-email] Error:", errorMessage)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
