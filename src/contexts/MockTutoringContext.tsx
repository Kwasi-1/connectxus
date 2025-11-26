import React, { createContext, useContext, useState, ReactNode } from "react";
import { TutoringRequest, PaymentDetails } from "@/api/mentorship.api";

interface MockTutoringContextType {
  requests: TutoringRequest[];
  createRequest: (data: {
    tutor_id: string;
    subject: string;
    topic: string;
    preferred_schedule: string[];
    session_type: "single" | "semester";
  }) => Promise<TutoringRequest>;
  acceptRequest: (requestId: string) => Promise<TutoringRequest>;
  declineRequest: (
    requestId: string,
    reason?: string
  ) => Promise<TutoringRequest>;
  payForSession: (
    requestId: string,
    paymentData: {
      amount: number;
      session_type: "single" | "semester";
      platform_fee: number;
      tutor_amount: number;
      payment_reference?: string;
    }
  ) => Promise<TutoringRequest>;
  completeSession: (
    requestId: string,
    rating: number,
    review?: string
  ) => Promise<TutoringRequest>;
  requestRefund: (
    requestId: string,
    reason: string,
    explanation?: string
  ) => Promise<TutoringRequest>;
  getUserRequests: () => TutoringRequest[];
  getTutorRequests: (tutorId: string) => TutoringRequest[];
}

const MockTutoringContext = createContext<MockTutoringContextType | undefined>(
  undefined
);

export const useMockTutoring = () => {
  const context = useContext(MockTutoringContext);
  if (!context) {
    throw new Error("useMockTutoring must be used within MockTutoringProvider");
  }
  return context;
};

interface MockTutoringProviderProps {
  children: ReactNode;
  currentUserId?: string;
}

// Initial mock data for testing
const createInitialMockData = (currentUserId: string): TutoringRequest[] => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const expiresIn24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const refundEligibleUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return [
    // Pending request (waiting for tutor to accept)
    {
      id: "req-mock-1",
      session_id: "session-mock-1",
      requester_id: currentUserId,
      requester_username: "student_user",
      requester_full_name: "Student User",
      space_id: "space-1",
      tutor_id: "kelvinmhacwilson-user-id", // kelvinmhacwilson as tutor
      tutor_username: "kelvinmhacwilson",
      tutor_full_name: "Kelvin Mhacwilson",
      subject: "DCIT 201",
      topic: "Object-Oriented Programming and Design Patterns",
      preferred_schedule: ["Monday 4pm-6pm", "Wednesday 4pm-6pm"],
      session_type: "single",
      status: "pending",
      created_at: yesterday.toISOString(),
      expires_at: expiresIn24h.toISOString(),
    },
    // Accepted request (ready for payment)
    {
      id: "req-mock-2",
      session_id: "session-mock-2",
      requester_id: currentUserId,
      requester_username: "student_user",
      requester_full_name: "Student User",
      space_id: "space-1",
      tutor_id: "user-tutor-456", // Michael Chen
      tutor_username: "mike_tutor",
      tutor_full_name: "Michael Chen",
      subject: "Calculus I",
      topic: "Integration Techniques and Applications",
      preferred_schedule: ["Tuesday 10am-12pm", "Thursday 10am-12pm"],
      session_type: "semester",
      status: "accepted",
      created_at: twoDaysAgo.toISOString(),
      responded_at: yesterday.toISOString(),
      expires_at: expiresIn24h.toISOString(),
    },
    // Paid request (ready for session)
    {
      id: "req-mock-3",
      session_id: "session-mock-3",
      requester_id: currentUserId,
      requester_username: "student_user",
      requester_full_name: "Student User",
      space_id: "space-1",
      tutor_id: "user-tutor-789", // Emma Williams
      tutor_username: "emma_tutor",
      tutor_full_name: "Emma Williams",
      subject: "Statistics",
      topic: "Hypothesis Testing and Confidence Intervals",
      preferred_schedule: ["Friday 1pm-3pm"],
      session_type: "single",
      status: "paid",
      created_at: threeDaysAgo.toISOString(),
      responded_at: twoDaysAgo.toISOString(),
      payment_details: {
        amount: 28.75,
        session_type: "single",
        platform_fee: 3.75,
        tutor_amount: 25,
        payment_reference: "TUT-1732593872123-a3b4c5",
        paid_at: yesterday.toISOString(),
        refund_eligible_until: refundEligibleUntil.toISOString(),
      },
    },
  ];
};

