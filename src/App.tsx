import { useEffect, useMemo, useState } from 'react';
import CheckIn from './components/CheckIn';
import { BagManagement } from './components/BagManagement';
import QRCheckoutScanner from './components/QRCheckoutScanner';
import SignIn from './components/SignIn';
import { Package, Scan, Moon, Sun } from 'lucide-react';
import { supabase } from './lib/supabase';

type Tab = 'checkin' | 'manage' | 'scan';
type Theme = 'light' | 'dark';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [session, setSession] = useState<any>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('unilab-theme') as Theme | null;
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
    localStorage.setItem('unilab-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      listener.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const themeToggleLabel = useMemo(() => (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'), [theme]);

  if (!session) {
    return <SignIn theme={theme} onToggleTheme={toggleTheme} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors">
      <header className="bg-white/80 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">UniLibrary</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Bag Management Hub</h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">Effortless check-ins, QR tracking, instant confirmations</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 w-full">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-200 w-full sm:w-auto hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label={themeToggleLabel}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span className="hidden sm:inline">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 truncate hidden sm:block">{session.user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'checkin'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 sm:w-5 h-4 sm:h-5" />
            Check In Bag
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'manage'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 sm:w-5 h-4 sm:h-5" />
            Manage Bags
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'scan'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                : 'bg-white/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Scan className="w-4 sm:w-5 h-4 sm:h-5" />
            Scan QR
          </button>
        </div>

        <div>
          {activeTab === 'checkin' && <CheckIn />}
          {activeTab === 'manage' && <BagManagement />}
          {activeTab === 'scan' && <QRCheckoutScanner />}
        </div>
      </div>
    </div>
  );
}

export default App;
