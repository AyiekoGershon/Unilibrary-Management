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
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-Out Successful!</h2>
          <div className="text-left space-y-2 mb-6 bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700"><strong>Tag Code:</strong> {checkout.tag_code}</p>
            <p className="text-gray-700"><strong>Student:</strong> {checkout.student.full_name}</p>
            <p className="text-gray-700"><strong>ID:</strong> {checkout.student.student_id}</p>
            <p className="text-gray-700"><strong>Bag:</strong> {checkout.bag_description}</p>
            <p className="text-gray-700"><strong>Checked In:</strong> {new Date(checkout.checkin_time).toLocaleString()}</p>
            <p className="text-gray-700"><strong>Checked Out:</strong> {checkout.checkout_time ? new Date(checkout.checkout_time).toLocaleString() : 'N/A'}</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Out Another Bag
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <LogOut className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Bag Check-Out</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bag Tag Code
            </label>
            <input
              type="text"
              value={tagCode}
              onChange={(e) => setTagCode(e.target.value.toUpperCase())}
              placeholder="e.g., LIB-0542"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              onKeyPress={(e) => e.key === 'Enter' && handleCheckOut()}
            />
          </div>

          <button
            onClick={handleCheckOut}
            disabled={loading || !tagCode.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Processing...' : 'Check Out Bag'}
          </button>
        </div>
      </div>
    </div>
  );
}
