export interface Student {
  id: string;
  student_id: string;
  full_name: string;
  email?: string;
  phone?: string;
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
  created_at: string;
}

export interface BagCheckinWithStudent extends BagCheckin {
  student: Student;
}
