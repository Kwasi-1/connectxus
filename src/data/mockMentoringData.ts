
import { MentoringRequest } from '@/types/mentoring';

export const mockMentoringRequests: MentoringRequest[] = [
  {
    id: '1',
    menteeId: '2',
    mentorId: '1',
    topic: 'Career Guidance',
    message: 'I would love to get advice on transitioning into the tech industry and building a strong portfolio.',
    status: 'pending',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    menteeId: '3',
    mentorId: '1',
    topic: 'Interview Preparation',
    message: 'I have upcoming technical interviews and need guidance on how to prepare effectively.',
    status: 'accepted',
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    menteeId: '4',
    mentorId: '1',
    topic: 'Leadership Development',
    message: 'Looking for advice on developing leadership skills early in my career.',
    status: 'declined',
    createdAt: new Date('2024-01-10')
  }
];
