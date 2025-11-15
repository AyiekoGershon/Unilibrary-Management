import { supabase } from '../lib/supabase';
import { Student, BagCheckinWithStudent } from '../types';
import { generateTagCode } from '../utils/tagGenerator';

export const studentService = {
  async lookup(studentId: string): Promise<Student | null> {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async create(studentData: {
    student_id: string;
    full_name: string;
    email?: string;
    phone?: string;
  }): Promise<Student> {
    const { data, error } = await supabase
      .from('students')
      .insert([studentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const checkinService = {
  async checkIn(params: {
    studentId: string;
    bagDescription: string;
    librarianId: string;
  }): Promise<BagCheckinWithStudent> {
    const student = await studentService.lookup(params.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    const existingCheckin = await supabase
      .from('bag_checkins')
      .select('*')
      .eq('student_id', student.id)
      .eq('status', 'checked_in')
      .maybeSingle();

    if (existingCheckin.data) {
      throw new Error('Student already has a bag checked in');
    }

    let tagCode = generateTagCode();
    let isUnique = false;

    while (!isUnique) {
      const { data: existing } = await supabase
        .from('bag_checkins')
        .select('tag_code')
        .eq('tag_code', tagCode)
        .maybeSingle();

      if (!existing) {
        isUnique = true;
      } else {
        tagCode = generateTagCode();
      }
    }

    const { data, error } = await supabase
      .from('bag_checkins')
      .insert([{
        student_id: student.id,
        tag_code: tagCode,
        bag_description: params.bagDescription,
        librarian_id: params.librarianId,
        status: 'checked_in'
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      ...data,
      student
    };
  },

  async checkOut(tagCode: string, librarianId: string): Promise<BagCheckinWithStudent> {
    const { data: checkin, error: fetchError } = await supabase
      .from('bag_checkins')
      .select(`
        *,
        student:students(*)
      `)
      .eq('tag_code', tagCode)
      .eq('status', 'checked_in')
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!checkin) throw new Error('Bag not found or already checked out');

    const { data, error: updateError } = await supabase
      .from('bag_checkins')
      .update({
        status: 'checked_out',
        checkout_time: new Date().toISOString(),
        librarian_id: librarianId
      })
      .eq('id', checkin.id)
      .select(`
        *,
        student:students(*)
      `)
      .single();

    if (updateError) throw updateError;

    return {
      ...data,
      student: Array.isArray(data.student) ? data.student[0] : data.student
    };
  },

  async getActiveCheckins(): Promise<BagCheckinWithStudent[]> {
    const { data, error } = await supabase
      .from('bag_checkins')
      .select(`
        *,
        student:students(*)
      `)
      .eq('status', 'checked_in')
      .order('checkin_time', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      student: Array.isArray(item.student) ? item.student[0] : item.student
    }));
  }
};
