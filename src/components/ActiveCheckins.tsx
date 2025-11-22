import { useState, useEffect } from 'react';
import { checkinService } from '../services/api';
import { BagCheckinWithStudent } from '../types';
import { List, RefreshCw } from 'lucide-react';

export default function ActiveCheckins() {
  const [checkins, setCheckins] = useState<BagCheckinWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCheckins = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await checkinService.getActiveCheckins();
      setCheckins(data);
    } catch (err) {
      setError('Error loading active check-ins');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckins();
  }, []);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-8 h-8 text-indigo-600 dark:text-indigo-300" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Active Check-Ins</h2>
          </div>
          <button
            onClick={fetchCheckins}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-colors disabled:bg-slate-500 shadow-lg shadow-indigo-500/30"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-100 px-4 py-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        {loading && checkins.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-300">Loading...</div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-300">
            No bags currently checked in
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Tag Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Bag Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {checkins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-indigo-50/70 dark:hover:bg-indigo-500/10">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-300">
                        {checkin.tag_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-900 dark:text-white">{checkin.student.full_name}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{checkin.student.student_id}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{checkin.bag_description}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {new Date(checkin.checkin_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          Total active check-ins: <strong>{checkins.length}</strong>
        </div>
      </div>
    </div>
  );
}
