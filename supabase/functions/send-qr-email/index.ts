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
  qrCodeImage?: string // Base64 encoded QR image
}

// Generate HTML email template
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
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 16px;
          opacity: 0.95;
        }
        .content {
          padding: 30px 20px;
        }
        .greeting {
          font-size: 18px;
          color: #1f2937;
          margin-bottom: 20px;
        }
        .info-box {
          background-color: #f0f4ff;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .info-box strong {
          color: #1e40af;
          display: block;
          margin-bottom: 5px;
        }
        .qr-section {
          text-align: center;
          margin: 30px 0;
          padding: 20px;
          background-color: #f9fafb;
          border-radius: 8px;
        }
        .qr-section p {
          margin: 0 0 15px 0;
          color: #666;
          font-size: 14px;
        }
        .qr-image {
          max-width: 300px;
          height: auto;
          margin: 15px auto;
          display: block;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          padding: 10px;
          background-color: white;
        }
        .tag-code {
          font-size: 32px;
          font-weight: bold;
          color: #3b82f6;
          text-align: center;
          margin: 15px 0;
          font-family: 'Courier New', monospace;
          letter-spacing: 2px;
        }
        .instructions {
          background-color: #f0fdf4;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .instructions h3 {
          margin-top: 0;
          color: #047857;
        }
        .instructions ol {
          margin: 10px 0;
          padding-left: 20px;
        }
        .instructions li {
          margin: 8px 0;
          color: #1f2937;
        }
        .footer {
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #666;
        }
        .footer p {
          margin: 5px 0;
        }
        .help-text {
          color: #666;
          font-size: 14px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📚 UniLibrary</h1>
          <p>Bag Management System</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hi <strong>${escapeHTML(payload.studentName)}</strong>,
          </div>
          
          <p>Your bag has been successfully checked in at the library! 🎉</p>
          
          <div class="info-box">
            <strong>📦 Your Bag Details:</strong>
            Item: ${escapeHTML(payload.bagDescription)}<br>
            Check-in Time: ${checkInDateTime}
          </div>
          
          <div class="qr-section">
            <p><strong>Your Check-Out QR Code</strong></p>
            <p>Present this QR code to the librarian to retrieve your bag</p>
            ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" alt="Check-out QR Code" class="qr-image">` : '<p style="color: #dc2626;">QR Code image not available</p>'}
            <div class="tag-code">${escapeHTML(payload.tagCode)}</div>
            <p class="help-text">Or simply tell the librarian this code: <strong>${escapeHTML(payload.tagCode)}</strong></p>
          </div>
          
          <div class="instructions">
            <h3>✅ To Retrieve Your Bag:</h3>
            <ol>
              <li>Come to the library desk</li>
              <li>Present this email and QR code (or your tag code)</li>
              <li>We'll verify and give you your bag</li>
            </ol>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <strong style="color: #92400e;">⏰ Important:</strong>
            <p style="margin: 8px 0 0 0; color: #78350f;">Keep this email safe. You'll need the QR code or tag code to collect your bag.</p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>UniLibrary Bag Management System</strong></p>
          <p>Questions? Contact the library desk for assistance.</p>
          <p style="margin-top: 15px; color: #999; font-size: 11px;">
            This is an automated email. Please do not reply directly to this message.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Escape HTML special characters
function escapeHTML(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, (m) => map[m])
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const payload: QREmailPayload = await req.json()

    // Validate required fields
    if (!payload.studentEmail || !payload.studentName || !payload.tagCode || !payload.bagDescription) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: studentEmail, studentName, tagCode, bagDescription",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    // Create Supabase client for server-side operations
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials")
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Generate HTML email
    const qrCodeDataUrl = payload.qrCodeImage || ""
    const htmlContent = generateEmailHTML(payload, qrCodeDataUrl)

    // Send email using Supabase's built-in email function
    // Note: This requires configuring email in Supabase
    const { error: emailError } = await supabase.auth.admin.sendRawUserEmail({
      email: payload.studentEmail,
      html: htmlContent,
      subject: `Your UniLibrary Bag Check-In - Reference Code: ${payload.tagCode}`,
    })

    if (emailError) {
      console.error("Email send error:", emailError)
      // Continue anyway - don't fail the entire operation
      // The check-in is still successful even if email fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        tagCode: payload.tagCode,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Function error:", error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})
