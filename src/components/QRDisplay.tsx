import { useEffect, useRef } from 'react';
import { Download, X, Mail } from 'lucide-react';
import QRCodeStyling from 'qr-code-styling';

interface QRDisplayProps {
  qrData: string;
  tagCode: string;
  studentName: string;
  bagDescription: string;
  onClose: () => void;
}

export default function QRDisplay({
  qrData,
  tagCode,
  studentName,
  bagDescription,
  onClose
}: QRDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !qrData) return;

    // Clear previous QR code
    containerRef.current.innerHTML = '';

    // Create QR code with styling
    const qrCode = new QRCodeStyling({
      width: 300,
      height: 300,
      data: qrData,
      image: '',
      dotsOptions: {
        color: '#1e40af',
        type: 'rounded'
      },
      cornersSquareOptions: {
        color: '#1e40af',
        type: 'extra-rounded'
      },
      backgroundOptions: {
        color: '#ffffff'
      }
    });

    qrCode.append(containerRef.current);
  }, [qrData]);

  const downloadQR = () => {
    const element = containerRef.current?.querySelector('canvas');
    if (element) {
      const link = document.createElement('a');
      link.href = element.toDataURL('image/png');
      link.download = `bag-${tagCode}-qr.png`;
      link.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 dark:bg-slate-900/90 rounded-3xl shadow-2xl border border-white/30 dark:border-slate-800 max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 flex-shrink-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bag Check-In Complete! ✅</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4 text-slate-900 dark:text-slate-100">
          {/* Student Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-500/10 dark:to-blue-500/10 border border-indigo-100 dark:border-indigo-500/30 rounded-2xl p-3 space-y-2 text-sm">
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Student: </span>
              <span className="text-slate-900 dark:text-white">{studentName}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Tag Code: </span>
              <span className="text-lg font-mono text-indigo-600 dark:text-indigo-300">{tagCode}</span>
            </div>
            <div>
              <span className="font-medium text-slate-700 dark:text-slate-200">Item: </span>
              <span className="text-slate-900 dark:text-white">{bagDescription}</span>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center py-4 border-y border-slate-100 dark:border-slate-800">
            <div
              ref={containerRef}
              className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-slate-100 dark:border-slate-700"
            />
          </div>

          {/* Instructions */}
          <div className="bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/40 rounded-2xl p-4 text-sm text-amber-800 dark:text-amber-100">
            <p className="font-medium mb-2">📋 Student will receive:</p>
            <ul className="space-y-1 text-xs list-disc pl-4">
              <li>Email with this QR code</li>
              <li>Check-out instructions</li>
              <li>Bag details and tag code</li>
            </ul>
          </div>

          {/* Email Status */}
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-3 flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-100">
            <Mail className="w-4 h-4" />
            <span>📧 QR code being sent to student email...</span>
          </div>
        </div>

        {/* Actions - Fixed at Bottom */}
        <div className="flex gap-2 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex-shrink-0">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 font-medium transition-colors text-sm shadow-lg shadow-indigo-500/30"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
