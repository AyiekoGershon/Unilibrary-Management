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
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <List className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Active Check-Ins</h2>
          </div>
          <button
            onClick={fetchCheckins}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {loading && checkins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : checkins.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No bags currently checked in
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tag Code</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bag Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {checkins.map((checkin) => (
                  <tr key={checkin.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-blue-600">
                        {checkin.tag_code}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{checkin.student.full_name}</td>
                    <td className="px-4 py-3 text-gray-700">{checkin.student.student_id}</td>
                    <td className="px-4 py-3 text-gray-700">{checkin.bag_description}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(checkin.checkin_time).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Total active check-ins: <strong>{checkins.length}</strong>
        </div>
      </div>
    </div>
  );
}
