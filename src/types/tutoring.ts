
export interface TutoringSession {
  id: string;
  tutorId: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface TutoringRequest {
  id: string;
  studentId: string;
  tutorId: string;
  subject: string;
  preferredTimes: string[];
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}
