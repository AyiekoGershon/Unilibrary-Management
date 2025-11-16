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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header - Fixed at Top */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900">Bag Check-In Complete! ✅</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* Student Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-2 text-sm">
            <div>
              <span className="font-medium text-gray-700">Student: </span>
              <span className="text-gray-900">{studentName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Tag Code: </span>
              <span className="text-lg font-mono text-blue-600">{tagCode}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Item: </span>
              <span className="text-gray-900">{bagDescription}</span>
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex justify-center py-4 border-y border-gray-200">
            <div
              ref={containerRef}
              className="bg-white rounded-lg p-4 border-2 border-gray-200"
            />
          </div>

          {/* Instructions */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">📋 Student will receive:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Email with this QR code</li>
              <li>Check-out instructions</li>
              <li>Bag details and tag code</li>
            </ul>
          </div>

          {/* Email Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2 text-sm text-green-800">
            <Mail className="w-4 h-4" />
            <span>📧 QR code being sent to student email...</span>
          </div>
        </div>

        {/* Actions - Fixed at Bottom */}
        <div className="flex gap-2 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={downloadQR}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors text-sm"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          <button
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
