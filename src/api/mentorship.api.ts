
import apiClient, { getValidatedSpaceId } from '@/lib/apiClient';
import { PaginationParams } from './posts.api';

interface ApiResponse<T> {
  data: T;
}

export interface MentorProfile {
  id: string;
  user_id: string;
  expertise: string[];
  hourly_rate?: number;
  bio?: string;
  years_of_experience?: number;
  availability?: any;
  rating?: number;
  review_count?: number;
  created_at: string;
  user?: any;
}

export interface CreateMentorProfileRequest {
  expertise: string[];
  hourly_rate?: number;
  bio?: string;
  years_of_experience?: number;
  availability?: any;
}

export interface TutorProfile {
  id: string;
  user_id: string;
  subjects: string[];
  hourly_rate?: number;
  bio?: string;
  qualifications?: string;
  availability?: any;
  rating?: number;
  review_count?: number;
  created_at: string;
  user?: any;
}

export interface CreateTutorProfileRequest {
  subjects: string[];
  hourly_rate?: number;
  bio?: string;
  qualifications?: string;
  availability?: any;
}

export interface MentorApplication {
  id: string;
  user_id: string;
  expertise: string[];
  motivation?: string;
  availability?: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  submitted_at: string;
  experience?: number;
}

export interface TutorApplication {
  id: string;
  user_id: string;
  subjects: string[];
  motivation?: string;
  availability?: any;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  submitted_at: string;
  qualifications?: string;
}

export interface MentoringSession {
  id: string;
  mentor_id: string;
  mentee_id: string;
  scheduled_at: string;
  duration_minutes: number;
  topic?: string;
  meeting_link?: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
  created_at: string;
  mentee_notes?: string;
  mentor_notes?: string;
}

export interface TutoringSession {
  id: string;
  tutor_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  subject?: string;
  meeting_link?: string;
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
  created_at: string;
  student_notes?: string;
  tutor_notes?: string;
}

