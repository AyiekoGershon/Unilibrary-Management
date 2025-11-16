# UniLibrary Bag Management System

A modern digital bag tracking system designed for university libraries to efficiently manage student bag check-ins and check-outs.

## 📋 Table of Contents

- [About](#about)
- [Overview](#overview)
- [Features](#features)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Database](#database)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

UniLibrary Bag Management System is a web application that streamlines the process of tracking library bags and packages. Librarians can easily check bags in when students arrive and check them out when students leave, with real-time visibility of all active check-ins.

**Live Demo:** [UniLibrary Management](https://unilibrarymanagement.netlify.app)

## ℹ️ About

### Problem Statement

University libraries face operational challenges in managing the large volume of student bags and personal belongings, especially during peak hours. Traditional manual tracking methods are:
- **Time-consuming** - Librarians manually record bag details
- **Error-prone** - Paper-based systems lead to lost or misplaced items
- **Inefficient** - No real-time visibility of checked-in items
- **Unscalable** - Difficult to manage during busy periods

### Solution

UniLibrary Bag Management System provides an automated, real-time solution that:
- **Digitizes** the entire bag tracking workflow
- **Reduces errors** with unique auto-generated tracking tags
- **Improves efficiency** by streamlining check-in/check-out processes
- **Enhances visibility** with a live dashboard of all active bags
- **Secures data** with Google OAuth authentication and role-based access

### Use Cases

1. **During Check-In**: When a student arrives with a bag, the librarian enters bag details, and the system generates a unique tracking tag that can be printed or displayed on screen.

2. **During Check-Out**: When the student returns, the librarian quickly retrieves the bag record using the tracking tag or student ID and marks it as checked out.

3. **Lost & Found**: The active check-ins dashboard helps identify unclaimed bags and their owners.

4. **Peak Hours Management**: Real-time visibility helps librarians manage multiple concurrent check-ins/check-outs efficiently.

5. **Reporting**: Track bag traffic patterns to optimize library operations.

### Target Users

- **Librarians** - Primary users who manage bag check-in/check-out operations
- **Library Administrators** - Access to reports and analytics
- **Students** - Benefit from faster, more organized bag storage services

### Project Goals

✅ Reduce bag-related operational workload  
✅ Improve accuracy of bag tracking  
✅ Provide real-time visibility of library activities  
✅ Enhance overall library user experience  
✅ Create a scalable, maintainable solution  

## ✨ Features

- **Google OAuth Authentication** - Secure librarian sign-in via Google accounts
- **Check In System** - Register bags as they arrive with unique tracking tags
- **Check Out System** - Process departing bags and remove them from tracking
- **Active Check-Ins Dashboard** - View all currently checked-in bags in real-time
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Real-time Updates** - Instant synchronization across sessions

## 📸 Screenshots

### Sign In Page
[INSERT SCREENSHOT HERE]

### Check In Tab
[INSERT SCREENSHOT HERE]

### Check Out Tab
[INSERT SCREENSHOT HERE]

### Active Check-Ins Dashboard
[INSERT SCREENSHOT HERE]

## 🛠 Tech Stack

### Frontend
- **React 18.3** - UI framework
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icon library

### Backend & Services
- **Supabase** - PostgreSQL database + authentication
- **Supabase JS SDK 2.57** - Client library for Supabase integration

### Development Tools
- **ESLint 9.9** - Code linting
- **PostCSS 8.4** - CSS processing
- **Autoprefixer** - Browser compatibility

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Git

### Clone the Repository

```bash
git clone https://github.com/AyiekoGershon/UNILAB.git
cd UNILAB
```

### Install Dependencies

```bash
npm install
```

## ⚙️ Environment Setup

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Google OAuth Setup

The project uses Google OAuth for authentication. Follow the [SUPABASE_OAUTH_SETUP.md](./SUPABASE_OAUTH_SETUP.md) file for detailed configuration instructions.

**Key OAuth Redirect URIs:**
- Production (Netlify): `https://unilibrarymanagement.netlify.app/auth/callback`
- Production (Render): `https://your-render-domain.onrender.com/auth/callback`
- Local Development: `http://localhost:5173/auth/callback`

## 🚀 Running the Project

### Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm start
```

This builds the app and serves it on `http://localhost:3000`.

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## �배포 Deployment

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
5. Update Supabase OAuth redirect URI to your Netlify domain

### Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set start command: `npm start`
4. Add environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
5. Update Supabase OAuth redirect URI to your Render domain

## 📁 Project Structure

```
UNILAB/
├── src/
│   ├── components/
│   │   ├── SignIn.tsx          # Google OAuth sign-in component
│   │   ├── CheckIn.tsx         # Bag check-in interface
│   │   ├── CheckOut.tsx        # Bag check-out interface
│   │   └── ActiveCheckins.tsx  # Active bags dashboard
│   ├── lib/
│   │   └── supabase.ts         # Supabase client initialization
│   ├── services/
│   │   └── api.ts              # API service calls
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── utils/
│   │   └── tagGenerator.ts     # Unique tag generation utility
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── supabase/
│   ├── migrations/             # Database migrations
│   └── google-credentials.json # Google OAuth credentials (local only)
├── public/                     # Static assets
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Project dependencies
└── README.md                   # This file
```

## 🔐 Authentication

### Google OAuth Flow

1. User clicks "Sign in with Google" button
2. Redirected to Google authentication page
3. After authorization, redirected to `https://supabase-url/auth/v1/callback`
4. Supabase validates the OAuth code and creates a session
5. Redirected back to the app with access token in URL hash
6. App captures session and displays main interface

### Environment-Based Redirects

The app automatically uses the correct redirect URI based on the deployment environment:
- **Local**: `http://localhost:5173/auth/callback`
- **Netlify**: `https://unilibrarymanagement.netlify.app/auth/callback`
- **Render**: `https://your-render-domain.onrender.com/auth/callback`

## 🗄️ Database

### Supabase PostgreSQL Setup

The project uses Supabase PostgreSQL database for storing bag check-in/check-out records. Run migrations in `supabase/migrations/` to set up tables and Row Level Security (RLS) policies.

**Database Features:**
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Automatic timestamps on all records

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend and authentication
- [Vite](https://vitejs.dev) - Build tool
- [React](https://react.dev) - UI framework
- [Tailwind CSS](https://tailwindcss.com) - Styling framework
- [Google OAuth](https://developers.google.com/identity/protocols/oauth2) - Authentication provider
