import apiClient from "@/lib/apiClient";

export interface SubmitFeedbackRequest {
  category: "suggestion" | "feature_request" | "complaint" | "general_feedback";
  title: string;
  message: string;
  rating?: number;
  source?: "web" | "mobile";
}

export interface FeedbackResponse {
  id: string;
  user_id: string;
  username?: string;
  full_name?: string;
  email?: string;
  avatar?: string;
  category: string;
  title: string;
  message: string;
  rating?: number;
  source: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const submitFeedback = async (
  data: SubmitFeedbackRequest
): Promise<FeedbackResponse> => {
  const response = await apiClient.post("/feedback", data);
  return response.data.data;
};

export const getMyFeedback = async (
  page: number = 1,
  limit: number = 20
): Promise<{ feedback: FeedbackResponse[]; total: number }> => {
  const response = await apiClient.get("/feedback/my", {
    params: { page, limit },
  });
  return response.data.data;
};
