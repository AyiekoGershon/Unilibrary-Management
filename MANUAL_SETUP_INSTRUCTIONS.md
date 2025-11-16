# ⚡ Manual Setup Steps (If CLI Authentication Doesn't Work)

## Quick Manual Deploy Instructions

Instead of using the CLI, you can set up the Edge Function secret through the Supabase Dashboard:

### Step 1: Add Resend API Key as Secret in Supabase Dashboard

1. Go to your Supabase Project: https://supabase.com/dashboard
2. Navigate to: **Settings** → **Edge Functions** (or just **Edge Functions** tab)
3. Click **Secrets** (you might need to expand a menu)
4. Click **New secret**
5. Fill in:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
6. Click **Create secret**

### Step 2: Deploy Edge Function

1. In Supabase Dashboard, go to **Edge Functions**
2. You should see **send-qr-email** function in the list
3. Click on it
4. You'll see the code from `supabase/functions/send-qr-email/index.ts`
5. The function should automatically use the secret you just created

### Step 3: Verify Deployment

1. In Supabase Dashboard → **Edge Functions** → **send-qr-email**
2. Look at the top - it should show a **URL** like: `https://[project-id].supabase.co/functions/v1/send-qr-email`
3. If you see this URL, the function is deployed ✅

### Step 4: Test in Your App

1. Dev server should already be running (if not: `npm run dev`)
2. Open http://localhost:5173
3. Go to **Check-In** tab
4. Look up a student (make sure they have an email)
5. Check in a bag
6. **Open browser console (F12)** and look for:
   - `🔍 sendQRCodeEmail called with email: ...`
   - `📤 Calling Supabase Edge Function: send-qr-email`
   - `📮 Edge Function response: { success: true, messageId: '...' }`
   - `✅ Email sent successfully!`

7. **Check your email inbox** - email should arrive in 5-10 seconds!

---

## If Something Goes Wrong

### Email service not calling Edge Function?
- Check console for errors
- Make sure you replaced `emailService.ts` correctly
- Restart dev server: `Ctrl+C` then `npm run dev`

### Edge Function returning error?
1. Go to Supabase Dashboard → **Edge Functions** → **send-qr-email**
2. Click **Logs** tab at the top
3. Look for error messages
4. Most common: Secret not set (follow Step 1 above)

### Email still not arriving?
1. Check browser console (F12) for any errors
2. Check Edge Function logs in Supabase Dashboard
3. Verify student email is valid in your database
4. Check Resend dashboard: https://resend.com/emails

---

## Need Help?

If you get stuck, reply with:
1. What error you see in the browser console
2. What error you see in Edge Function logs (if any)
3. Whether the email service is being called

And I'll help you debug! 🚀
