// Supabase Edge Function to send QR code emails via Resend
// This runs server-side, so no CORS issues!

// @ts-ignore - Deno imports
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

declare const Deno: any
type Request = any

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailPayload {
  studentEmail: string
  studentName: string
  tagCode: string
  bagDescription: string
  checkInTime: string
}

function generateEmailHTML(payload: EmailPayload): string {
  const checkInDateTime = new Date(payload.checkInTime).toLocaleString()
  return `
    <!DOCTYPE html>
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
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px;">
          <strong>✅ To Retrieve Your Bag:</strong><br />
          Present your reference code to library staff and they will retrieve your bag immediately.
        </div>
        <p style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
          This is an automated message. Please do not reply.
        </p>
      </div>
    </body>
    </html>
  `
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders })
  }

  try {
    const payload: EmailPayload = await req.json()

    // Validate
    if (!payload.studentEmail || !payload.studentName || !payload.tagCode) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('❌ RESEND_API_KEY not configured in Supabase secrets')
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('📧 Sending email to:', payload.studentEmail)

    // Call Resend API directly
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'UniLibrary <onboarding@resend.dev>',
        to: payload.studentEmail,
        subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
        html: generateEmailHTML(payload),
      }),
    })

    const resendData = await resendResponse.json()
    console.log('📮 Resend response:', resendData)

    if (!resendResponse.ok) {
      console.error('❌ Resend API error:', resendData)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: resendData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('✅ Email sent successfully!')
    return new Response(
      JSON.stringify({ success: true, messageId: resendData.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
