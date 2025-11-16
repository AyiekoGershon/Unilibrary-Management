# QR Code Implementation Guide

## Overview
This document outlines the QR code system implementation for UniLibrary Bag Management System, including email integration for student notifications.

## ✅ What Has Been Implemented

### 1. **Database Schema Updates** (`supabase/migrations/20251116_add_qr_and_email_tracking.sql`)
- Added `qr_code_data` column to store QR information
- Added `qr_code_sent` boolean to track email delivery
- Added `qr_email_sent_at` timestamp for audit trail
- Added `qr_scanned_for_checkout` boolean for checkout verification
- Created database view `active_checkins_with_qr` for easy querying
- Added indexes for performance optimization

### 2. **QR Code Generation** (`src/utils/qrCodeGenerator.ts`)
- `generateQRCodeData()` - Creates QR data with check-in details
- `parseQRCodeData()` - Parses scanned QR strings
- `isValidQRData()` - Validates QR data structure
- QR encodes: Check-In ID, Tag Code, Student ID, Timestamp

### 3. **Email Service** (`src/services/emailService.ts`)
- `sendQRCodeEmail()` - Sends QR code to student
- `sendCheckoutConfirmationEmail()` - Sends checkout confirmation
- `markQREmailSent()` - Updates database when email is sent
- `getPendingQREmails()` - Query for unsent QR emails
- Ready for integration with Supabase Edge Functions or SendGrid

### 4. **QR Display Component** (`src/components/QRDisplay.tsx`)
- Modal popup showing QR code after check-in
- Download QR as PNG image
- Shows student information and bag details
- Email delivery status notification
- Mobile-responsive design

### 5. **QR Scanner Component** (`src/components/QRScanner.tsx`)
- Camera access for scanning QR codes
- Fallback manual input for data entry
- Error handling for camera access issues
- Clean, mobile-friendly UI

### 6. **Updated Services** (`src/services/api.ts`)
- `checkinService.checkIn()` - Now generates and sends QR code
- `generateAndSendQR()` - New helper method for QR workflow
- Integration with email service
- Non-blocking email sending (doesn't delay check-in)

### 7. **Updated Types** (`src/types/index.ts`)
- Added QR-related fields to `BagCheckin` interface
- Added email verification status to `Student` interface

### 8. **Updated Components** (`src/components/CheckIn.tsx`)
- Now displays `QRDisplay` modal after successful check-in
- Shows QR code, tag code, and student info
- Option to download QR for printing

## 🚀 Workflow

### Check-In Flow:
1. Librarian enters student ID and looks up student
2. Librarian describes bag and clicks "Complete Check-In"
3. System generates unique tag code
4. **QR code is generated with check-in data**
5. **QR code is displayed in modal popup**
6. **QR code is sent to student email (async)**
7. Success confirmation shown with tag code

### Check-Out Flow (Ready to Implement):
1. Librarian clicks "Scan QR" button
2. Camera opens (or manual paste option)
3. **QR code is scanned**
4. **System verifies QR matches stored data**
5. **Bag is marked as checked out**
6. **Check-out confirmation sent to student email**

## 🔧 Next Steps / TODO

### Phase 1: Email Integration (IMPORTANT)
**Currently, email sending is stubbed out. You need to implement ONE of these:**

#### Option A: Supabase Edge Function (Recommended)
1. Create Supabase Edge Function in your project
2. Function receives email payload
3. Sends email via SendGrid or similar
4. Deploy and update `emailService.ts` to call it

```typescript
// In emailService.ts, uncomment:
const { data, error } = await supabase.functions.invoke('send-qr-email', {
  body: payload
});
```

#### Option B: SendGrid Integration
1. Install SendGrid package: `npm install @sendgrid/mail`
2. Add SendGrid API key to environment
3. Implement email sending in service

#### Option C: Supabase Built-in Email
1. Set up custom email templates in Supabase Dashboard
2. Use Supabase auth emails as template base

### Phase 2: CheckOut Component Integration
Need to update `src/components/CheckOut.tsx`:
1. Add QRScanner component
2. On successful scan, parse QR data
3. Call `checkinService.checkOut(qrData.tagCode)`
4. Send checkout confirmation email

### Phase 3: Testing
- Test check-in with QR generation
- Test QR code display and download
- Test email sending (once configured)
- Test QR scanning on mobile

### Phase 4: Production Optimization
- Consider QR code storage (currently inline)
- Implement QR code image caching
- Add retry logic for failed emails
- Monitor email delivery rates

## 📧 Email Template Suggestion

**Subject:** Your UniLibrary Bag Check-In - Reference Code {{tagCode}}

**Body:**
```
Hi {{studentName}},

Your bag has been checked in at the library.

📦 Bag Details:
- Item: {{bagDescription}}
- Tag Code: {{tagCode}}
- Check-in Time: {{checkInTime}}

📱 To Retrieve Your Bag:
Present this QR code or tell the librarian your tag code: {{tagCode}}

[QR CODE IMAGE HERE]

Questions? Contact the library desk.

Best regards,
UniLibrary Bag Management System
```

## 🔐 Security Considerations

1. **QR Code Data**: Currently contains only check-in ID and tag code (no sensitive info)
2. **Email Delivery**: Use HTTPS endpoints and auth headers
3. **Database**: RLS policies already in place
4. **Verification**: QR scans verified against database records before checkout

## 📱 Mobile Optimizations

- ✅ QRScanner component handles camera permissions
- ✅ QRDisplay modal is responsive
- ✅ Fallback manual input for devices without camera
- ✅ Touch-friendly button sizes

## 🛠️ Dependencies Added

- `qr-code-styling` - Beautiful QR code generation
- `jsqr` - QR code scanning (ready for integration)

## File Structure Summary

```
src/
├── components/
│   ├── QRScanner.tsx      (NEW - Scans QR codes)
│   ├── QRDisplay.tsx      (NEW - Shows QR after check-in)
│   └── CheckIn.tsx        (UPDATED - Displays QR modal)
├── services/
│   ├── api.ts             (UPDATED - QR generation)
│   └── emailService.ts    (NEW - Email handling)
├── utils/
│   └── qrCodeGenerator.ts (NEW - QR data generation)
└── types/
    └── index.ts           (UPDATED - New QR types)

supabase/
└── migrations/
    └── 20251116_add_qr_and_email_tracking.sql (NEW - DB schema)
```

## 🚀 Deployment Checklist

- [ ] Run database migration in Supabase
- [ ] Deploy code with `git push`
- [ ] Set up email service (SendGrid/Function/etc.)
- [ ] Test QR generation in staging
- [ ] Test QR scanning on mobile
- [ ] Configure email templates
- [ ] Update CheckOut component with scanner
- [ ] Monitor email delivery
- [ ] Gather user feedback

## 📚 Resources

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [SendGrid Node.js SDK](https://github.com/sendgrid/sendgrid-nodejs)
- [QR Code Styling](https://qr-code-styling.com/)
- [HTML5 Geolocation & Camera APIs](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)

## ❓ Questions?

If you run into issues during email integration, check:
1. Environment variables are set
2. API keys have proper permissions
3. Email templates are configured
4. CORS is not blocking requests
5. Check browser console for errors

---

**Status:** 🟢 QR generation, display, and scanner ready. ⏳ Awaiting email service setup.
