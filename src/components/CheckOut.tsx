import { useState } from 'react';
import { checkinService } from '../services/api';
import { BagCheckinWithStudent } from '../types';
import { LogOut, CheckCircle } from 'lucide-react';

export default function CheckOut() {
  const [tagCode, setTagCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkout, setCheckout] = useState<BagCheckinWithStudent | null>(null);

  const handleCheckOut = async () => {
    if (!tagCode.trim()) return;

    setLoading(true);
    setError('');
    try {
      const result = await checkinService.checkOut(tagCode, 'librarian-001');
      setCheckout(result);
      setTagCode('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Error checking out bag');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTagCode('');
    setError('');
    setCheckout(null);
  };

  if (checkout) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl p-8 text-center border border-slate-100 dark:border-slate-800">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-Out Successful!</h2>
          <p className="text-slate-500 dark:text-slate-300 mb-6">
            The bag has been released back to the student. Review the summary below.
          </p>
          <div className="text-left space-y-3 mb-6 bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-6 border border-slate-100 dark:border-slate-700">
            {[
              ['Tag Code', checkout.tag_code],
              ['Student', checkout.student.full_name],
              ['ID', checkout.student.student_id],
              ['Bag', checkout.bag_description],
              ['Checked In', new Date(checkout.checkin_time).toLocaleString()],
              ['Checked Out', checkout.checkout_time ? new Date(checkout.checkout_time).toLocaleString() : 'N/A']
            ].map(([label, value]) => (
              <p key={label as string} className="text-slate-700 dark:text-slate-200 flex justify-between gap-4">
                <span className="font-semibold text-slate-900 dark:text-white">{label}:</span>
                <span>{value}</span>
              </p>
            ))}
          </div>
          <button
            onClick={handleReset}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-indigo-500/30"
          >
            Check Out Another Bag
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-rose-100 dark:bg-rose-500/20 p-3 text-rose-600 dark:text-rose-200">
            <LogOut className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Step 2</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bag Check-Out</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-100 px-4 py-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
              Bag Tag Code
            </label>
            <input
              type="text"
              value={tagCode}
              onChange={(e) => setTagCode(e.target.value.toUpperCase())}
              placeholder="e.g., LIB-0542"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/90 dark:bg-slate-900/60 text-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-400 focus:border-transparent transition"
              onKeyPress={(e) => e.key === 'Enter' && handleCheckOut()}
            />
          </div>

          <button
            onClick={handleCheckOut}
            disabled={loading || !tagCode.trim()}
            className="w-full px-6 py-3 bg-rose-500 text-white rounded-2xl hover:bg-rose-400 transition-colors disabled:bg-slate-500 font-semibold shadow-lg shadow-rose-400/30"
          >
            {loading ? 'Processing...' : 'Check Out Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
