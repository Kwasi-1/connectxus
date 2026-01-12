import apiClient from "@/lib/apiClient";
import { PaginationParams } from "./posts.api";

interface ApiResponse<T> {
  data: T;
}

export interface TutorProfile {

  id: string;
  user_id: string;
  subject: string;
  hourly_rate?: number;
  session_rate?: number;
  semester_rate?: number;
  bio?: string;
  experience?: string;
  qualifications?: string;
  availability?: any;
  rating?: number;
  review_count?: number;
  badges?: string[];
  payout_requested?: boolean;
  verified?: boolean;
  created_at: string;
  applicant_id?: string;
  user?: any;
}

export interface CreateTutorProfileRequest {
  subject: string;
  hourly_rate?: number;
  bio?: string;
  qualifications?: string;
  availability?: any;
}

export interface TutorApplication {
  id: string;
  user_id: string;
  subject: string;
  experience?: string;
  qualifications?: string;
  teaching_style?: string;
  motivation?: string;
  references?: string;
  availability?: any;
  session_rate?: number;
  semester_rate?: number;
  status: "pending" | "approved" | "rejected";
  reviewed_by?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  submitted_at: string;
}

export interface ApplicationStatusResponse {
  id: string;
  status: "pending" | "approved" | "rejected";
}

export interface TutoringSession {
  id: string;
  tutor_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes: number;
  subject?: string;
  meeting_link?: string;
  status: "pending" | "scheduled" | "confirmed" | "completed" | "cancelled";
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
  tutor_subject: string;
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

export const searchTutors = async (
  query?: string,
  params?: PaginationParams
): Promise<TutorProfile[]> => {
  const response = await apiClient.get<ApiResponse<TutorProfile[]>>(
    "/tutoring/tutors/search",
    {
      params: { q: query, ...params },
    }
  );
  return response.data.data;
};

export const getTutorProfile = async (
  tutorId: string
): Promise<TutorProfile> => {
  const response = await apiClient.get<ApiResponse<TutorProfile>>(
    `/tutoring/tutors/profile/${tutorId}`
  );
  return response.data.data;
};

export const getTutorReviews = async (tutorId: string): Promise<any[]> => {
  const response = await apiClient.get<ApiResponse<any[]>>(
    `/tutoring/tutors/${tutorId}/reviews`
  );
  return response.data.data;
};

export const createTutorProfile = async (
  data: CreateTutorProfileRequest
): Promise<TutorProfile> => {
  const response = await apiClient.post<ApiResponse<TutorProfile>>(
    "/tutoring/tutors/profile",
    data
  );
  return response.data.data;
};

export const updateTutorAvailability = async (
  tutorId: string,
  availability: any
): Promise<TutorProfile> => {
  const response = await apiClient.put<ApiResponse<TutorProfile>>(
    `/tutoring/tutors/profile/${tutorId}/availability`,
    { availability }
  );
  return response.data.data;
};

export const getMyTutorProfile = async (): Promise<TutorProfile | null> => {
  const application = await getMyTutorApplication();
  if (!application || application.status !== "approved") {
    return null;
  }

  return {
    id: application.id,
    user_id: application.user_id,
    subject: application.subject,
    hourly_rate: undefined,
    session_rate: application.session_rate,
    semester_rate: application.semester_rate,
    bio: application.motivation,
    experience: application.experience,
    qualifications: application.qualifications,
    availability: application.availability,
    rating: undefined,
    review_count: undefined,
    created_at: application.submitted_at,
  };
};

export const getRecommendedTutors = async (
  params: {
    limit?: number;
    subject_type?: string;
    min_session_rate?: number;
    max_session_rate?: number;
    min_semester_rate?: number;
    max_semester_rate?: number;
    filter_level?: number;
    level_exact_match?: boolean;
    min_rating?: number;
    has_discount?: boolean;
  } = {}
): Promise<TutorProfile[]> => {
  try {
    const response = await apiClient.get<ApiResponse<TutorProfile[]>>(
      "/tutoring/tutors/recommended",
      {
        params,
      }
    );
    return response.data.data;
  } catch (error) {
    return [];
  }
};

export const getTutorApplication = async (
  applicationId: string
): Promise<TutorApplication> => {
  const response = await apiClient.get<ApiResponse<TutorApplication>>(
    `/tutoring/tutors/applications/${applicationId}`
  );
  return response.data.data;
};

export const getPendingTutorApplications = async (): Promise<
  TutorApplication[]
> => {
  const response = await apiClient.get<ApiResponse<TutorApplication[]>>(
    "/tutoring/tutors/applications/pending",
    { params: {} }
  );
  return response.data.data;
};

export const submitTutorApplication = async (data: {
  space_id?: string;
  subject: string;
  session_rate: string;
  semester_rate: string;
  discount: string;
  subject_type: string;
  level?: string;
  experience?: string;
  qualifications?: string;
  teaching_style?: string;
  motivation: string;
  reference_letters?: string;
  availability: string[];
}): Promise<ApplicationStatusResponse> => {
  const response = await apiClient.post<ApiResponse<ApplicationStatusResponse>>(
    "/tutoring/tutors/applications",
    {
      subject: data.subject,
      session_rate: data.session_rate,
      semester_rate: data.semester_rate,
      discount: data.discount,
      subject_type: data.subject_type,
      level: data.level,
      experience: data.experience,
      qualifications: data.qualifications,
      teaching_style: data.teaching_style,
      motivation: data.motivation,
      reference_letters: data.reference_letters,
      availability: data.availability,
    }
  );
  return response.data.data;
};

export const updateTutorApplication = async (
  applicationId: string,
  data: any
): Promise<TutorApplication> => {
  const response = await apiClient.put<ApiResponse<TutorApplication>>(
    `/tutoring/tutors/applications/${applicationId}`,
    data
  );
  return response.data.data;
};

export const getMyTutorApplication =
  async (): Promise<TutorApplication | null> => {
    try {
      const response = await apiClient.get<ApiResponse<TutorApplication>>(
        "/tutoring/tutors/applications/my-services"
      );
      return response.data.data;
    } catch (error: any) {
      return null;
    }
  };

export const checkTutorApplicationExists = async (): Promise<ApplicationStatusResponse | null> => {
  try {
    const response = await apiClient.get<ApiResponse<ApplicationStatusResponse>>(
      "/tutoring/tutors/applications/check"
    );
    return response.data.data;
  } catch (error: any) {
    return null;
  }
};

export const updateTutorPricingAndAvailability = async (
  applicationId: string,
  data: {
    session_rate?: string;
    semester_rate?: string;
    availability: string[];
  }
): Promise<TutorApplication> => {
  const response = await apiClient.patch<ApiResponse<TutorApplication>>(
    `/tutoring/tutors/applications/${applicationId}`,
    data
  );
  return response.data.data;
};

export const deleteTutorApplication = async (
  applicationId: string
): Promise<void> => {
  await apiClient.delete(`/tutoring/tutors/applications/${applicationId}`);
};

export const getTutoringSession = async (
  sessionId: string
): Promise<TutoringSession> => {
  const response = await apiClient.get<ApiResponse<TutoringSession>>(
    `/tutoring/sessions/${sessionId}`
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
  const response = await apiClient.post<ApiResponse<TutoringSession>>(
    "/tutoring/sessions",
    {
      tutor_id: data.tutor_id,
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
  const response = await apiClient.get<ApiResponse<TutoringSession[]>>(
    "/tutoring/sessions",
    { params: {} }
  );
  return response.data.data;
};

export const getAvailableTutoringSessions = async (
  page: number = 1,
  limit: number = 20
): Promise<AvailableTutoringSession[]> => {
  const response = await apiClient.get<ApiResponse<AvailableTutoringSession[]>>(
    "/tutoring/sessions/available",
    { params: { page, limit } }
  );
  return response.data.data;
};

export const updateTutoringSessionStatus = async (
  sessionId: string,
  status: "pending" | "scheduled" | "confirmed" | "completed" | "cancelled"
): Promise<TutoringSession> => {
  const response = await apiClient.put<ApiResponse<TutoringSession>>(
    `/tutoring/sessions/${sessionId}/status`,
    { status }
  );
  return response.data.data;
};

export const updateTutoringSessionMeetingLink = async (
  sessionId: string,
  meetingLink: string
): Promise<TutoringSession> => {
  const response = await apiClient.put<ApiResponse<TutoringSession>>(
    `/tutoring/sessions/${sessionId}/meeting-link`,
    { meeting_link: meetingLink }
  );
  return response.data.data;
};

export const rateTutoringSession = async (
  sessionId: string,
  rating: number,
  feedback?: string
): Promise<void> => {
  await apiClient.post(`/tutoring/sessions/${sessionId}/rate`, {
    rating,
    feedback,
  });
};

export interface PaymentDetails {
  amount: number;
  session_type: "single" | "semester";
  paid_at: string;
  platform_fee: number;
  tutor_amount: number;
  refund_eligible_until: string;
}

export interface TutoringRequest {
  id: string;
  requester_id: string;
  requester_username?: string;
  requester_full_name?: string;
  requester_avatar?: string;
  requester_department?: string;
  requester_level?: string;
  requester_phone?: string;
  space_id: string;
  tutor_id?: string;
  tutor_user_id?: string;
  tutor_username?: string;
  tutor_full_name?: string;
  tutor_phone?: string;
  subject?: string;
  session_rate?: string;
  semester_rate?: string;
  availability?: string[];
  session_status:
    | "pending"
    | "accepted"
    | "ongoing"
    | "completed"
    | "cancelled";
  message?: string;
  requested_at?: string;
  responded_at?: string;
  response_message?: string;
  created_at?: string;
  updated_at?: string;

  schedules?: string[];
  session_type?: "single" | "semester";
  payment_details?: PaymentDetails;
  rating?: number;
  review?: string;
  completed_at?: string;
  expires_at?: string;
  refund_reason?: string;
  refund_explanation?: string;
  refund_requested_at?: string;
  payment_status: "not_paid" | "paid" | "refunded" | "failed";
  paid_at?: string;
  refund_request?: boolean;
}

export interface tutoringRequest {
  id: string;
  tutor_id: string;
  requester_id: string;
  requester_username?: string;
  requester_full_name?: string;
  requester_avatar?: string;
  requester_department?: string;
  requester_level?: string;
  space_id: string;
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
  tutor_id: string;
  message?: string;
  session_type: "single" | "semester";
  schedules?: string[];
}): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    "/tutoring/requests",
    {
      tutor_id: data.tutor_id,
      message: data.message,
      session_type: data.session_type,
      schedules: data.schedules,
    }
  );
  return response.data.data;
};

export const getTutoringRequest = async (
  requestId: string
): Promise<TutoringRequest> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}`
  );
  return response.data.data;
};

export const getSessionTutoringRequests = async (
  sessionId: string
): Promise<TutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    `/tutoring/requests/session/${sessionId}`
  );
  return response.data.data;
};

export const getUserTutoringRequests = async (
  page: number = 1,
  limit: number = 20
): Promise<TutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    "/tutoring/requests/my-requests",
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const getTutorSessionRequests = async (
  page: number = 1,
  limit: number = 20
): Promise<TutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest[]>>(
    "/tutoring/requests/tutor-requests",
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const updateTutoringRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected" | "cancelled",
  responseMessage?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.put<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}`,
    { status, response_message: responseMessage }
  );
  return response.data.data;
};

