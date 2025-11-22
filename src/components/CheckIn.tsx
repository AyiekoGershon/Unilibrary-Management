import { useState } from 'react';
import { studentService, checkinService } from '../services/api';
import { Student, BagCheckinWithStudent } from '../types';
import { Search, Package, CheckCircle } from 'lucide-react';
import QRDisplay from './QRDisplay';

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
      <>
        <QRDisplay
          qrData={checkin.qr_code_data || JSON.stringify({ checkinId: checkin.id, tagCode: checkin.tag_code, studentId: checkin.student_id, timestamp: checkin.checkin_time })}
          tagCode={checkin.tag_code}
          studentName={checkin.student.full_name}
          bagDescription={checkin.bag_description}
          onClose={handleReset}
        />
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl p-8 sm:p-10 text-center border border-slate-100 dark:border-slate-800">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-In Successful!</h2>
            <p className="text-slate-500 dark:text-slate-300 mb-6">Share this reference with the student and attach the tag to their bag.</p>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl p-6 my-6 border border-indigo-100 dark:border-indigo-500/30">
              <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-300 mb-2 tracking-[0.2em]">
                {checkin.tag_code}
              </div>
              <p className="text-slate-600 dark:text-slate-200 font-medium uppercase text-xs tracking-[0.4em]">Bag Tag Code</p>
            </div>
            <div className="text-left grid gap-3 mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-700">
              <InfoRow label="Student" value={checkin.student.full_name} />
              <InfoRow label="Student ID" value={checkin.student.student_id} />
              <InfoRow label="Bag" value={checkin.bag_description} />
              <InfoRow label="Checked in" value={new Date(checkin.checkin_time).toLocaleString()} />
            </div>
            <button
              onClick={handleReset}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl transition-colors font-semibold shadow-lg shadow-indigo-500/30"
            >
              Check In Another Bag
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 sm:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 p-3 text-indigo-600 dark:text-indigo-300">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Bag Check-In</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/40 text-red-700 dark:text-red-100 px-4 py-3 rounded-2xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
              Student ID
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g., U123X456"
                className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/90 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
                disabled={student !== null}
              />
              {!student && (
                <button
                  onClick={handleLookup}
                  disabled={loading}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2 font-semibold shadow-lg shadow-indigo-500/30"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Searching...' : 'Lookup'}
                </button>
              )}
            </div>
          </div>

          {student && (
            <>
              <div className="bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-4">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Student Verified
                </h3>
                <div className="grid gap-1 text-sm text-emerald-900 dark:text-emerald-100">
                  <p><strong>Name:</strong> {student.full_name}</p>
                  <p><strong>ID:</strong> {student.student_id}</p>
                  {student.email && <p><strong>Email:</strong> {student.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  Bag Description
                </label>
                <textarea
                  value={bagDescription}
                  onChange={(e) => setBagDescription(e.target.value)}
                  placeholder="e.g., Black backpack with laptop"
                  rows={3}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white/90 dark:bg-slate-900/60 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCheckIn}
                  disabled={loading || !bagDescription.trim()}
                  className="flex-1 px-6 py-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-400 transition-colors disabled:bg-slate-500 font-semibold shadow-lg shadow-emerald-400/30"
                >
                  {loading ? 'Processing...' : 'Complete Check-In'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold"
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-slate-700 dark:text-slate-200">
      <span className="font-semibold text-slate-900 dark:text-white">{label}:</span> {value}
    </p>
  );
}
