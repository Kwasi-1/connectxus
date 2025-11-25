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

export const MockTutoringProvider: React.FC<MockTutoringProviderProps> = ({
  children,
  currentUserId = "current-user-123",
}) => {
  const [requests, setRequests] = useState<TutoringRequest[]>([]);
  const [requestIdCounter, setRequestIdCounter] = useState(1);

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
      id: `req-${requestIdCounter}`,
      session_id: `session-${requestIdCounter}`,
      requester_id: currentUserId,
      requester_username: "student_user",
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
    }
  ): Promise<TutoringRequest> => {
    await delay(1000); // Longer delay to simulate payment processing

    const updatedRequest = requests.find((r) => r.id === requestId);
    if (!updatedRequest) throw new Error("Request not found");

    const refundWindow = paymentData.session_type === "single" ? 7 : 14;
    const refundEligibleUntil = new Date();
    refundEligibleUntil.setDate(refundEligibleUntil.getDate() + refundWindow);

    const payment: PaymentDetails = {
      ...paymentData,
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