export const MockTutoringProvider: React.FC<MockTutoringProviderProps> = ({
  children,
  currentUserId = "current-user-123",
}) => {
  const [requests, setRequests] = useState<TutoringRequest[]>(() =>
    createInitialMockData(currentUserId)
  );
  const [requestIdCounter, setRequestIdCounter] = useState(4); // Start from 4 since we have 3 initial requests

  // Simulate async operation
  const delay = (ms: number = 500) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const createRequest = async (data: {
    tutor_id: string;
    subject: string;
    topic: string;
    preferred_schedule: string[];
    session_type: "single" | "semester";
  }): Promise<TutoringRequest> => {
    await delay();

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const newRequest: TutoringRequest = {
      id: `req-mock-${requestIdCounter}`,
      session_id: `session-mock-${requestIdCounter}`,
      requester_id: currentUserId,
      requester_username: "john_student",
      requester_full_name: "John Student",
      space_id: "space-1",
      tutor_id: data.tutor_id,
      tutor_username: "tutor_user",
      tutor_full_name: "Jane Tutor",
      subject: data.subject,
      topic: data.topic,
      preferred_schedule: data.preferred_schedule,
      session_type: data.session_type,
      status: "pending",
      created_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
    };

    setRequestIdCounter((prev) => prev + 1);
    setRequests((prev) => [...prev, newRequest]);

    return newRequest;
  };

  const acceptRequest = async (requestId: string): Promise<TutoringRequest> => {
    await delay();

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const updated: TutoringRequest = {
      ...updatedRequest,
      status: "accepted",
      responded_at: new Date().toISOString(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    return updated;
  };

  const declineRequest = async (
    requestId: string,
    reason?: string
  ): Promise<TutoringRequest> => {
    await delay();

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const updated: TutoringRequest = {
      ...updatedRequest,
      status: "declined",
      response_message: reason,
      responded_at: new Date().toISOString(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    return updated;
  };

  const payForSession = async (
    requestId: string,
    paymentData: {
      amount: number;
      session_type: "single" | "semester";
      platform_fee: number;
      tutor_amount: number;
      payment_reference?: string;
    }
  ): Promise<TutoringRequest> => {
    await delay(1000); // Longer delay to simulate payment processing

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const refundWindow = paymentData.session_type === "single" ? 7 : 14;
    const refundEligibleUntil = new Date();
    refundEligibleUntil.setDate(refundEligibleUntil.getDate() + refundWindow);

    const payment: PaymentDetails = {
      amount: paymentData.amount,
      session_type: paymentData.session_type,
      platform_fee: paymentData.platform_fee,
      tutor_amount: paymentData.tutor_amount,
      payment_reference: paymentData.payment_reference,
      paid_at: new Date().toISOString(),
      refund_eligible_until: refundEligibleUntil.toISOString(),
    };

    const updated: TutoringRequest = {
      ...updatedRequest,
      status: "paid",
      payment_details: payment,
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    return updated;
  };

  const completeSession = async (
    requestId: string,
    rating: number,
    review?: string
  ): Promise<TutoringRequest> => {
    await delay();

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const updated: TutoringRequest = {
      ...updatedRequest,
      status: "completed",
      rating,
      review,
      completed_at: new Date().toISOString(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    return updated;
  };

  const requestRefund = async (
    requestId: string,
    reason: string,
    explanation?: string
  ): Promise<TutoringRequest> => {
    await delay();

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const updated: TutoringRequest = {
      ...updatedRequest,
      status: "refund_pending",
      refund_reason: reason,
      refund_explanation: explanation,
      refund_requested_at: new Date().toISOString(),
    };

    setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));

    return updated;
  };

  const getUserRequests = () => {
    return requests.filter((r) => r.requester_id === currentUserId);
  };

  const getTutorRequests = (tutorId: string) => {
    return requests.filter((r) => r.tutor_id === tutorId);
  };

  const value: MockTutoringContextType = {
    requests,
    createRequest,
    acceptRequest,
    declineRequest,
    payForSession,
    completeSession,
    requestRefund,
    getUserRequests,
    getTutorRequests,
  };

  return (
    <MockTutoringContext.Provider value={value}>
      {children}
    </MockTutoringContext.Provider>
  );
};
