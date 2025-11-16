# 🚀 Email Setup - Start Here!

**Status**: ✅ Code ready | ⏳ Just need API key

## What You Need To Do (3 Steps, 5 Minutes)

### Step 1: Sign Up for Resend (2 minutes)
1. Go to: https://resend.com
2. Click "Sign Up"
3. Complete registration with your email
4. Click the verification link in your email

### Step 2: Get Your API Key (1 minute)
1. Log in to Resend dashboard
2. Click "API Keys" in left sidebar
3. Click "Create API Key" 
4. Copy the key (it looks like: `re_123456789...`)

### Step 3: Add to Your Project (1 minute)
Create a file named `.env.local` in your project root folder:

```env
VITE_RESEND_API_KEY=re_paste_your_key_here
```

Replace `re_paste_your_key_here` with your actual key.

**That's it!** ✅

## Test It

```bash
npm run dev
```

Then:
1. Log in with Google
2. Check in a bag
3. You should receive an email within 10 seconds

If no email arrives:
- Check spam/junk folder
- Open browser console (F12)
- Look for error messages

## ⚠️ Important

**Never commit `.env.local` to GitHub!**

It's already in `.gitignore`, so you're safe.

## If You Forget Your API Key

1. Open `.env.local`
2. Change the key
3. Restart `npm run dev` (Ctrl+C, then run again)

## Free Tier Limits

- 100 emails per day (perfect for testing)
- After that, upgrade to paid plan

## 🎉 Done!

Your email system is ready. Just add the API key and go!

---

**For more details, see**: `RESEND_SETUP_GUIDE.md`