export interface AvailableTutoringSession {
  id: string;
  tutor_id: string;
  tutor_username: string;
  tutor_full_name: string;
  tutor_avatar?: string;
  tutor_subjects: string[];
  tutor_hourly_rate?: string;
  tutor_rating?: any;
  student_id: string;
  space_id: string;
  subject: string;
  status?: string;
  scheduled_at: string;
  duration: number;
  hourly_rate?: string;
  student_notes?: string;
  tutor_notes?: string;
  meeting_link?: string;
  rating?: number;
  review?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AvailableMentoringSession {
  id: string;
  mentor_id: string;
  mentor_username: string;
  mentor_full_name: string;
  mentor_avatar?: string;
  mentor_expertise: string[];
  mentor_years_of_experience?: number;
  mentor_rating?: any;
  mentee_id: string;
  space_id: string;
  topic: string;
  status?: string;
  scheduled_at: string;
  duration: number;
  mentee_notes?: string;
  mentor_notes?: string;
  meeting_link?: string;
  rating?: number;
  review?: string;
  created_at?: string;
  updated_at?: string;
}


export const searchMentors = async (
  query?: string,
  params?: PaginationParams
): Promise<MentorProfile[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<MentorProfile[]>>('/mentorship/mentors/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getMentorProfile = async (mentorId: string): Promise<MentorProfile> => {
  const response = await apiClient.get<ApiResponse<MentorProfile>>(`/mentorship/mentors/profile/${mentorId}`);
  return response.data.data;
};

export const getMentorReviews = async (mentorId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/mentorship/mentors/${mentorId}/reviews`);
  return response.data.data;
};

export const createMentorProfile = async (
  data: CreateMentorProfileRequest
): Promise<MentorProfile> => {
  const response = await apiClient.post<ApiResponse<MentorProfile>>('/mentorship/mentors/profile', data);
  return response.data.data;
};

export const updateMentorAvailability = async (
  mentorId: string,
  availability: any
): Promise<MentorProfile> => {
  const response = await apiClient.put<ApiResponse<MentorProfile>>(
    `/mentorship/mentors/profile/${mentorId}/availability`,
    { availability }
  );
  return response.data.data;
};

export const getMyMentorProfile = async (): Promise<MentorProfile | null> => {
    const application = await getMyMentorApplication();
  if (!application || application.status !== 'approved') {
    return null;
  }

    return {
    id: application.id,
    user_id: application.user_id,
    expertise: application.expertise,
    hourly_rate: undefined,
    bio: application.motivation,
    years_of_experience: application.experience,
    availability: application.availability,
    rating: undefined,
    review_count: undefined,
    created_at: application.submitted_at,
  };
};

export const getRecommendedMentors = async (limit: number = 5): Promise<MentorProfile[]> => {
  try {
    const response = await apiClient.get<ApiResponse<MentorProfile[]>>('/mentorship/mentors/recommended', {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    return [];
  }
};


export const searchTutors = async (
  query?: string,
  params?: PaginationParams
): Promise<TutorProfile[]> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.get<ApiResponse<TutorProfile[]>>('/mentorship/tutors/search', {
    params: { q: query, space_id: spaceId, ...params },
  });
  return response.data.data;
};

export const getTutorProfile = async (tutorId: string): Promise<TutorProfile> => {
  const response = await apiClient.get<ApiResponse<TutorProfile>>(`/mentorship/tutors/profile/${tutorId}`);
  return response.data.data;
};

export const getTutorReviews = async (tutorId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(`/mentorship/tutors/${tutorId}/reviews`);
  return response.data.data;
};

export const createTutorProfile = async (
  data: CreateTutorProfileRequest
): Promise<TutorProfile> => {
  const response = await apiClient.post<ApiResponse<TutorProfile>>('/mentorship/tutors/profile', data);
  return response.data.data;
};

export const updateTutorAvailability = async (
  tutorId: string,
  availability: any
): Promise<TutorProfile> => {
  const response = await apiClient.put<ApiResponse<TutorProfile>>(
    `/mentorship/tutors/profile/${tutorId}/availability`,
    { availability }
  );
  return response.data.data;
};

export const getMyTutorProfile = async (): Promise<TutorProfile | null> => {
    const application = await getMyTutorApplication();
  if (!application || application.status !== 'approved') {
    return null;
  }

    return {
    id: application.id,
    user_id: application.user_id,
    subjects: application.subjects,
    hourly_rate: undefined,
    bio: application.motivation,
    qualifications: application.qualifications,
    availability: application.availability,
    rating: undefined,
    review_count: undefined,
    created_at: application.submitted_at,
  };
};

export const getRecommendedTutors = async (limit: number = 5): Promise<TutorProfile[]> => {
  try {
    const response = await apiClient.get<ApiResponse<TutorProfile[]>>('/mentorship/tutors/recommended', {
      params: { limit },
    });
    return response.data.data;
  } catch (error) {
    return [];
  }
};


export const getMentorApplication = async (applicationId: string): Promise<MentorApplication> => {
  const response = await apiClient.get<ApiResponse<MentorApplication>>(
    `/mentorship/mentors/applications/${applicationId}`
  );
  return response.data.data;
};

export const getPendingMentorApplications = async (): Promise<MentorApplication[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<MentorApplication[]>>(
    '/mentorship/mentors/applications/pending',
    { params: { space_id: spaceId } }
  );
  return response.data.data;
};

export const submitMentorApplication = async (data: {
  space_id?: string;
  industry: string;
  company?: string;
  position?: string;
  experience: number;
  specialties: string[];
  motivation: string;
  availability: string[];
}): Promise<MentorApplication> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.post<ApiResponse<MentorApplication>>(
    '/mentorship/mentors/applications',
    {
      industry: data.industry,
      company: data.company,
      position: data.position,
      experience: data.experience,
      specialties: data.specialties,
      motivation: data.motivation,
      availability: data.availability,
      space_id: spaceId
    }
  );
  return response.data.data;
};

export const updateMentorApplication = async (
  applicationId: string,
  data: any
): Promise<MentorApplication> => {
  const response = await apiClient.put<ApiResponse<MentorApplication>>(
    `/mentorship/mentors/applications/${applicationId}`,
    data
  );
  return response.data.data;
};

export const getMyMentorApplication = async (): Promise<MentorApplication | null> => {
  try {
    const response = await apiClient.get<ApiResponse<MentorApplication>>('/mentorship/mentors/applications/my-application');
    return response.data.data;
  } catch (error: any) {
                        return null;
  }
};


export const getTutorApplication = async (applicationId: string): Promise<TutorApplication> => {
  const response = await apiClient.get<ApiResponse<TutorApplication>>(
    `/mentorship/tutors/applications/${applicationId}`
  );
  return response.data.data;
};

export const getPendingTutorApplications = async (): Promise<TutorApplication[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<TutorApplication[]>>(
    '/mentorship/tutors/applications/pending',
    { params: { space_id: spaceId } }
  );
  return response.data.data;
};

export const submitTutorApplication = async (data: {
  space_id?: string;
  subjects: string[];
  experience?: string;
  qualifications?: string;
  motivation: string;
  availability: string[];
}): Promise<TutorApplication> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.post<ApiResponse<TutorApplication>>(
    '/mentorship/tutors/applications',
    {
      subjects: data.subjects,
      experience: data.experience,
      qualifications: data.qualifications,
      motivation: data.motivation,
      availability: data.availability,
      space_id: spaceId
    }
  );
  return response.data.data;
};

export const updateTutorApplication = async (
  applicationId: string,
  data: any
): Promise<TutorApplication> => {
  const response = await apiClient.put<ApiResponse<TutorApplication>>(
    `/mentorship/tutors/applications/${applicationId}`,
    data
  );
  return response.data.data;
};

export const getMyTutorApplication = async (): Promise<TutorApplication | null> => {
  try {
    const response = await apiClient.get<ApiResponse<TutorApplication>>('/mentorship/tutors/applications/my-application');
    return response.data.data;
  } catch (error: any) {
    return null;
  }
};


export const getMentoringSession = async (sessionId: string): Promise<MentoringSession> => {
  const response = await apiClient.get<ApiResponse<MentoringSession>>(
    `/mentorship/mentoring/sessions/${sessionId}`
  );
  return response.data.data;
};

export const createMentoringSession = async (data: {
  mentor_id: string;
  scheduled_at: string;
  duration: number;
  topic?: string;
  mentee_notes?: string;
}): Promise<MentoringSession> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.post<ApiResponse<MentoringSession>>(
    '/mentorship/mentoring/sessions',
    {
      mentor_id: data.mentor_id,
      space_id: spaceId,
      scheduled_at: data.scheduled_at,
      duration: data.duration,
      topic: data.topic,
      mentee_notes: data.mentee_notes,
    }
  );
  return response.data.data;
};

export const getMentoringSessions = async (): Promise<MentoringSession[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<MentoringSession[]>>(
    '/mentorship/mentoring/sessions',
    { params: { space_id: spaceId } }
  );
  return response.data.data;
};

export const updateMentoringSessionStatus = async (
  sessionId: string,
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
): Promise<MentoringSession> => {
  const response = await apiClient.put<ApiResponse<MentoringSession>>(
    `/mentorship/mentoring/sessions/${sessionId}/status`,
    { status }
  );
  return response.data.data;
};

export const updateMentoringSessionMeetingLink = async (
  sessionId: string,
  meetingLink: string
): Promise<MentoringSession> => {
  const response = await apiClient.put<ApiResponse<MentoringSession>>(
    `/mentorship/mentoring/sessions/${sessionId}/meeting-link`,
    { meeting_link: meetingLink }
  );
  return response.data.data;
};

export const rateMentoringSession = async (
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  await apiClient.post(`/mentorship/mentoring/sessions/${sessionId}/rate`, { rating, feedback });
};


export const getTutoringSession = async (sessionId: string): Promise<TutoringSession> => {
  const response = await apiClient.get<ApiResponse<TutoringSession>>(
    `/mentorship/tutoring/sessions/${sessionId}`
  );
  return response.data.data;
};

export const createTutoringSession = async (data: {
  tutor_id: string;
  scheduled_at: string;
  duration: number;
  subject?: string;
  hourly_rate?: string;
  student_notes?: string;
}): Promise<TutoringSession> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.post<ApiResponse<TutoringSession>>(
    '/mentorship/tutoring/sessions',
    {
      tutor_id: data.tutor_id,
      space_id: spaceId,
      scheduled_at: data.scheduled_at,
      duration: data.duration,
      subject: data.subject,
      hourly_rate: data.hourly_rate,
      student_notes: data.student_notes,
    }
  );
  return response.data.data;
};

export const getTutoringSessions = async (): Promise<TutoringSession[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<TutoringSession[]>>(
    '/mentorship/tutoring/sessions',
    { params: { space_id: spaceId } }
  );
  return response.data.data;
};

export const getAvailableTutoringSessions = async (page: number = 1, limit: number = 20): Promise<AvailableTutoringSession[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<AvailableTutoringSession[]>>(
    '/mentorship/tutoring/sessions/available',
    { params: { space_id: spaceId, page, limit } }
  );
  return response.data.data;
};

export const getAvailableMentoringSessions = async (page: number = 1, limit: number = 20): Promise<AvailableMentoringSession[]> => {
  const spaceId = getValidatedSpaceId();
  const response = await apiClient.get<ApiResponse<AvailableMentoringSession[]>>(
    '/mentorship/mentoring/sessions/available',
    { params: { space_id: spaceId, page, limit } }
  );
  return response.data.data;
};

export const updateTutoringSessionStatus = async (
  sessionId: string,
  status: 'pending' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
): Promise<TutoringSession> => {
  const response = await apiClient.put<ApiResponse<TutoringSession>>(
    `/mentorship/tutoring/sessions/${sessionId}/status`,
    { status }
  );
  return response.data.data;
};

export const updateTutoringSessionMeetingLink = async (
  sessionId: string,
  meetingLink: string
): Promise<TutoringSession> => {
  const response = await apiClient.put<ApiResponse<TutoringSession>>(
    `/mentorship/tutoring/sessions/${sessionId}/meeting-link`,
    { meeting_link: meetingLink }
  );
  return response.data.data;
};

export const rateTutoringSession = async (
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  await apiClient.post(`/mentorship/tutoring/sessions/${sessionId}/rate`, { rating, feedback });
};


export interface PaymentDetails {
  amount: number;
  session_type: 'single' | 'semester';
  paid_at: string;
  platform_fee: number;
  tutor_amount: number;
  refund_eligible_until: string;
}

export interface TutoringRequest {
  id: string;
  session_id: string;
  requester_id: string;
  requester_username?: string;
  requester_full_name?: string;
  requester_avatar?: string;
  requester_department?: string;
  requester_level?: string;
  space_id: string;
  tutor_id?: string;
  tutor_username?: string;
  tutor_full_name?: string;
  subjects?: string[];
  rate?: string;
  availability?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'paid' | 'completed' | 'refund_pending' | 'refunded';
  message?: string;
  requested_at?: string;
  responded_at?: string;
  response_message?: string;
  created_at?: string;
  updated_at?: string;

  subject?: string;
  topic?: string;
  preferred_schedule?: string[];
  session_type?: 'single' | 'semester';
  payment_details?: PaymentDetails;
  rating?: number;
  review?: string;
  completed_at?: string;
  expires_at?: string;
  refund_reason?: string;
  refund_explanation?: string;
  refund_requested_at?: string;
}

export interface MentorshipRequest {
  id: string;
  session_id: string;
  requester_id: string;
  requester_username?: string;
  requester_full_name?: string;
  requester_avatar?: string;
  requester_department?: string;
  requester_level?: string;
  space_id: string;
  mentor_username?: string;
  mentor_full_name?: string;
  industry?: string;
  specialties?: string[];
  rate?: string;
  availability?: string[];
  status: string;
  message?: string;
  requested_at?: string;
  responded_at?: string;
  response_message?: string;
  created_at?: string;
  updated_at?: string;
}


export const createTutoringRequest = async (data: {
  session_id?: string;
  message?: string;
  tutor_id: string;
  subject?: string;
  topic?: string;
  preferred_schedule?: string[];
  session_type?: 'single' | 'semester';
}): Promise<TutoringRequest> => {
  const spaceId = getValidatedSpaceId();

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    '/mentorship/tutoring/requests',
    {
      tutor_id: data.tutor_id,
      space_id: spaceId,
      subject: data.subject,
      topic: data.topic,
      preferred_schedule: data.preferred_schedule,
      session_type: data.session_type,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    }
  );
  return response.data.data;
};

export const getTutoringRequest = async (requestId: string): Promise<TutoringRequest> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}`
  );
  return response.data.data;
};

export const getSessionTutoringRequests = async (sessionId: string): Promise<TutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    `/mentorship/tutoring/requests/session/${sessionId}`
  );
  return response.data.data;
};

