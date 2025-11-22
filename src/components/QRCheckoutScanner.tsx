import { useEffect, useRef, useState } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { checkinService } from '../services/api'
import { BagCheckinWithStudent } from '../types'
import { CheckCircle, X, Camera } from 'lucide-react'

export default function QRCheckoutScanner() {
  const [scannedData, setScannedData] = useState<BagCheckinWithStudent | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scannerReady, setScannerReady] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    const containerId = 'qr-checkout-scanner-container'

    const scanner = new Html5QrcodeScanner(
      containerId,
      {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      },
      false
    )

    const onScanSuccess = async (decodedText: string) => {
      try {
        // Parse the QR code data
        const qrData = JSON.parse(decodedText)
        const { checkinId } = qrData

        if (!checkinId) {
          setError('Invalid QR code format')
          return
        }

        setError(null)

        // Perform checkout using the checkinId
        const result = await checkinService.checkOutById(checkinId, 'librarian-001')
        setScannedData(result)

        // Stop scanning after successful scan
        scanner.pause()
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || 'Failed to process QR code')
        console.error('QR scan error:', err)
      }
    }

    const onScanError = (errorMessage: string) => {
      // Ignore scanning errors (too many false positives)
      console.debug('QR scan error:', errorMessage)
    }

    scanner.render(onScanSuccess, onScanError)
    scannerRef.current = scanner
    setScannerReady(true)

    return () => {
      scanner.clear().catch(err => console.error('Error clearing scanner:', err))
    }
  }, [])

  const handleReset = () => {
    setScannedData(null)
    setError(null)
    if (scannerRef.current) {
      scannerRef.current.resume()
    }
  }

  if (scannedData) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check-Out Successful!</h2>
          <div className="text-left space-y-3 mb-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-500/10 dark:to-blue-500/10 rounded-2xl p-6 border border-green-100 dark:border-green-500/30">
            <div className="border-b border-green-200 pb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Bag Tag Code</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-300">{scannedData.tag_code}</p>
            </div>
            <div className="border-b border-green-200 pb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Student Name</p>
              <p className="text-xl font-semibold text-slate-900 dark:text-white">{scannedData.student.full_name}</p>
            </div>
            <div className="border-b border-green-200 pb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Student ID</p>
              <p className="text-slate-700 dark:text-slate-200">{scannedData.student.student_id}</p>
            </div>
            <div className="border-b border-green-200 pb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Bag Description</p>
              <p className="text-slate-700 dark:text-slate-200">{scannedData.bag_description}</p>
            </div>
            <div className="border-b border-green-200 pb-3">
              <p className="text-sm text-slate-600 dark:text-slate-300">Checked In</p>
              <p className="text-slate-700 dark:text-slate-200">{new Date(scannedData.checkin_time).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-300">Checked Out</p>
              <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                {scannedData.checkout_time ? new Date(scannedData.checkout_time).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl hover:bg-indigo-500 transition-colors font-semibold shadow-lg shadow-indigo-500/30"
          >
            Scan Next Bag
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 p-3 text-indigo-600 dark:text-indigo-300">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">Automatic Checkout</p>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Scan QR Code to Check Out</h2>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/20 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-100 px-4 py-3 rounded-2xl mb-6 flex items-start gap-3">
            <X className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl dark:bg-blue-500/10 dark:border-blue-500/40">
          <p className="text-sm text-blue-700 dark:text-blue-200">
            📷 Point your camera at the QR code displayed on the student's bag tag. The system will automatically check out the bag when the code is scanned.
          </p>
        </div>

        <div className="mb-6 relative">
          {!scannerReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/60 text-white gap-3 z-10">
              <div className="animate-spin">
                <Camera className="w-8 h-8 text-indigo-400" />
              </div>
              <p className="text-sm text-slate-200">Initializing camera...</p>
            </div>
          )}
          <div
            id="qr-checkout-scanner-container"
            className="w-full rounded-2xl border-2 border-indigo-500 overflow-hidden shadow-inner"
          />
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-sm text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/40 dark:text-yellow-100">
          <p className="font-semibold mb-2">💡 Tips:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ensure good lighting for faster scanning</li>
            <li>Hold the QR code steady in front of the camera</li>
            <li>Keep the QR code centered in the box</li>
            <li>The system will automatically check out once scanned</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
