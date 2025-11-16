export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  email_verified?: boolean;
  created_at: string;
}

export interface BagCheckin {
  id: string;
  student_id: string;
  tag_code: string;
  bag_description: string;
  checkin_time: string;
  checkout_time?: string;
  status: 'checked_in' | 'checked_out';
  librarian_id: string;
  qr_code_data?: string;
  qr_code_sent?: boolean;
  qr_email_sent_at?: string;
  qr_scanned_for_checkout?: boolean;
  created_at: string;
}

export interface BagCheckinWithStudent extends BagCheckin {
  student: Student;
}
