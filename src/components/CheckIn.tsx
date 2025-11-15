import { useState } from 'react';
import { studentService, checkinService } from '../services/api';
import { Student, BagCheckinWithStudent } from '../types';
import { Search, Package, CheckCircle } from 'lucide-react';

export default function CheckIn() {
  const [studentId, setStudentId] = useState('');
  const [student, setStudent] = useState<Student | null>(null);
  const [bagDescription, setBagDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkin, setCheckin] = useState<BagCheckinWithStudent | null>(null);

  const handleLookup = async () => {
    if (!studentId.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      const foundStudent = await studentService.lookup(studentId);
      setStudent(foundStudent);
      if (!foundStudent) {
        setError('Student not found. Please verify the ID.');
      }
    } catch (err) {
      setError('Error looking up student');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!student || !bagDescription.trim()) return;

    setLoading(true);
    setError('');
    try {
      const result = await checkinService.checkIn({
        studentId: student.student_id,
        bagDescription,
        librarianId: 'librarian-001'
      });
      setCheckin(result);
      setBagDescription('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || 'Error checking in bag');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentId('');
    setStudent(null);
    setBagDescription('');
    setError('');
    setCheckin(null);
  };

  if (checkin) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-In Successful!</h2>
          <div className="bg-gray-50 rounded-lg p-6 my-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">{checkin.tag_code}</div>
            <p className="text-gray-600">Bag Tag Code</p>
          </div>
          <div className="text-left space-y-2 mb-6">
            <p className="text-gray-700"><strong>Student:</strong> {checkin.student.full_name}</p>
            <p className="text-gray-700"><strong>ID:</strong> {checkin.student.student_id}</p>
            <p className="text-gray-700"><strong>Bag:</strong> {checkin.bag_description}</p>
            <p className="text-gray-700"><strong>Time:</strong> {new Date(checkin.checkin_time).toLocaleString()}</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check In Another Bag
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <Package className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Bag Check-In</h2>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student ID
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., U123X456"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={student !== null}
              />
              {!student && (
                <button
                  onClick={handleLookup}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Lookup'}
                </button>
              )}
            </div>
          </div>

          {student && (
            <>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Student Found</h3>
                <p className="text-green-800"><strong>Name:</strong> {student.full_name}</p>
                <p className="text-green-800"><strong>ID:</strong> {student.student_id}</p>
                {student.email && <p className="text-green-800"><strong>Email:</strong> {student.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bag Description
                </label>
                <textarea
                  value={bagDescription}
                  onChange={(e) => setBagDescription(e.target.value)}
                  placeholder="e.g., Black backpack with laptop"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={loading || !bagDescription.trim()}
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 font-semibold"
                >
                  {loading ? 'Processing...' : 'Complete Check-In'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
