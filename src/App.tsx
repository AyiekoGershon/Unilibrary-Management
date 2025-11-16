import { useEffect, useState } from 'react';
import CheckIn from './components/CheckIn';
import CheckOut from './components/CheckOut';
import ActiveCheckins from './components/ActiveCheckins';
import SignIn from './components/SignIn';
import { Package, LogOut, List } from 'lucide-react';
import { supabase } from './lib/supabase';

type Tab = 'checkin' | 'checkout' | 'active';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      // If returning from an OAuth redirect, finalize the session from the URL
      // supabase-js v2 removed getSessionFromUrl; rely on getSession and onAuthStateChange instead.
      // If you need to handle OAuth redirect manually, parse the URL and call auth.setSession().
      
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      mounted = false;
      // unsubscribe
      listener.subscription?.unsubscribe?.();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return <SignIn />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">UniLibrary Bag Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Digital bag tracking system</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
            <div className="text-xs sm:text-sm text-gray-700 truncate hidden sm:block">{session.user?.email}</div>
            <button
              onClick={handleSignOut}
              className="w-full sm:w-auto px-3 py-2 bg-gray-100 rounded hover:bg-gray-200 text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'checkin'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-4 sm:w-5 h-4 sm:h-5" />
            Check In
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'checkout'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
            Check Out
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-4 sm:w-5 h-4 sm:h-5" />
            Active Check-Ins
          </button>
        </div>

        <div>
          {activeTab === 'checkin' && <CheckIn />}
          {activeTab === 'checkout' && <CheckOut />}
          {activeTab === 'active' && <ActiveCheckins />}
        </div>
      </div>
    </div>
  );
}

export default App;
