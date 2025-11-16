# ✅ Email System - Ready to Test

## What Was Done

### 1. ✅ Email Service Updated
- **File**: `src/services/emailService.ts`
- **Change**: Now calls Supabase Edge Function instead of Resend API directly
- **Benefit**: No more CORS errors!
- **Status**: Zero TypeScript errors, ready to use

### 2. ✅ Edge Function Created
- **File**: `supabase/functions/send-qr-email/index.ts`
- **What it does**: Receives email request from frontend → sends via Resend → returns success/error
- **Status**: Ready to deploy

### 3. ⏳ Next: Add Resend Secret to Supabase

You need to add your Resend API key to Supabase so the Edge Function can use it.

**Option A: Dashboard (Easiest)**
1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to: **Settings** → **Edge Functions** → **Secrets**
4. Click **New secret**
5. Name: `RESEND_API_KEY`
6. Value: `re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb`
7. Save

**Option B: CLI** (if you prefer)
```powershell
supabase login  # if not already logged in
supabase secrets set RESEND_API_KEY=re_buw5h66A_EQZbaHi8p9zqX9v4VNuotucb
supabase functions deploy send-qr-email
```

---

## Quick Test After Setup

1. **Dev server** is already running at `http://localhost:5173`

2. **Sign in** with Google

3. **Check-In** a bag:
   - Go to Check-In tab
   - Enter student ID
   - Check in a bag

4. **Watch the console** (F12):
   ```
   🔍 sendQRCodeEmail called with email: student@example.com
   📤 Calling Supabase Edge Function: send-qr-email
   📮 Edge Function response: { success: true, messageId: 'xxx' }
   ✅ Email sent successfully! Message ID: xxx
   ```

5. **Check your inbox** - Email should arrive in 5-10 seconds!

---

## Files Summary

| File | Status | Purpose |
|------|--------|---------|
| `src/services/emailService.ts` | ✅ Updated | Frontend → calls Edge Function |
| `supabase/functions/send-qr-email/index.ts` | ✅ Ready | Backend → calls Resend API |
| `MANUAL_SETUP_INSTRUCTIONS.md` | ℹ️ Reference | Step-by-step manual setup |
| `EMAIL_EDGE_FUNCTION_GUIDE.md` | ℹ️ Reference | Complete architecture guide |

---

## Success Checklist

- [ ] Added `RESEND_API_KEY` secret in Supabase Dashboard
- [ ] Dev server running (`npm run dev`)
- [ ] Checked in a bag in the app
- [ ] Saw email logs in browser console
- [ ] Email arrived in inbox
- [ ] QR modal displayed on check-in

---

## Troubleshooting

**Console shows: "Edge Function not found"**
→ Secret not set yet, or need to deploy

**Console shows: "RESEND_API_KEY not configured"**
→ Secret needs to be added to Supabase

**No logs at all?**
→ Restart dev server: `Ctrl+C` then `npm run dev`

**Email not arriving?**
→ Check Supabase Edge Function logs for errors

---

**Status**: 🟢 **READY** (just need Supabase secret setup)
**Estimated Time to Complete**: 2 minutes