export const getUserTutoringRequests = async (page: number = 1, limit: number = 20): Promise<TutoringRequest[]> => {
    const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    '/mentorship/tutoring/requests/my-requests',
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const getTutorSessionRequests = async (page: number = 1, limit: number = 20): Promise<TutoringRequest[]> => {
    const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    '/mentorship/tutoring/requests/tutor-requests',
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const updateTutoringRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected' | 'cancelled',
  responseMessage?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}`,
    { status, response_message: responseMessage }
  );
  return response.data.data;
};

export const deleteTutoringRequest = async (requestId: string): Promise<void> => {
  await apiClient.delete(`/mentorship/tutoring/requests/${requestId}`);
};

// Phase 1 MVP - Enhanced Tutoring Request Functions

export const acceptTutoringRequest = async (requestId: string): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}/accept`,
    { status: 'accepted', responded_at: new Date().toISOString() }
  );
  return response.data.data;
};

export const declineTutoringRequest = async (
  requestId: string,
  reason?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}/decline`,
    { 
      status: 'declined', 
      response_message: reason,
      responded_at: new Date().toISOString() 
    }
  );
  return response.data.data;
};

export const payForTutoringSession = async (
  requestId: string,
  paymentData: {
    amount: number;
    session_type: 'single' | 'semester';
    platform_fee: number;
    tutor_amount: number;
  }
): Promise<TutoringRequest> => {
  const refundWindow = paymentData.session_type === 'single' ? 7 : 14; // days
  const refundEligibleUntil = new Date();
  refundEligibleUntil.setDate(refundEligibleUntil.getDate() + refundWindow);

  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}/pay`,
    {
      status: 'paid',
      payment_details: {
        ...paymentData,
        paid_at: new Date().toISOString(),
        refund_eligible_until: refundEligibleUntil.toISOString(),
      },
    }
  );
  return response.data.data;
};

