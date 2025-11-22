import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Moon, Sun } from 'lucide-react';

interface SignInProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function SignIn({ theme, onToggleTheme }: SignInProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const ThemeIcon = theme === 'dark' ? Sun : Moon;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-slate-900 to-slate-950">
        <div className="absolute inset-0 mix-blend-screen opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.45),_transparent_55%)]" />
        <div className="absolute -bottom-32 -right-32 w-[580px] h-[580px] bg-indigo-400/20 blur-[120px] rounded-full" />
        <div className="absolute -top-20 -left-20 w-[380px] h-[380px] bg-pink-400/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 sm:px-12 py-6 text-white">
          <div>
            <p className="uppercase text-xs tracking-[0.5em] text-white/70">UniLibrary</p>
            <h1 className="text-2xl font-semibold">Smart UniLib Hub</h1>
          </div>
          <button
            onClick={onToggleTheme}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition-colors"
          >
            <ThemeIcon className="w-4 h-4" />
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        <main className="flex flex-1 flex-col lg:flex-row items-center justify-center gap-10 px-6 sm:px-12 pb-12">
          <div className="max-w-xl text-white space-y-6">
            <span className="inline-flex items-center px-4 py-1 rounded-full bg-white/15 text-sm font-semibold backdrop-blur">
              Modern Library Operations
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold leading-tight">
              Manage bag check-ins with clarity, QR magic, and instant trust.
            </h2>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              Centralize bag handling, automate tags, and keep patrons informed. UniLibrary connects librarians, QR tracking, and email alerts in one beautiful dashboard.
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {['Secure Google Login', 'Real-time status', 'QR confirmations','Student Tracking'].map(feature => (
                <div key={feature} className="flex items-center gap-2 text-white/80">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">✓</span>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white rounded-3xl p-8 shadow-2xl shadow-indigo-900/40 backdrop-blur">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-300">Librarian portal</p>
                <h3 className="text-2xl font-bold">Sign in to continue</h3>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-100 px-4 py-3 rounded-2xl mb-6">
                  {error}
                </div>
              )}

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full px-4 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-3 disabled:opacity-60 shadow-lg shadow-slate-900/30 dark:shadow-indigo-400/30"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : 'Sign in with Google'}
              </button>

              <div className="mt-8 space-y-3 text-sm text-slate-500 dark:text-slate-300">
                <p className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  Only authorized librarians may access this dashboard.
                </p>
                <p className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-slate-400" />
                  Need help? Contact the UniLibrary digital services team.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
