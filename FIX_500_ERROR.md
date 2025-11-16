# 🔧 Fix: Edge Function 500 Error

## Problem
Edge Function returns 500 (Internal Server Error). Most likely: **RESEND_API_KEY secret not set** in Supabase.

## Solution

### Step 1: Set the Resend API Key Secret in Supabase Dashboard

1. Go to: **https://supabase.com/dashboard**
2. Select your project: `ytnllzhkucgraiwnoxrj`
3. Go to: **Settings** → **Edge Functions** → **Secrets** 
   (Or look for the "Secrets" section under Edge Functions)
4. Click **New secret** or **Add secret**
5. Fill in:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
6. Click **Create** or **Save**

### Step 2: Replace the Edge Function with Better Logging Version

The old Edge Function is too complex and doesn't log errors well. I've created a simpler version.

**Replace the file contents:**
- Delete: `supabase/functions/send-qr-email/index.ts`
- Copy content from: `supabase/functions/send-qr-email/index-new.ts` 
- Paste into: `supabase/functions/send-qr-email/index.ts`

Or run this command in your project:
```powershell
Copy-Item "supabase/functions/send-qr-email/index-new.ts" "supabase/functions/send-qr-email/index.ts" -Force
```

### Step 3: Deploy Updated Function

```powershell
npx supabase functions deploy send-qr-email
```

(Or just the Supabase Dashboard will auto-update it)

### Step 4: Test Again

1. Go to http://localhost:5173
2. Check in a bag
3. **Check console (F12)** for logs
4. **Check Supabase Dashboard → Edge Functions → send-qr-email → Logs**
   - You should now see detailed logs like:
     - `[send-qr-email] Request received: POST`
     - `[send-qr-email] ✅ Resend API key found`
     - `[send-qr-email] ✅ Email sent successfully!`

---

## Quickest Verification

After adding the secret, you can test directly in Supabase Dashboard:

1. Go to **Edge Functions** → **send-qr-email**
2. Scroll down, you might see a **"Test"** or **"Logs"** section
3. Or manually test with curl (from your terminal):

```powershell
$body = @{
    studentEmail = "your-email@example.com"
    studentName = "John Doe"
    tagCode = "LIB-0001"
    bagDescription = "Test backpack"
    checkInTime = "$(Get-Date -Format 'O')"
} | ConvertTo-Json

curl -X POST `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" `
  -d $body `
  "https://ytnllzhkucgraiwnoxrj.supabase.co/functions/v1/send-qr-email"
```

(Replace `YOUR_SUPABASE_ANON_KEY` with your actual key from `.env`)

---

## Most Likely Causes of 500 Error

1. ❌ **RESEND_API_KEY secret not set** ← This is 99% likely
   - **Fix**: Add secret in Supabase Dashboard Settings → Edge Functions → Secrets

2. ❌ **Typo in secret name**
   - **Fix**: Make sure it's exactly `RESEND_API_KEY` (case-sensitive)

3. ❌ **Old Edge Function code still running**
   - **Fix**: Deploy the new simplified version

4. ❌ **Resend API key invalid**
   - **Fix**: Verify it's correct: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`

---

## After Secret is Set

Once you add the secret:
- New deployments will have access to it automatically
- Existing deployments might need a redeploy to pick it up
- Run: `supabase functions deploy send-qr-email`

Then test again in the app!

---

**Need help?** Reply with:
1. Screenshot of Supabase Dashboard showing the secret was added
2. Output from the browser console when you check in a bag
3. Output from Edge Function logs (if available)