export const deleteTutoringRequest = async (
  requestId: string
): Promise<void> => {
  await apiClient.delete(`/tutoring/requests/${requestId}`);
};


export const acceptTutoringRequest = async (
  requestId: string,
  responseMessage?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/accept`,
    { response_message: responseMessage }
  );
  return response.data.data;
};

export const declineTutoringRequest = async (
  requestId: string,
  responseMessage?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/decline`,
    { response_message: responseMessage }
  );
  return response.data.data;
};

export const completeTutoringSession = async (
  requestId: string,
  rating?: number,
  review?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/complete`,
    { rating, review }
  );
  return response.data.data;
};

export const requestTutoringRefund = async (
  requestId: string,
  reason: string,
  explanation?: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/payments/${requestId}/refund`,
    {
      reason,
      explanation,
    }
  );
  return response.data.data;
};

export const cancelTutoringRequest = async (
  requestId: string,
  cancelReason: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/cancel`,
    { cancel_reason: cancelReason }
  );
  return response.data.data;
};

export const cancelSessionByTutor = cancelTutoringRequest;

export interface TutorPaymentInfo {
  payment_method?: string;
  mobile_money_network?: string;
  account_number?: string;
  account_updated_at?: string;
  last_paid_at?: string;
}

export interface TutorEarnings {
  total_earnings: string;
  available_for_payout: string;
  total_sessions: number;
  sessions: Array<{
    request_id: string;
    schedules?: string[];
    session_status: string;
    payment_status: string;
    paid_at?: string;
    amount: string;
    currency: string;
    student_username: string;
    student_name: string;
    student_avatar?: string;
  }>;
  payment_info?: TutorPaymentInfo;
}

export const getTutorEarnings = async (
  page: number = 1,
  limit: number = 20
): Promise<TutorEarnings> => {
  const response = await apiClient.get<ApiResponse<TutorEarnings>>(
    "/tutoring/earnings",
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const updateTutorPaymentInfo = async (
  serviceId: string,
  data: {
    payment_method: "mobile_money" | "bank_account";
    mobile_money_network?: string;
    account_number: string;
    account_name: string;
  }
): Promise<void> => {
  await apiClient.put(`/tutoring/services/${serviceId}/payment-info`, data);
};

export interface TutorService {
  id: string;
  subject: string;
  session_rate: number;
  semester_rate: number;
  discount: number;
  subject_type: string;
  level?: string;
  payment_info?: TutorPaymentInfo & { account_name?: string };
  payout_requested_at?: string;
  paid_requests: Array<{
    id: string;
    requester_id: string;
    requester_username?: string;
    requester_full_name?: string;
    requester_avatar?: string;
    session_type?: string;
    session_status?: string;
    payment_status?: string;
    paid_at?: string;
    schedules?: string[];
    amount?: string;
    currency?: string;
  }>;
}

export const getTutorServices = async (): Promise<TutorService[]> => {
  const response = await apiClient.get<ApiResponse<TutorService[]>>(
    "/tutoring/services"
  );
  return response.data.data;
};

export const getTutorServiceDetails = async (
  serviceId: string
): Promise<TutorService> => {
  const response = await apiClient.get<ApiResponse<TutorService>>(
    `/tutoring/services/${serviceId}`
  );
  return response.data.data;
};

export const requestTutorPayout = async (serviceId: string): Promise<void> => {
  await apiClient.post(`/tutoring/services/${serviceId}/request-payout`);
};

export interface InitializeTutoringPaymentResponse {
  authorization_url: string;
  reference: string;
  amount: number;
}

export const initializeTutoringPayment = async (data: {
  request_id: string;
}): Promise<InitializeTutoringPaymentResponse> => {
  const response = await apiClient.post<
    ApiResponse<InitializeTutoringPaymentResponse>
  >("/tutoring/payments/initialize", data);
  return response.data.data;
};

export const verifyTutoringPayment = async (data: {
  reference: string;
}): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    "/tutoring/payments/verify",
    {
      reference: data.reference,
    }
  );
  return response.data.data;
};

export const getTutoringRequestWithPayment = async (
  requestId: string
): Promise<TutoringRequest> => {
  const response = await apiClient.get<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/payment`
  );
  return response.data.data;
};

