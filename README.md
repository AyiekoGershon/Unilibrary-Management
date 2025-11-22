# UniLibrary – Library Bag Management System

UniLibrary digitizes on-prem bag lockers with QR codes, real-time tracking, and beautifully branded messaging. The November 2025 refresh ships a dual-theme experience, immersive onboarding, and streak-aware checkout emails.

## ✨ Highlights

- **Dual Theme** – Light/dark toggle remembered per user, gradient backgrounds, glassmorphism cards.
- **Premium Sign-in** – Story-driven landing page, inline theme switch, single-click Google OAuth.
- **Check-in Magic** – Student lookup, unique tag + styled QR, email confirmation with QR preview & download.
- **Smart Checkouts** – Manual tag entry or camera scan. Both paths trigger post-visit emails summarizing time spent and visit streak.
- **Live Ops** – Supabase realtime keeps dashboard rows in sync; search + suggestions accelerate releases.

## 🧱 Tech Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS (dark mode) | Single-page app with responsive layout |
| Auth + DB | Supabase (PostgreSQL, Realtime, OAuth Google) | Students + bag_checkins tables with RLS |
| Email | Supabase Edge Functions (Deno) + Resend API | Separate check-in & checkout templates |
| QR/Camera | `qr-code-styling`, `html5-qrcode` | Styled QR render + device camera scanning |

## 📁 Structure (excerpt)

```
├── src/
│   ├── components/
│   │   ├── SignIn.tsx              # Hero landing + OAuth
│   │   ├── CheckIn.tsx             # Student lookup, bag intake
│   │   ├── BagManagement.tsx       # Live dashboard + manual checkout
│   │   ├── QRCheckoutScanner.tsx   # Html5Qrcode-powered checkout
│   │   ├── CheckOut.tsx            # Tag-code fallback
│   │   └── QRDisplay.tsx           # Modal with styled QR + download
│   ├── services/
│   │   ├── api.ts                  # Bag/student services, streak calc, email triggers
│   │   └── emailService.ts         # Shared Supabase Edge invocation helpers
│   ├── lib/supabase.ts
│   ├── utils/tagGenerator.ts
│   └── main.tsx, App.tsx, index.css
├── supabase/
│   ├── functions/send-qr-email/    # Edge function + reference copy
│   └── migrations/…                # Schema + RLS migrations
└── README.md
```

## 🚀 Getting Started

### Requirements
- Node.js ≥ 18
- Supabase project (URL, anon key, service/deploy token)
- Resend API key (trial ok)
- Google OAuth credentials (for Supabase Auth)

### Installation
```bash
git clone <repo>
cd UNILAB
npm install
```

Create `.env`:
```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_ACCESS_TOKEN=<service-role-or-deploy-token>
RESEND_API_KEY=<resend-api-key>
```

### Running Locally
```bash
npm run dev                 # http://localhost:5173
npm run dev -- --host 0.0.0.0   # test from phone browser
npm run build && npm run preview
```

## 📱 Mobile Testing
1. Run `npm run dev -- --host 0.0.0.0`.
2. Note the LAN IP Vite prints (e.g., `http://192.168.1.42:5173`).
3. Open that URL in a mobile browser on the same Wi‑Fi. The responsive UI + camera scanner work directly via HTTPS/HTTP (production should be HTTPS for camera permissions).

## 📧 Email Automation

| Flow | Trigger | Contents |
| --- | --- | --- |
| Check-in | After bag creation | Student name, bag summary, check-in time, QR code image, reference tag |
| Check-out | Manual or QR checkout | Checkout timestamp, total time in library, visit streak badge, bag reference, thank-you note |

- Edge endpoint: `POST /functions/v1/send-qr-email`
- Secrets: `RESEND_API_KEY` (set via `npx supabase secrets set …`)
- Deploy/update: `npx supabase functions deploy send-qr-email --project-ref <ref>`

## 🗄️ Database Schema

### `students`
| column | type | notes |
| --- | --- | --- |
| id | uuid PK |
| student_id | text unique |
| full_name | text |
| email | text not null |
| phone | text |
| email_verified | boolean default false |
| created_at | timestamptz default now |

### `bag_checkins`
| column | type | notes |
| --- | --- | --- |
| id | uuid PK |
| student_id | uuid FK → students |
| tag_code | text unique (`LIB-####`) |
| bag_description | text |
| checkin_time / checkout_time | timestamptz |
| status | text (`checked_in`, `checked_out`) |
| librarian_id | text |
| qr_code_data | text JSON payload |
| qr_code_sent, qr_email_sent_at, qr_scanned_for_checkout | tracking columns |

## 🔄 Flow
1. **Authenticate** – Librarian logs in via Google OAuth.
2. **Check-In** – Search student → describe bag → generate tag + QR, email automatically sent.
3. **Manage** – Dashboard lists active bags, search/autocomplete, manual checkout button.
4. **QR Checkout** – Html5Qrcode camera scans bag QR and auto-checks out; same service handles tag entry fallback.
5. **Post-visit Email** – Duration & streak stats computed, thank-you email delivered through edge function.

## 🔐 Security & Ops
- Supabase row-level security enforced on `students` and `bag_checkins`.
- Authenticated librarians only; no anonymous bag access.
- Edge function isolates Resend API key server-side.
- Theme preference stored in `localStorage` (`unilab-theme`); no PII persisted in frontend storage.

## 📦 Deployment Cheat Sheet

```bash
# Frontend bundle
npm run build
# deploy dist/ to Render/Netlify/Vercel/etc.

# Backend / Edge
npx supabase secrets set RESEND_API_KEY=<value> --project-ref <ref>
npx supabase functions deploy send-qr-email --project-ref <ref>
```

## 🛠 Development Commands
```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run typecheck
npx supabase functions logs send-qr-email --project-ref <ref>
```

## 🐛 Troubleshooting
- **Emails missing** – confirm Resend key + verified recipient; inspect `npx supabase functions logs send-qr-email`.
- **Camera blocked** – browsers require HTTPS + permission; on desktop ensure a secure origin when deploying.
- **OAuth errors** – align Supabase redirect URLs with Google console + Render/Vercel domain.
- **QR duplicates** – `generateTagCode` loops until a free `LIB-####` code is found, but you can increase digits if volume spikes.

## 🤝 Contributing
1. Fork / create feature branch.
2. `npm run lint && npm run typecheck`.
3. Update docs/tests where relevant.
4. Submit PR.

## 📄 License
MIT

---
**Last Updated:** November 19, 2025  
**Status:** ✅ Production Ready (Dark Mode & Streak Emails)
