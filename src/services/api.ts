import { supabase } from '../lib/supabase';
import { Student, BagCheckinWithStudent } from '../types';
import { generateTagCode } from '../utils/tagGenerator';
import { sendQRCodeEmail, markQREmailSent, sendCheckoutConfirmationEmail } from './emailService';

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

    const result: BagCheckinWithStudent = {
      ...data,
      student
    };

    // Generate QR code data and send email (async, don't wait)
    await this.generateAndSendQR(result);

    return result;
  },

  async generateAndSendQR(checkin: BagCheckinWithStudent): Promise<void> {
    try {
      // Generate QR code data with checkin details
      const qrData = JSON.stringify({
        checkinId: checkin.id,
        tagCode: checkin.tag_code,
        studentId: checkin.student_id,
        timestamp: checkin.checkin_time
      });

      console.log('🔄 Starting generateAndSendQR for checkin:', checkin.id);
      console.log('✅ QR data generated:', qrData);

      // Update database with QR data
      const { error: dbError } = await supabase
        .from('bag_checkins')
        .update({ qr_code_data: qrData })
        .eq('id', checkin.id);
      
      if (dbError) {
        console.error('❌ DB error updating QR data:', dbError);
      } else {
        console.log('✅ Database updated with QR data');
      }

      // Send email with QR code
      console.log('📧 Student email:', checkin.student.email);
      console.log('📧 Student name:', checkin.student.full_name);
      
      if (checkin.student.email) {
        console.log('📤 Sending email to:', checkin.student.email);
        const emailSent = await sendQRCodeEmail({
          template: 'checkin',
          studentEmail: checkin.student.email,
          studentName: checkin.student.full_name,
          tagCode: checkin.tag_code,
          bagDescription: checkin.bag_description,
          checkInTime: new Date(checkin.checkin_time).toLocaleString()
        });

        console.log('📮 Email sent result:', emailSent);
        if (emailSent) {
          await markQREmailSent(checkin.id);
        }
      } else {
        console.warn('⚠️  Student has no email address, using test email');
        // Use test email if student has no email
        // IMPORTANT: Replace this with your actual test email to receive test emails
        const testEmail = 'delivered@resend.dev';
        console.log('📤 Sending test email to:', testEmail);
        const emailSent = await sendQRCodeEmail({
          template: 'checkin',
          studentEmail: testEmail,
          studentName: checkin.student.full_name,
          tagCode: checkin.tag_code,
          bagDescription: checkin.bag_description,
          checkInTime: new Date(checkin.checkin_time).toLocaleString()
        });

        console.log('📮 Test email sent result:', emailSent);
        if (emailSent) {
          await markQREmailSent(checkin.id);
        }
      }
    } catch (error) {
      console.error('Error generating/sending QR code:', error);
      // Don't throw - let check-in succeed even if QR fails
    }
  },

  async checkOut(tagCode: string, librarianId: string): Promise<BagCheckinWithStudent> {
    const { data: checkin, error: fetchError } = await supabase
      .from('bag_checkins')
      .select(`
        *,
        student:student_id(*)
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
        student:student_id(*)
      `)
      .single();

    if (updateError) throw updateError;

    const result: BagCheckinWithStudent = {
      ...data,
      student: Array.isArray(data.student) ? data.student[0] : data.student
    };

    await this.sendCheckoutEmailIfPossible(result);

    return result;
  },

  async checkOutById(checkinId: string, librarianId: string): Promise<BagCheckinWithStudent> {
    const { data: checkin, error: fetchError } = await supabase
      .from('bag_checkins')
      .select(`
        *,
        student:student_id(*)
      `)
      .eq('id', checkinId)
      .eq('status', 'checked_in')
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!checkin) throw new Error('Bag not found or already checked out');

    const { data, error: updateError } = await supabase
      .from('bag_checkins')
      .update({
        status: 'checked_out',
        checkout_time: new Date().toISOString(),
        librarian_id: librarianId,
        qr_scanned_for_checkout: true
      })
      .eq('id', checkinId)
      .select(`
        *,
        student:student_id(*)
      `)
      .single();

    if (updateError) throw updateError;

    const result: BagCheckinWithStudent = {
      ...data,
      student: Array.isArray(data.student) ? data.student[0] : data.student
    };

    await this.sendCheckoutEmailIfPossible(result);

    return result;
  },

  async getActiveCheckins(): Promise<BagCheckinWithStudent[]> {
    const { data, error } = await supabase
      .from('bag_checkins')
      .select(`
        *,
        student:student_id(*)
      `)
      .eq('status', 'checked_in')
      .order('checkin_time', { ascending: false });

    if (error) throw error;

    return data.map(item => ({
      ...item,
      student: Array.isArray(item.student) ? item.student[0] : item.student
    }));
  },

  async sendCheckoutEmailIfPossible(checkin: BagCheckinWithStudent) {
    const student = checkin.student;
    if (!student?.email || !checkin.checkout_time) {
      return;
    }

    try {
      const stats = await this.calculateVisitStats(checkin.student_id, checkin.checkin_time, checkin.checkout_time);

      await sendCheckoutConfirmationEmail({
        studentEmail: student.email,
        studentName: student.full_name,
        tagCode: checkin.tag_code,
        checkoutTime: checkin.checkout_time,
        visitDurationMinutes: stats.durationMinutes,
        visitDurationLabel: stats.durationLabel,
        streakDays: stats.streakDays,
        thanksNote: stats.thanksNote
      });
    } catch (error) {
      console.error('❌ Failed to send checkout email:', error);
    }
  },

  async calculateVisitStats(studentId: string, checkInTime: string, checkOutTime: string) {
    const durationMinutes = Math.max(1, Math.round((new Date(checkOutTime).getTime() - new Date(checkInTime).getTime()) / 60000));
    const durationLabel = formatDuration(durationMinutes);

    const { data } = await supabase
      .from('bag_checkins')
      .select('checkout_time')
      .eq('student_id', studentId)
      .not('checkout_time', 'is', null)
      .order('checkout_time', { ascending: false })
      .limit(30);

    const streakDays = computeVisitStreak(
      (data || []).map((record) => record.checkout_time as string | null),
      checkOutTime
    );

    const thanksNote =
      streakDays > 1
        ? `You're on a ${streakDays}-day visit streak! Keep it going 📚`
        : 'Thanks for spending time at UniLibrary today. See you again soon!';

    return {
      durationMinutes,
      durationLabel,
      streakDays,
      thanksNote
    };
  }
};

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const parts: string[] = [];
  if (hours) parts.push(`${hours}h`);
  parts.push(`${minutes}m`);
  return parts.join(' ');
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function computeVisitStreak(history: (string | null)[], currentCheckout: string): number {
  const currentDay = startOfDay(new Date(currentCheckout));
  const validDates = history.filter(Boolean) as string[];
  const ordered = validDates.map((iso) => startOfDay(new Date(iso)));
  const uniqueDays: Date[] = [];

  for (const day of ordered) {
    if (!uniqueDays.length || uniqueDays[uniqueDays.length - 1].getTime() !== day.getTime()) {
      uniqueDays.push(day);
    }
  }

  let streak = 1;
  let previousDay = currentDay;

  for (const day of uniqueDays) {
    if (day.getTime() === currentDay.getTime()) {
      continue;
    }

    const diffDays = Math.round((previousDay.getTime() - day.getTime()) / 86400000);

    if (diffDays === 0) {
      continue;
    }

    if (diffDays === 1) {
      streak += 1;
      previousDay = day;
      continue;
    }

    break;
  }

  return streak;
}
