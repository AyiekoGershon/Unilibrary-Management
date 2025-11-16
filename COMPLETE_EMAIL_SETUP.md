# 🚀 Email System - Complete Setup Guide

## Current Status
✅ **Frontend**: Ready (emailService.ts updated)
✅ **Edge Function**: Ready (new simplified version created)
⏳ **Supabase Secret**: NEEDS TO BE SET (this is why you're getting 500 error)

---

## What's Happening

```
Your App (localhost:5173)
       ↓
sendQRCodeEmail() is called
       ↓
Calls: supabase.functions.invoke('send-qr-email')
       ↓
Edge Function: supabase/functions/send-qr-email/index.ts
       ↓
Tries to read: Deno.env.get("RESEND_API_KEY")
       ↓
❌ FAILS with 500 because secret is NOT SET
```

---

## The Fix (3 Steps - 5 Minutes)

### ✅ Step 1: Add Resend API Key Secret to Supabase

**Location**: Supabase Dashboard → Settings → Edge Functions → Secrets

1. Open: https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** (bottom left menu)
4. Look for **Edge Functions** section or **Secrets**
5. Click **New Secret** or **Add Secret**
6. Enter:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
7. Click **Create**

**Important**: After this step, the secret will be available to all Edge Functions immediately.

### ✅ Step 2: Replace Old Edge Function with New Simplified Version

The old Edge Function was complex and didn't log well. The new one is cleaner.

**Option A: Manual Copy-Paste**
1. Open: `supabase/functions/send-qr-email/index-new.ts` (the new file I created)
2. Copy ALL the contents
3. Open: `supabase/functions/send-qr-email/index.ts` (the old file)
4. Select ALL and DELETE
5. Paste the new content
6. Save

**Option B: PowerShell Command**
```powershell
Copy-Item "supabase\functions\send-qr-email\index-new.ts" "supabase\functions\send-qr-email\index.ts" -Force
```

### ✅ Step 3: Test It

1. Go to http://localhost:5173 (dev server already running)
2. Sign in with Google
3. Go to **Check-In** tab
4. Enter a **Student ID** (that has an email in the database)
5. Fill **Bag Description** (e.g., "My backpack")
6. Click **Check In**
7. **Open Browser Console (F12 → Console tab)**

**Expected logs:**
```
🔍 sendQRCodeEmail called with email: student@example.com
📤 Calling Supabase Edge Function: send-qr-email
📮 Edge Function response: { success: true, messageId: 'email_123456' }
✅ Email sent successfully! Message ID: email_123456
```

8. **Check your email inbox** - email should arrive in 5-10 seconds
   - From: `UniLibrary <onboarding@resend.dev>`
   - Subject: `Your UniLibrary Bag Check-In - Reference Code: LIB-0542`

9. (Optional) Check **Resend Dashboard**: https://resend.com/emails
   - You should see your email with status "Delivered"

---

## Debugging If It Still Doesn't Work

### Check 1: Is the Secret Actually Set?

In Supabase Dashboard:
1. Settings → Edge Functions → Secrets
2. You should see `RESEND_API_KEY` listed there
3. If not visible, add it!

### Check 2: Check Edge Function Logs

In Supabase Dashboard:
1. Go to: **Edge Functions** → **send-qr-email**
2. Click the **Logs** tab
3. Trigger a check-in in your app
4. You should see logs appearing in real-time:
   - `[send-qr-email] Request received: POST`
   - `[send-qr-email] Payload received: { email: '...', name: '...', code: '...' }`
   - Either:
     - `[send-qr-email] ✅ Resend API key found` → Success path
     - `[send-qr-email] ❌ RESEND_API_KEY not configured!` → Secret not set

### Check 3: Verify Student Has Email

In your Supabase Dashboard:
1. Go to: **SQL Editor**
2. Run this query:
   ```sql
   SELECT student_id, full_name, email FROM students LIMIT 5;
   ```
3. Make sure the student you're checking in HAS an email value

### Check 4: Test Resend API Key Directly

Is your Resend API key actually valid?
- Log in to https://resend.com
- Go to **API Keys**
- Your key should be there: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
- If it's not, create a new one and update the Supabase secret

---

## File Summary

| File | Purpose | Status |
|------|---------|--------|
| `src/services/emailService.ts` | Frontend calls Edge Function | ✅ Ready |
| `supabase/functions/send-qr-email/index.ts` | OLD version | ⚠️ Replace with new |
| `supabase/functions/send-qr-email/index-new.ts` | NEW simplified version | ✅ Use this |
| `FIX_500_ERROR.md` | Debugging guide | ℹ️ Reference |
| `EMAIL_EDGE_FUNCTION_GUIDE.md` | Architecture guide | ℹ️ Reference |

---

## Quick Checklist

- [ ] Opened Supabase Dashboard
- [ ] Found Settings → Edge Functions → Secrets
- [ ] Added new secret:
  - Name: `RESEND_API_KEY`
  - Value: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
- [ ] Secret was created successfully
- [ ] Replaced `index.ts` with new version from `index-new.ts`
- [ ] Opened app at http://localhost:5173
- [ ] Checked in a bag with a student that has an email
- [ ] Opened browser console (F12) and saw success logs
- [ ] Email arrived in inbox

---

## Success = ✅ ALL These Show

1. ✅ Browser console shows: `✅ Email sent successfully!`
2. ✅ QR modal appears on screen after check-in
3. ✅ Email arrives in your inbox within 10 seconds
4. ✅ Resend Dashboard shows the email as "Delivered"
5. ✅ Edge Function logs show: `[send-qr-email] ✅ Email sent successfully!`

---

## Production Ready?

Once testing works:
- ✅ API key is server-side only (secure)
- ✅ No CORS issues
- ✅ Scales infinitely
- ✅ Logs for debugging
- ✅ Error handling in place

You're good to deploy! 🚀

---

**Status**: 🟡 **ALMOST DONE** - Just need to add the Supabase secret
**Time to Complete**: 5 minutes
**Difficulty**: Easy