export const completeTutoringSession = async (
  requestId: string,
  rating: number,
  review?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}/complete`,
    {
      status: 'completed',
      rating,
      review,
      completed_at: new Date().toISOString(),
    }
  );
  return response.data.data;
};

export const requestTutoringRefund = async (
  requestId: string,
  reason: string,
  explanation?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/mentorship/tutoring/requests/${requestId}/refund`,
    {
      status: 'refund_pending',
      refund_reason: reason,
      refund_explanation: explanation,
      refund_requested_at: new Date().toISOString(),
    }
  );
  return response.data.data;
};


export const createMentorshipRequest = async (data: {
  session_id: string;
  message?: string;
}): Promise<MentorshipRequest> => {
  const spaceId = getValidatedSpaceId();

  const response = await apiClient.post<ApiResponse<MentorshipRequest>>(
    '/mentorship/mentoring/requests',
    {
      session_id: data.session_id,
      space_id: spaceId,
      message: data.message,
    }
  );
  return response.data.data;
};

export const getMentorshipRequest = async (requestId: string): Promise<MentorshipRequest> => {
  const response = await apiClient.get<ApiResponse<MentorshipRequest>>(
    `/mentorship/mentoring/requests/${requestId}`
  );
  return response.data.data;
};

export const getSessionMentorshipRequests = async (sessionId: string): Promise<MentorshipRequest[]> => {
  const response = await apiClient.get<ApiResponse<MentorshipRequest[]>>(
    `/mentorship/mentoring/requests/session/${sessionId}`
  );
  return response.data.data;
};

