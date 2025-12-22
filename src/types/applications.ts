
export interface TutorApplication {
  id: string;
  applicantId: string;
  subject: string;
  hourlyRate?: number;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  experience: string;
  qualifications: string;
  teachingStyle: string;
  motivation: string;
  references?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerNotes?: string;
}
