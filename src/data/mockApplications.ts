
import { TutorApplication, MentorApplication } from '@/types/applications';

export const mockTutorApplications: TutorApplication[] = [
  {
    id: '1',
    applicantId: '1',
    subjects: ['DCIT 101', 'Programming', 'JavaScript'],
    hourlyRate: 25,
    availability: [
      { day: 'Monday', startTime: '2:00 PM', endTime: '5:00 PM' },
      { day: 'Wednesday', startTime: '1:00 PM', endTime: '4:00 PM' }
    ],
    experience: 'I have been tutoring programming for 2 years and have helped over 50 students improve their coding skills.',
    qualifications: 'Computer Science Major, GPA 3.8, Dean\'s List',
    teachingStyle: 'I focus on practical examples and hands-on coding to help students understand concepts better.',
    motivation: 'I love helping fellow students succeed and sharing my passion for programming.',
    references: 'Prof. Johnson (CS Department), Dr. Smith (Programming Instructor)',
    status: 'approved',
    submittedAt: new Date('2024-01-10'),
    reviewedAt: new Date('2024-01-15'),
    reviewerNotes: 'Excellent application with strong background and teaching experience.'
  }
];

export const mockMentorApplications: MentorApplication[] = [
  {
    id: '1',
    applicantId: '1',
    industry: 'Technology',
    company: 'Google',
    position: 'Senior Software Engineer',
    experience: 5,
    specialties: ['Software Development', 'Career Growth', 'Tech Interviews'],
    achievements: 'Led 3 major product launches, mentored 15+ junior developers, promoted to senior level in 3 years',
    mentorshipExperience: 'I have been mentoring junior developers at my company for 2 years and have also volunteered as a mentor for coding bootcamps.',
    availability: [
      { day: 'Saturday', startTime: '10:00 AM', endTime: '2:00 PM' },
      { day: 'Sunday', startTime: '1:00 PM', endTime: '4:00 PM' }
    ],
    motivation: 'I want to give back to the community and help students transition successfully into tech careers.',
    approachDescription: 'I believe in practical guidance combined with emotional support. I help mentees set realistic goals and provide actionable advice.',
    linkedinProfile: 'https://linkedin.com/in/johndoe',
    portfolio: 'https://johndoe.dev',
    status: 'approved',
    submittedAt: new Date('2024-01-05'),
    reviewedAt: new Date('2024-01-12'),
    reviewerNotes: 'Outstanding mentor candidate with strong industry experience and mentoring background.'
  }
];
