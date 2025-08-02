
export interface TutorApplication {
  id: string;
  applicantId: string;
  subjects: string[];
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

export interface MentorApplication {
  id: string;
  applicantId: string;
  industry: string;
  company?: string;
  position?: string;
  experience: number;
  specialties: string[];
  achievements: string;
  mentorshipExperience: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  motivation: string;
  approachDescription: string;
  linkedinProfile?: string;
  portfolio?: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerNotes?: string;
}
