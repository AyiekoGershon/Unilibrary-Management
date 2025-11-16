# 🚀 Email Setup - Edge Function Solution (CORS Fix)

## Problem Identified
❌ **CORS Blocking**: Resend API calls from browser are blocked because of Cross-Origin Resource Sharing policy.

## Solution
✅ **Server-Side Email via Supabase Edge Function**: Move email sending to the backend so Resend API is called from Supabase servers (no CORS issues).

---

## Files Created/Updated

### 1. **Supabase Edge Function** (Server-side Email Sender)
**Location**: `supabase/functions/send-qr-email/index.ts`
- **What it does**: Receives email payload from frontend → calls Resend API from server → returns result
- **Why it works**: Server-to-server calls don't have CORS restrictions
- **Language**: TypeScript with Deno runtime

### 2. **Updated Email Service** (Frontend Caller)
**Location**: `src/services/emailService-new.ts` (replaces old emailService.ts)
- **What changed**: Now calls `supabase.functions.invoke('send-qr-email')` instead of calling Resend directly
- **Benefits**: No API key in browser, no CORS errors, cleaner code

---

## How to Deploy

### Step 1: Update Your emailService.ts
Replace the old file with the new version:

```bash
# Backup old version (optional)
mv src/services/emailService.ts src/services/emailService-old.ts

# Use the new version
mv src/services/emailService-new.ts src/services/emailService.ts
```

### Step 2: Deploy Edge Function to Supabase

You need to add your **Resend API Key** as a Supabase secret:

#### Option A: Using Supabase CLI (Recommended)
```powershell
# 1. Set the Resend API key as a secret
supabase secrets set RESEND_API_KEY=re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb

# 2. Deploy the function
supabase functions deploy send-qr-email
```

#### Option B: Using Supabase Dashboard
1. Go to your Supabase project → **Edge Functions** → **Secrets**
2. Click **Add Secret**
3. Name: `RESEND_API_KEY`
4. Value: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
5. Save
6. The Edge Function will auto-deploy

### Step 3: Restart Dev Server
```powershell
npm run dev
```

---

## Testing

### 1. Check in a bag via the app
- Go to http://localhost:5173
- Sign in
- Check-In tab
- Look up student (with valid email)
- Check in bag

### 2. Watch browser console (F12 → Console tab)
Expected logs:
```
🔍 sendQRCodeEmail called with email: student@example.com
📤 Calling Supabase Edge Function: send-qr-email
📮 Edge Function response: { success: true, messageId: 'xxx' }
✅ Email sent successfully! Message ID: xxx
```

### 3. Check email inbox
- Email should arrive within 5-10 seconds
- From: `UniLibrary <onboarding@resend.dev>`
- Subject: `Your UniLibrary Bag Check-In - Reference Code: LIB-0542`

### 4. Verify in Resend Dashboard
- Go to: https://resend.com/emails
- You should see the sent email with status "Delivered"

---

## Troubleshooting

### ❌ "Edge Function not found" error
**Cause**: Function not deployed yet
**Fix**: Run `supabase functions deploy send-qr-email`

### ❌ "RESEND_API_KEY not configured" error
**Cause**: Secret not set in Supabase
**Fix**: Add the secret using the CLI or Dashboard (see Step 2 above)

### ❌ Email still not arriving
**Cause**: Various reasons
**Steps**:
1. Check browser console for any error messages
2. Go to Supabase Dashboard → Functions → Logs
3. Look for error messages in the Edge Function logs
4. Verify Resend API key is correct (starts with `re_`)
5. Check student email is valid in database

### ✅ Everything working?
Great! You're all set. The email system is now server-side and production-ready.

---

## Architecture Diagram

```
Browser (Frontend)
       ↓
sendQRCodeEmail(payload)
       ↓
supabase.functions.invoke('send-qr-email')
       ↓
Supabase Edge Function (Server)
       ↓
fetch('https://api.resend.com/emails') ✅ No CORS issues
       ↓
Resend API
       ↓
Student's Email ✅ Email delivered!
```

---

## Production Notes

- ✅ API key is now server-side only (secure)
- ✅ No CORS issues
- ✅ Scales infinitely (Supabase handles load)
- ✅ Reliable (Resend has 99.9% uptime)
- ✅ Logging (check Edge Function logs for debugging)

### Optional Enhancements
- Add email template versioning in database
- Add email tracking/analytics
- Add email retry logic
- Add webhook handling for bounce/complaint events

---

## Quick Commands Reference

```powershell
# Set Resend API key secret
supabase secrets set RESEND_API_KEY=re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb

# Deploy function
supabase functions deploy send-qr-email

# View function logs
supabase functions logs send-qr-email

# Restart dev server
npm run dev

# Test email (manual - do a check-in in the app)
# Then check console and Resend dashboard
```

---

**Status**: ✅ Ready to Deploy
**Estimated Time**: 5 minutes
**Risk Level**: Low (no database changes, server-side only)