export const createtutoringRequest = async (data: {
  tutor_id: string;
  message?: string;
}): Promise<tutoringRequest> => {
  const response = await apiClient.post<ApiResponse<tutoringRequest>>(
    "/tutoring/requests",
    {
      tutor_id: data.tutor_id,
      message: data.message,
    }
  );
  return response.data.data;
};

export const gettutoringRequest = async (
  requestId: string
): Promise<tutoringRequest> => {
  const response = await apiClient.get<ApiResponse<tutoringRequest>>(
    `/tutoring/requests/${requestId}`
  );
  return response.data.data;
};

export const getSessiontutoringRequests = async (
  sessionId: string
): Promise<tutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<tutoringRequest[]>>(
    `/tutoring/requests/session/${sessionId}`
  );
  return response.data.data;
};

export const getUsertutoringRequests = async (
  page: number = 1,
  limit: number = 20
): Promise<tutoringRequest[]> => {
  const response = await apiClient.get<ApiResponse<tutoringRequest[]>>(
    "/tutoring/requests/my-requests",
    { params: { limit, offset: (page - 1) * limit } }
  );
  return response.data.data;
};

export const updatetutoringRequestStatus = async (
  requestId: string,
  status: "approved" | "rejected" | "cancelled",
  responseMessage?: string
): Promise<tutoringRequest> => {
  const response = await apiClient.put<ApiResponse<tutoringRequest>>(
    `/tutoring/requests/${requestId}`,
    { status, response_message: responseMessage }
  );
  return response.data.data;
};

