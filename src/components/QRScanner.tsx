import { useEffect, useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (qrData: string) => void;
  onScanError?: (error: string) => void;
  isActive: boolean;
}

export default function QRScanner({ onScanSuccess, onScanError, isActive }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scanningIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!isActive) {
      stopScanner();
      return;
    }

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setScanning(true);
          setError('');
          startQRDetection();
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to access camera';
        setError(message);
        onScanError?.(message);
      }
    };

    startScanner();

    return () => {
      stopScanner();
    };
  }, [isActive, onScanSuccess, onScanError]);

  const startQRDetection = () => {
    // Since jsqr requires setup, for now we'll use a manual input approach
    // In production, integrate jsqr properly
  };

  const stopScanner = () => {
    if (scanningIntervalRef.current) {
      clearInterval(scanningIntervalRef.current);
    }

    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }

    setScanning(false);
  };

  const handleManualScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qrData = e.target.value.trim();
    if (qrData) {
      onScanSuccess(qrData);
      e.target.value = '';
    }
  };

  if (!isActive) {
    return null;
  }

  return (
    <div className="w-full space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          ⚠️ {error}
        </div>
      )}

      {scanning && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2 text-sm">
          <Camera className="w-4 h-4 animate-pulse" />
          <span>Point camera at QR code (or paste below)</span>
        </div>
      )}

      {scanning && (
        <div className="w-full rounded-lg overflow-hidden border-2 border-gray-300 bg-black">
          <video
            ref={videoRef}
            className="w-full"
            style={{ minHeight: '300px', objectFit: 'cover' }}
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          QR Code Data (camera or paste):
        </label>
        <input
          type="text"
          placeholder="Paste scanned QR data or manually enter"
          onChange={handleManualScan}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {scanning && (
        <button
          onClick={stopScanner}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
        >
          <X className="w-4 h-4" />
          Stop Camera
        </button>
      )}
    </div>
  );
}
