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
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">UniLibrary Bag Management</h1>
            <p className="text-gray-600 mt-1">Digital bag tracking system</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700">{session.user?.email}</div>
            <button
              onClick={handleSignOut}
              className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'checkin'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            Check In
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'checkout'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <LogOut className="w-5 h-5" />
            Check Out
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <List className="w-5 h-5" />
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
