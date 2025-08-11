
import { TutoringRequest } from '@/types/tutoring';

export const mockTutoringRequests: TutoringRequest[] = [
  {
    id: '1',
    studentId: '2',
    tutorId: '1',
    subject: 'DCIT 101',
    message: 'I need help understanding basic programming concepts and getting started with my first assignment.',
    preferredTimes: 'Monday 2-4 PM, Wednesday 1-3 PM',
    status: 'pending',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '2',
    studentId: '3',
    tutorId: '1',
    subject: 'JavaScript',
    message: 'I\'m struggling with asynchronous programming and promises. Would love some guidance.',
    preferredTimes: 'Tuesday 3-5 PM, Friday 10 AM-12 PM',
    status: 'accepted',
    createdAt: new Date('2024-01-12')
  },
  {
    id: '3',
    studentId: '4',
    tutorId: '1',
    subject: 'Programming',
    message: 'Need help with debugging techniques and best practices for clean code.',
    preferredTimes: 'Weekends 9 AM-11 AM',
    status: 'declined',
    createdAt: new Date('2024-01-10')
  }
];
