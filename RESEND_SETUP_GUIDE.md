# 📧 Email Setup with Resend (Easy & Free!)

## ✅ Why Resend?

- **Free tier**: 100 emails/day (perfect for testing)
- **No SMTP setup needed** - Just get an API key
- **Easy to use** - Just call the API
- **Works immediately** - No configuration needed
- **Professional emails** - Built-in templates

## 🚀 Quick Setup (2 Minutes)

### Step 1: Sign Up (Free)
1. Go to: https://resend.com
2. Click **Sign Up**
3. Complete registration
4. Verify your email

### Step 2: Get API Key
1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Copy the key (starts with `re_`)
4. Keep it safe!

### Step 3: Add to Your Project
Create a `.env.local` file in your project root:

```env
VITE_RESEND_API_KEY=re_your_api_key_here
```

**Important:**
- Do NOT commit `.env.local` to GitHub
- This file should be in `.gitignore` (add it!)

### Step 4: Verify Sender Email
When you first sign up, Resend gives you a test email: `onboarding@resend.dev`

You can use this to send test emails.

**To add your own email domain:**
1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Follow instructions to verify your domain
4. Then use your domain: `hello@yourdomain.com`

## 📝 How It Works in Your App

Your `emailService.ts` now:
1. Reads the API key from `.env.local`
2. Creates a Resend client
3. Sends HTML emails when bags are checked in
4. Falls back gracefully if API key is missing

**The code already handles everything - just add the API key!**

## ✅ Testing

### Test Locally (With API Key)
```bash
npm run dev
```
1. Log in
2. Check in a bag
3. Email should arrive in your inbox within seconds

### Test Without API Key
If you don't have a Resend API key yet:
```bash
npm run dev
```
1. Check in a bag
2. Open browser console (F12)
3. You'll see the email payload logged
4. No actual email sent, but you can see what would be sent

## 🔧 Troubleshooting

### "Email not received"
- Check spam/junk folder
- Verify API key is correct in `.env.local`
- Check browser console (F12) for errors

### "API key not found"
- Make sure `.env.local` exists in project root
- Restart `npm run dev` after creating `.env.local`
- Vite reads env files at startup

### "Invalid API key format"
- Make sure it starts with `re_`
- Copy the full key without extra spaces

## 🎯 What's Included

Your `emailService.ts` has:
- `sendQRCodeEmail()` - Sends check-in email with reference code
- `sendCheckoutConfirmationEmail()` - Sends checkout confirmation
- Professional HTML email template
- Error handling and logging

## 📞 Next Steps

1. **Sign up for Resend** (free, 2 minutes)
2. **Get API key**
3. **Create `.env.local` with your key**
4. **Test with `npm run dev`**
5. **Check in a bag and verify email arrives**

---

## 💡 Pro Tips

- **First email might be slow** - Resend does verification on first send
- **Test emails** - Use your personal email first
- **Upgrade plan** - Free tier has 100/day limit. Paid plans start at $20/month for unlimited
- **Domain warmup** - If adding your own domain, send a few test emails first

---

## 🆘 Still Having Issues?

**Check these:**
1. Is `.env.local` in project root? (not in src/)
2. Did you restart `npm run dev` after adding `.env.local`?
3. Does API key start with `re_`?
4. Check browser console for actual error message

**If stuck:**
- Check Resend docs: https://resend.com/docs
- Check browser console (F12) for error details
- Try with test email first: `onboarding@resend.dev`

---

**That's it! You're ready to send emails.** 🎉
