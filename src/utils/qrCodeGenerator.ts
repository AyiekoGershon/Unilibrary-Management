/**
 * QR Code utility for generating QR code data
 * 
 * The QR code encodes:
 * - Bag check-in ID
 * - Tag code
 * - Timestamp
 * - Used for checkout verification
 */

export interface QRCodeData {
  checkInId: string;
  tagCode: string;
  timestamp: string;
  studentId: string;
}

/**
 * Generate QR code data as a JSON string
 * This data will be encoded into the QR code
 */
export function generateQRCodeData(
  checkInId: string,
  tagCode: string,
  studentId: string
): string {
  const qrData: QRCodeData = {
    checkInId,
    tagCode,
    studentId,
    timestamp: new Date().toISOString(),
  };

  return JSON.stringify(qrData);
}

/**
 * Parse QR code data from scanned string
 */
export function parseQRCodeData(qrString: string): QRCodeData | null {
  try {
    const data = JSON.parse(qrString);
    if (data.checkInId && data.tagCode && data.timestamp) {
      return data as QRCodeData;
    }
    return null;
  } catch (error) {
    console.error('Failed to parse QR code data:', error);
    return null;
  }
}

/**
 * Validate QR code data structure
 */
export function isValidQRData(data: any): data is QRCodeData {
  return (
    typeof data === 'object' &&
    typeof data.checkInId === 'string' &&
    typeof data.tagCode === 'string' &&
    typeof data.studentId === 'string' &&
    typeof data.timestamp === 'string'
  );
}