export const deletetutoringRequest = async (
  requestId: string
): Promise<void> => {
  await apiClient.delete(`/tutoring/requests/${requestId}`);
};

export interface SessionReview {
  id: string;
  session_type: "tutoring" | "tutoring";
  tutor_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  review_text?: string;
  created_at?: string;
  updated_at?: string;
  reviewer_username?: string;
  reviewer_full_name?: string;
  reviewer_avatar?: string;
}

export interface CreateSessionReviewRequest {
  session_type: "tutoring" | "tutoring";
  session_id: string;
  tutor_id: string;
  reviewee_id: string;
  rating: number;
  review_text?: string;
}

export interface AverageRating {
  average_rating: number;
  review_count: number;
}

export const markTutoringSessionComplete = async (
  requestId: string
): Promise<TutoringRequest> => {
  const response = await apiClient.post<ApiResponse<TutoringRequest>>(
    `/tutoring/requests/${requestId}/complete`
  );
  return response.data.data;
};

export const createSessionReview = async (
  data: CreateSessionReviewRequest
): Promise<SessionReview> => {
  const response = await apiClient.post<ApiResponse<SessionReview>>(
    "/tutoring/reviews",
    data
  );
  return response.data.data;
};

export const getReviewsByReviewee = async (
  revieweeId: string,
  limit: number = 20,
  offset: number = 0
): Promise<SessionReview[]> => {
  const response = await apiClient.get<ApiResponse<SessionReview[]>>(
    `/tutoring/reviews/reviewee/${revieweeId}`,
    { params: { limit, offset } }
  );
  return response.data.data;
};

export const getAverageRating = async (
  revieweeId: string
): Promise<AverageRating> => {
  const response = await apiClient.get<ApiResponse<AverageRating>>(
    `/tutoring/reviews/average/${revieweeId}`
  );
  return response.data.data;
};

export const tutoringApi = {
  searchTutors,
  getTutorProfile,
  getTutorReviews,
  createTutorProfile,
  updateTutorAvailability,
  getRecommendedTutors,
  getTutorApplication,
  getPendingTutorApplications,
  submitTutorApplication,
  updateTutorApplication,
  getTutoringSession,
  createTutoringSession,
  getTutoringSessions,
  getAvailableTutoringSessions,
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
  createtutoringRequest,
  gettutoringRequest,
  getSessiontutoringRequests,
  getUsertutoringRequests,
  updatetutoringRequestStatus,
  deletetutoringRequest,
};

export default tutoringApi;
