
export interface MentoringSession {
  id: string;
  mentorId: string;
  menteeId: string;
  topic: string;
  date: string;
  time: string;
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}

export interface MentoringRequest {
  id: string;
  menteeId: string;
  mentorId: string;
  topic: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
}