export const getUserMentorshipRequests = async (page: number = 1, limit: number = 20): Promise<MentorshipRequest[]> => {
    const response = await apiClient.get<ApiResponse<MentorshipRequest[]>>(
    '/mentorship/mentoring/requests/my-requests',
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const getMentorSessionRequests = async (page: number = 1, limit: number = 20): Promise<MentorshipRequest[]> => {
    const response = await apiClient.get<ApiResponse<MentorshipRequest[]>>(
    '/mentorship/mentoring/requests/mentor-requests',
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const updateMentorshipRequestStatus = async (
  requestId: string,
  status: 'approved' | 'rejected' | 'cancelled',
  responseMessage?: string
): Promise<MentorshipRequest> => {
  const response = await apiClient.put<ApiResponse<MentorshipRequest>>(
    `/mentorship/mentoring/requests/${requestId}`,
    { status, response_message: responseMessage }
  );
  return response.data.data;
};

export const deleteMentorshipRequest = async (requestId: string): Promise<void> => {
  await apiClient.delete(`/mentorship/mentoring/requests/${requestId}`);
};

export const mentorshipApi = {
    searchMentors,
  getMentorProfile,
  getMentorReviews,
  createMentorProfile,
  updateMentorAvailability,
  getRecommendedMentors,
    searchTutors,
  getTutorProfile,
  getTutorReviews,
  createTutorProfile,
  updateTutorAvailability,
  getRecommendedTutors,
    getMentorApplication,
  getPendingMentorApplications,
  submitMentorApplication,
  updateMentorApplication,
    getTutorApplication,
  getPendingTutorApplications,
  submitTutorApplication,
  updateTutorApplication,
    getMentoringSession,
  createMentoringSession,
  getMentoringSessions,
  updateMentoringSessionStatus,
  updateMentoringSessionMeetingLink,
  rateMentoringSession,
    getTutoringSession,
  createTutoringSession,
  getTutoringSessions,
  getAvailableTutoringSessions,
  getAvailableMentoringSessions,
  updateTutoringSessionStatus,
  updateTutoringSessionMeetingLink,
  rateTutoringSession,
    createTutoringRequest,
  getTutoringRequest,
  getSessionTutoringRequests,
  getUserTutoringRequests,
  getTutorSessionRequests,
  updateTutoringRequestStatus,
  deleteTutoringRequest,
    createMentorshipRequest,
  getMentorshipRequest,
  getSessionMentorshipRequests,
  getUserMentorshipRequests,
  getMentorSessionRequests,
  updateMentorshipRequestStatus,
  deleteMentorshipRequest,
};

export default mentorshipApi;
