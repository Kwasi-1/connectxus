import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Search, BookOpen, Filter, X, Pencil, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TutorCard } from "@/components/tutoring/TutorCard";
import { TutorApplicationCard } from "@/components/tutoring/TutorApplicationCard";
import { TutoringRequestCard } from "@/components/tutoring/TutoringRequestCard";
import { RequestTutoringModal } from "@/components/tutoring/RequestTutoringModal";
import { PaymentModal } from "@/components/tutoring/PaymentModal";
import { SessionCompletionModal } from "@/components/tutoring/SessionCompletionModal";
import { RefundRequestModal } from "@/components/tutoring/RefundRequestModal";
import { ReviewSessionModal } from "@/components/tutoring/ReviewSessionModal";
import { MonetizationTab } from "@/components/tutoring/MonetizationTab";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  TutorProfile as ApiTutorProfile,
  TutoringRequest,
  getRecommendedTutors,
  checkTutorApplicationExists,
  getUserTutoringRequests,
  getTutorSessionRequests,
  getTutorServices,
  createTutoringRequest,
  acceptTutoringRequest,
  declineTutoringRequest,
  verifyTutoringPayment,
  completeTutoringSession,
  requestTutoringRefund,
  cancelSessionByTutor,
  cancelTutoringRequest,
  markTutoringSessionComplete,
  createSessionReview,
  deleteTutorApplication,
  getMyTutorApplications,
} from "@/api/tutoring.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { toast as sonnerToast } from "sonner";

interface ExtendedTutorProfile extends ApiTutorProfile {
  full_name?: string;
  username?: string;
  avatar?: string;
  average_rating?: number;
  review_count?: number;
}

interface TutorFilters {
  subjectType: string;
  minSessionRate: number;
  maxSessionRate: number;
  minSemesterRate: number;
  maxSemesterRate: number;
  level: string;
  levelAndBelow: boolean;
  minRating: number;
  hasDiscount: boolean;
}

const ITEMS_PER_PAGE = 20;
const MAX_SESSION_RATE = 10000;
const MAX_SEMESTER_RATE = 100000;

const TutoringContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [requestsFilter, setRequestsFilter] = useState<
    "all" | "sent" | "received"
  >("all");

  const [pendingFilters, setPendingFilters] = useState<TutorFilters>({
    subjectType: "all",
    minSessionRate: 0,
    maxSessionRate: MAX_SESSION_RATE,
    minSemesterRate: 0,
    maxSemesterRate: MAX_SEMESTER_RATE,
    level: "all",
    levelAndBelow: false,
    minRating: 0,
    hasDiscount: false,
  });

  const [appliedFilters, setAppliedFilters] = useState<TutorFilters>({
    subjectType: "all",
    minSessionRate: 0,
    maxSessionRate: MAX_SESSION_RATE,
    minSemesterRate: 0,
    maxSemesterRate: MAX_SEMESTER_RATE,
    level: "all",
    levelAndBelow: false,
    minRating: 0,
    hasDiscount: false,
  });

  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<ApiTutorProfile | null>(
    null,
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<TutoringRequest | null>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [deleteServiceModalOpen, setDeleteServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("available");

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { data: applicationStatus, isLoading: loadingApplicationStatus } =
    useQuery({
      queryKey: ["tutor-application-status"],
      queryFn: () => checkTutorApplicationExists(),
      staleTime: 60000,
      retry: false,
    });

  const hasApplication = !!applicationStatus;
  const isApprovedTutor = applicationStatus?.status === "approved";
  const isPendingTutor = applicationStatus?.status === "pending";
  const isRejectedTutor = applicationStatus?.status === "rejected";

  const {
    data: sentRequestsData,
    isLoading: loadingSentRequests,
    isFetchingNextPage: isFetchingNextSentRequests,
    hasNextPage: hasNextSentRequestsPage,
    fetchNextPage: fetchNextSentRequestsPage,
  } = useInfiniteQuery({
    queryKey: ["user-tutoring-requests-infinite"],
    queryFn: ({ pageParam = 1 }) =>
      getUserTutoringRequests(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "requests" && !!user,
    staleTime: 60000,
  });

  const sentRequests = sentRequestsData?.pages.flatMap((page) => page) || [];

  const { loadMoreRef: loadMoreSentRequestsRef } = useInfiniteScroll({
    loading: isFetchingNextSentRequests,
    hasMore: hasNextSentRequestsPage || false,
    onLoadMore: fetchNextSentRequestsPage,
  });

  const {
    data: receivedRequestsData,
    isLoading: loadingReceivedRequests,
    isFetchingNextPage: isFetchingNextReceivedRequests,
    hasNextPage: hasNextReceivedRequestsPage,
    fetchNextPage: fetchNextReceivedRequestsPage,
  } = useInfiniteQuery({
    queryKey: ["tutor-session-requests-infinite"],
    queryFn: ({ pageParam = 1 }) =>
      getTutorSessionRequests(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled:
      activeTab === "requests" &&
      applicationStatus?.status === "approved" &&
      !!user,
    staleTime: 60000,
  });

  const receivedRequests =
    receivedRequestsData?.pages.flatMap((page) => page) || [];

  const { loadMoreRef: loadMoreReceivedRequestsRef } = useInfiniteScroll({
    loading: isFetchingNextReceivedRequests,
    hasMore: hasNextReceivedRequestsPage || false,
    onLoadMore: fetchNextReceivedRequestsPage,
  });

  const {
    data: tutorServicesData,
    isLoading: loadingTutorServices,
    isFetchingNextPage: isFetchingNextTutorServices,
    hasNextPage: hasNextTutorServicesPage,
    fetchNextPage: fetchNextTutorServicesPage,
  } = useInfiniteQuery({
    queryKey: ["tutor-services-infinite"],
    queryFn: ({ pageParam = 1 }) => getMyTutorApplications(),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "services" && !!user,
    staleTime: 60000,
  });

  const tutorServices = tutorServicesData?.pages.flatMap((page) => page) || [];

  const { loadMoreRef: loadMoreTutorServicesRef } = useInfiniteScroll({
    loading: isFetchingNextTutorServices,
    hasMore: hasNextTutorServicesPage || false,
    onLoadMore: fetchNextTutorServicesPage,
  });

  const requestsLoading = loadingSentRequests || loadingReceivedRequests;

  const filteredRequests = useMemo(() => {
    if (requestsFilter === "sent") {
      return sentRequests;
    } else if (requestsFilter === "received") {
      return receivedRequests;
    } else {
      return [...sentRequests, ...receivedRequests];
    }
  }, [requestsFilter, sentRequests, receivedRequests]);

  const tutorQueryParams = useMemo(() => {
    const params: any = {
      limit: ITEMS_PER_PAGE,
    };

    if (appliedFilters.subjectType !== "all") {
      params.subject_type = appliedFilters.subjectType;
    }
    if (
      appliedFilters.minSessionRate !== 0 ||
      appliedFilters.maxSessionRate !== MAX_SESSION_RATE
    ) {
      params.min_session_rate = appliedFilters.minSessionRate;
      params.max_session_rate = appliedFilters.maxSessionRate;
    }
    if (
      appliedFilters.minSemesterRate !== 0 ||
      appliedFilters.maxSemesterRate !== MAX_SEMESTER_RATE
    ) {
      params.min_semester_rate = appliedFilters.minSemesterRate;
      params.max_semester_rate = appliedFilters.maxSemesterRate;
    }
    if (appliedFilters.level !== "all") {
      params.filter_level = parseInt(appliedFilters.level);
      if (!appliedFilters.levelAndBelow) {
        params.level_exact_match = true;
      }
    }
    if (appliedFilters.minRating !== 0) {
      params.min_rating = appliedFilters.minRating;
    }
    if (appliedFilters.hasDiscount) {
      params.has_discount = true;
    }

    return params;
  }, [appliedFilters]);

  const {
    data: recommendedTutorsData,
    isLoading: loadingRecommendedTutors,
    isFetchingNextPage: isFetchingNextRecommendedTutors,
    hasNextPage: hasNextRecommendedTutorsPage,
    fetchNextPage: fetchNextRecommendedTutorsPage,
  } = useInfiniteQuery({
    queryKey: ["recommended-tutors-infinite", tutorQueryParams],
    queryFn: ({ pageParam = 1 }) =>
      getRecommendedTutors({ ...tutorQueryParams, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: activeTab === "available" && !!user,
    staleTime: 60000,
  });

  const recommendedTutors =
    recommendedTutorsData?.pages.flatMap((page) => page) || [];

  const { loadMoreRef: loadMoreRecommendedTutorsRef } = useInfiniteScroll({
    loading: isFetchingNextRecommendedTutors,
    hasMore: hasNextRecommendedTutorsPage || false,
    onLoadMore: fetchNextRecommendedTutorsPage,
  });

  const filteredTutors = useMemo(() => {
    return recommendedTutors.filter((tutor) => {
      if (isApprovedTutor && tutor.applicant_id === user?.id) {
        return false;
      }

      if (!debouncedSearchQuery) return true;

      const searchLower = debouncedSearchQuery.toLowerCase();
      const userName = tutor.full_name || tutor.username || "";
      const tutorSubject = tutor.subject || "";
      const tutorBio = tutor.bio || "";
      const tutorExperience = tutor.experience || "";
      const tutorQualifications = tutor.qualifications || "";

      return (
        userName.toLowerCase().includes(searchLower) ||
        tutorSubject.toLowerCase().includes(searchLower) ||
        tutorBio.toLowerCase().includes(searchLower) ||
        tutorExperience.toLowerCase().includes(searchLower) ||
        tutorQualifications.toLowerCase().includes(searchLower)
      );
    });
  }, [recommendedTutors, debouncedSearchQuery, user, isApprovedTutor]);

  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      subjectType: "all",
      minSessionRate: 0,
      maxSessionRate: MAX_SESSION_RATE,
      minSemesterRate: 0,
      maxSemesterRate: MAX_SEMESTER_RATE,
      level: "all",
      levelAndBelow: false,
      minRating: 0,
      hasDiscount: false,
    };
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
  };

  const hasActiveFilters =
    appliedFilters.subjectType !== "all" ||
    appliedFilters.level !== "all" ||
    appliedFilters.minSessionRate !== 0 ||
    appliedFilters.maxSessionRate !== MAX_SESSION_RATE ||
    appliedFilters.minSemesterRate !== 0 ||
    appliedFilters.maxSemesterRate !== MAX_SEMESTER_RATE ||
    appliedFilters.minRating !== 0 ||
    appliedFilters.hasDiscount ||
    searchQuery !== "";

  const createRequestMutation = useMutation({
    mutationFn: (data: {
      tutor_id: string;
      message?: string;
      session_type: "single" | "semester";
    }) => createTutoringRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      sonnerToast.success("Tutoring request sent successfully!");
      setRequestModalOpen(false);
      setSelectedTutor(null);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to send request",
      );
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      message,
    }: {
      requestId: string;
      message?: string;
    }) => acceptTutoringRequest(requestId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-session-requests-infinite"],
      });
      sonnerToast.success("Request accepted!");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to accept request",
      );
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      message,
    }: {
      requestId: string;
      message?: string;
    }) => declineTutoringRequest(requestId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-session-requests-infinite"],
      });
      sonnerToast.success("Request declined");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to decline request",
      );
    },
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: (data: {
      request_id: string;
      reference: string;
      amount: string;
    }) => verifyTutoringPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["tutor-session-requests-infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-services-infinite"] });
      sonnerToast.success("Payment verified! Session is now active.");
      setPaymentModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Payment verification failed",
      );
    },
  });

  const completeSessionMutation = useMutation({
    mutationFn: ({
      requestId,
      rating,
      review,
    }: {
      requestId: string;
      rating?: number;
      review?: string;
    }) => completeTutoringSession(requestId, rating, review),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-services-infinite"] });
      sonnerToast.success("Session marked as complete!");
      setCompletionModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to complete session",
      );
    },
  });

  const refundRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      reason,
      explanation,
    }: {
      requestId: string;
      reason: string;
      explanation?: string;
    }) => requestTutoringRefund(requestId, reason, explanation),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-services-infinite"] });
      sonnerToast.success("Refund request submitted");
      setRefundModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to request refund",
      );
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => cancelSessionByTutor(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-session-requests-infinite"],
      });
      sonnerToast.success("Session cancelled. Refund will be processed.");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to cancel session",
      );
    },
  });

  const cancelRequestMutation = useMutation({
    mutationFn: ({
      requestId,
      reason,
    }: {
      requestId: string;
      reason: string;
    }) => cancelTutoringRequest(requestId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      sonnerToast.success("Request cancelled successfully");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to cancel request",
      );
    },
  });

  const markCompleteMutation = useMutation({
    mutationFn: (requestId: string) => markTutoringSessionComplete(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-session-requests-infinite"],
      });
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-services-infinite"] });
      sonnerToast.success("Session marked as complete");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to mark session complete",
      );
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: ({
      sessionId,
      tutorId,
      revieweeId,
      rating,
      reviewText,
    }: {
      sessionId: string;
      tutorId: string;
      revieweeId: string;
      rating: number;
      reviewText: string;
    }) =>
      createSessionReview({
        session_type: "tutoring",
        session_id: sessionId,
        tutor_id: tutorId,
        reviewee_id: revieweeId,
        rating,
        review_text: reviewText || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-tutoring-requests-infinite"],
      });
      queryClient.invalidateQueries({ queryKey: ["user-services-infinite"] });
      setReviewModalOpen(false);
      setSelectedRequest(null);
      sonnerToast.success("Review submitted successfully");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to submit review",
      );
    },
  });

  const messageTutorMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateDirectConversation(userId),
    onSuccess: (response) => {
      navigate(`/messages/${response.conversation_id}`);
    },
    onError: (error) => {
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to start conversation";
      sonnerToast.error(message);
    },
  });

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
    },
    onSuccess: (_, userId) => {
      sonnerToast.success("Successfully followed tutor");
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
    onError: (error, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to follow tutor";
      sonnerToast.error(message);
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
    },
    onSuccess: (_, userId) => {
      sonnerToast.success("Successfully unfollowed tutor");
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
    onError: (error, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
      const message =
        error &&
        typeof error === "object" &&
        "response" in error &&
        error.response &&
        typeof error.response === "object" &&
        "data" in error.response &&
        error.response.data &&
        typeof error.response.data === "object" &&
        "message" in error.response.data
          ? String(error.response.data.message)
          : "Failed to unfollow tutor";
      sonnerToast.error(message);
    },
  });

  const checkFollowStatus = async (userId: string) => {
    try {
      const status = await checkFollowingStatus(userId);
      setFollowingStatus((prev) => ({ ...prev, [userId]: status }));
    } catch (error) {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    filteredTutors.forEach((tutor) => {
      if (tutor.user_id && followingStatus[tutor.user_id] === undefined) {
        checkFollowStatus(tutor.user_id);
      }
    });
  }, [filteredTutors, followingStatus]);

  const handleRequestTutoring = (tutor: ApiTutorProfile) => {
    setSelectedTutor(tutor);
    setRequestModalOpen(true);
  };

  const handleSubmitRequest = (data: {
    message: string;
    schedules: string[];
    sessionType: "single" | "semester";
  }) => {
    if (!selectedTutor?.id) return;

    const schedulesISO = data.schedules.map((schedule) => {
      return schedule;
    });

    createRequestMutation.mutate({
      tutor_id: selectedTutor.id,
      message: data.message,
      session_type: data.sessionType,
      schedules: schedulesISO,
    });
  };

  const handleContactTutor = (tutor: ApiTutorProfile) => {
    if (!tutor.user_id) {
      sonnerToast.error("Unable to message this tutor");
      return;
    }
    messageTutorMutation.mutate(tutor.user_id);
  };

  const handleBecomeTutor = () => {
    navigate("/tutoring/become-tutor");
  };

  const handleFollowTutor = async (tutor: ApiTutorProfile) => {
    if (!tutor.user_id) {
      sonnerToast.error("Unable to follow this tutor");
      return;
    }

    const isFollowing = followingStatus[tutor.user_id];
    if (isFollowing) {
      unfollowMutation.mutate(tutor.user_id);
    } else {
      followMutation.mutate(tutor.user_id);
    }
  };

  const handleEditService = (applicantId: string) => {
    navigate("/tutoring/become-tutor", {
      state: { applicationId: applicantId },
    });
  };

  const handleDeleteServiceClick = (applicantId: string) => {
    setSelectedService(applicantId);
    setDeleteServiceModalOpen(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!selectedService) return;

    try {
      await deleteTutorApplication(selectedService);
      queryClient.invalidateQueries({ queryKey: ["tutor-services-infinite"] });
      queryClient.invalidateQueries({ queryKey: ["tutor-application-status"] });
      sonnerToast.success("Service deleted successfully");
      setDeleteServiceModalOpen(false);
      setSelectedService(null);
    } catch (error: any) {
      console.error("Error deleting service:", error);
      sonnerToast.error("Failed to delete service", {
        description:
          error.response?.data?.error?.message ||
          error.message ||
          "Please try again later.",
      });
    }
  };

  const handleAcceptRequest = (requestId: string, message?: string) => {
    acceptRequestMutation.mutate({ requestId, message });
  };

  const handleDeclineRequest = (requestId: string, message?: string) => {
    declineRequestMutation.mutate({ requestId, message });
  };

  const handleMessageStudent = (request: TutoringRequest) => {
    if (!request.requester_id) {
      sonnerToast.error("Unable to message this student");
      return;
    }
    messageTutorMutation.mutate(request.requester_id);
  };

  const handleCallStudent = (request: TutoringRequest) => {
    sonnerToast.info("Call functionality coming soon");
  };

  const handleCancelSession = (requestId: string, reason: string) => {
    cancelSessionMutation.mutate({ requestId, reason });
  };

  const handleProceedToPayment = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setPaymentModalOpen(true);
  };

  const handlePayment = (
    sessionType: "single" | "semester",
    reference: string,
  ) => {
    if (!selectedRequest) return;
    const tutor = recommendedTutors.find(
      (t) => t.user_id === selectedRequest.tutor_id,
    );
    const hourlyRate = tutor?.hourly_rate || 25;
    const baseAmount =
      sessionType === "single" ? hourlyRate : hourlyRate * 12 * 0.85;
    const platformFee = baseAmount * 0.15;
    const total = baseAmount + platformFee;

    verifyPaymentMutation.mutate({
      request_id: selectedRequest.id,
      reference,
      amount: total.toString(),
    });
  };

  const handleMessageTutor = (request: TutoringRequest) => {
    if (!request.tutor_id) {
      sonnerToast.error("Unable to message this tutor");
      return;
    }
    messageTutorMutation.mutate(request.tutor_id);
  };

  const handleMarkComplete = (request: TutoringRequest) => {
    markCompleteMutation.mutate(request.id);
  };

  const handleSubmitCompletion = (rating: number, review?: string) => {
    if (!selectedRequest) return;

    completeSessionMutation.mutate({
      requestId: selectedRequest.id,
      rating,
      review,
    });
  };

  const handleReportIssue = (reason: string) => {
    sonnerToast.info(
      "Issue reported. Our support team will contact you within 48 hours.",
    );
    setCompletionModalOpen(false);
    setSelectedRequest(null);
  };

  const handleRequestRefund = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = (reason: string, explanation?: string) => {
    if (!selectedRequest) return;

    refundRequestMutation.mutate({
      requestId: selectedRequest.id,
      reason,
      explanation,
    });
  };

  const handleCancelRequest = (requestId: string, reason: string) => {
    cancelRequestMutation.mutate({ requestId, reason });
  };

  const handlePay = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setPaymentModalOpen(true);
  };

  const handleRequestAgain = (request: TutoringRequest) => {
    if (!request.tutor_id || !request.tutor_id) {
      sonnerToast.error("Unable to create request. Missing tutor information.");
      return;
    }

    const tutorFromRequest: ApiTutorProfile = {
      id: request.tutor_id,
      user_id: request.tutor_id,
      subject: request.subject || "",
      session_rate: request.session_rate
        ? parseFloat(request.session_rate)
        : undefined,
      semester_rate: request.semester_rate
        ? parseFloat(request.semester_rate)
        : undefined,
      availability: request.availability || [],
      applicant_id: request.tutor_id,
      space_id: request.space_id,
      status: "approved",
    };

    setSelectedTutor(tutorFromRequest);
    setRequestModalOpen(true);
  };

  const handleRate = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setReviewModalOpen(true);
  };

  const handleSubmitReview = (rating: number, reviewText: string) => {
    if (!selectedRequest || !selectedRequest.tutor_user_id) return;

    createReviewMutation.mutate({
      sessionId: selectedRequest.id,
      tutorId: selectedRequest.tutor_user_id,
      revieweeId: selectedRequest.tutor_user_id,
      rating,
      reviewText,
    });
  };

  const showServicesTab = isApprovedTutor;
  const showMonetizationTab = isApprovedTutor;

  const tabCount =
    2 + (showServicesTab ? 1 : 0) + (showMonetizationTab ? 1 : 0);

  return (
    <AppLayout showRightSidebar={false}>
      <div className="px-4 md:px-6 py-6 space-y-6 custom-fonts">
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tutoring</h1>
            <p className="text-muted-foreground mt-1">
              Find tutors to help with your studies
            </p>
          </div>
          {isPendingTutor ? (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                <span className="hidden md:block">Application</span> Pending
              </Badge>
            </div>
          ) : isRejectedTutor ? (
            <Button variant="outline" onClick={handleBecomeTutor}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:block ml-2">Reapply as Tutor</span>
            </Button>
          ) : (
            <Button variant="outline" onClick={handleBecomeTutor}>
              <BookOpen className="h-4 w-4" />
              <span className="hidden md:block ml-2">
                {isApprovedTutor ? "Add Another Service" : "Become a Tutor"}
              </span>
            </Button>
          )}
        </div>

        <Tabs
          defaultValue="available"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className={`grid w-full grid-cols-${tabCount}`}>
            <TabsTrigger value="available">Available Tutors</TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({filteredRequests.length})
            </TabsTrigger>
            {showServicesTab && (
              <TabsTrigger value="services">My Services</TabsTrigger>
            )}
            {showMonetizationTab && (
              <TabsTrigger value="monetization">Monetization</TabsTrigger>
            )}
          </TabsList>

          {/* Available Tutors Tab */}
          <TabsContent value="available" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, subject, bio, experience..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10 rounded-full"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Button
                variant="outline"
                className="relative"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                    !
                  </span>
                )}
              </Button>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => setSearchQuery("")}
                    />
                  </Badge>
                )}
                {appliedFilters.subjectType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Subject: {appliedFilters.subjectType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          subjectType: "all",
                        }))
                      }
                    />
                  </Badge>
                )}
                {appliedFilters.level !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Level: {appliedFilters.level}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          level: "all",
                        }))
                      }
                    />
                  </Badge>
                )}
                {appliedFilters.minRating !== 0 && (
                  <Badge variant="secondary" className="gap-1">
                    Rating: {appliedFilters.minRating}+ ⭐
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          minRating: 0,
                        }))
                      }
                    />
                  </Badge>
                )}
                {(appliedFilters.minSessionRate !== 0 ||
                  appliedFilters.maxSessionRate !== MAX_SESSION_RATE) && (
                  <Badge variant="secondary" className="gap-1">
                    Session: GHS {appliedFilters.minSessionRate} - GHS{" "}
                    {appliedFilters.maxSessionRate}/hr
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          minSessionRate: 0,
                          maxSessionRate: MAX_SESSION_RATE,
                        }))
                      }
                    />
                  </Badge>
                )}
                {(appliedFilters.minSemesterRate !== 0 ||
                  appliedFilters.maxSemesterRate !== MAX_SEMESTER_RATE) && (
                  <Badge variant="secondary" className="gap-1">
                    Semester: GHS {appliedFilters.minSemesterRate} - GHS{" "}
                    {appliedFilters.maxSemesterRate}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          minSemesterRate: 0,
                          maxSemesterRate: MAX_SEMESTER_RATE,
                        }))
                      }
                    />
                  </Badge>
                )}
                {appliedFilters.hasDiscount && (
                  <Badge variant="secondary" className="gap-1">
                    With Discount
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          hasDiscount: false,
                        }))
                      }
                    />
                  </Badge>
                )}
              </div>
            )}

            {loadingRecommendedTutors ? (
              <LoadingSpinner size="md" />
            ) : filteredTutors.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No tutors found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Check back later for new tutors"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredTutors.map((tutor) => {
                    const isFollowing = followingStatus[tutor.user_id || ""];
                    return (
                      <TutorCard
                        key={tutor.id}
                        tutor={{
                          ...tutor,
                          rating: tutor.average_rating,
                        }}
                        isFollowing={isFollowing}
                        onContact={() => handleContactTutor(tutor)}
                        onFollow={() => handleFollowTutor(tutor)}
                        onRequestTutoring={() => handleRequestTutoring(tutor)}
                        showRequestButton={true}
                        isContactLoading={messageTutorMutation.isPending}
                        isFollowLoading={
                          followMutation.isPending || unfollowMutation.isPending
                        }
                      />
                    );
                  })}
                </div>

                {hasNextRecommendedTutorsPage && (
                  <div
                    ref={loadMoreRecommendedTutorsRef}
                    className="py-4 text-center"
                  >
                    {isFetchingNextRecommendedTutors && (
                      <LoadingSpinner size="sm" />
                    )}
                  </div>
                )}

                {!hasNextRecommendedTutorsPage && filteredTutors.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-4">
            {/* Filter for requests (Sent, Received, All) */}
            {isApprovedTutor && (
              <div className="flex gap-2">
                <Select
                  value={requestsFilter}
                  onValueChange={(value) =>
                    setRequestsFilter(value as "all" | "sent" | "received")
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter requests" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Requests</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {requestsLoading ? (
              <LoadingSpinner size="md" />
            ) : filteredRequests.length > 0 ? (
              <>
                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    const isSentRequest = request.requester_id === user?.id;
                    const viewMode = isSentRequest ? "student" : "tutor";

                    return (
                      <TutoringRequestCard
                        key={request.id}
                        request={request}
                        onAccept={handleAcceptRequest}
                        onDecline={handleDeclineRequest}
                        onMessage={
                          isSentRequest
                            ? handleMessageTutor
                            : handleMessageStudent
                        }
                        onCall={handleCallStudent}
                        onCancel={handleCancelSession}
                        onComplete={handleMarkComplete}
                        onPay={handlePay}
                        onRequestRefund={handleRequestRefund}
                        onCancelRequest={handleCancelRequest}
                        onRate={handleRate}
                        onRequestAgain={handleRequestAgain}
                        showActions={true}
                        viewMode={viewMode}
                      />
                    );
                  })}
                </div>

                {/* Infinite scroll triggers based on filter */}
                {requestsFilter === "sent" || requestsFilter === "all"
                  ? hasNextSentRequestsPage && (
                      <div
                        ref={loadMoreSentRequestsRef}
                        className="flex justify-center py-8"
                      >
                        {isFetchingNextSentRequests && (
                          <LoadingSpinner size="md" />
                        )}
                      </div>
                    )
                  : null}

                {requestsFilter === "received" || requestsFilter === "all"
                  ? hasNextReceivedRequestsPage && (
                      <div
                        ref={loadMoreReceivedRequestsRef}
                        className="flex justify-center py-8"
                      >
                        {isFetchingNextReceivedRequests && (
                          <LoadingSpinner size="md" />
                        )}
                      </div>
                    )
                  : null}
              </>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No tutoring requests
                </h3>
                <p className="text-muted-foreground">
                  {isApprovedTutor
                    ? "Your requests will appear here"
                    : "Request tutoring from a tutor to get started"}
                </p>
              </div>
            )}
          </TabsContent>

          {/* My Services Tab (only for approved tutors) */}
          {showServicesTab && (
            <TabsContent value="services" className="space-y-4">
              {loadingTutorServices ? (
                <LoadingSpinner size="md" />
              ) : tutorServices.length > 0 ? (
                <>
                  <div className="space-y-4">
                    {tutorServices.map((service) => (
                      <div
                        key={service.id}
                        className="bg-card border rounded-lg p-6 space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {service.subject} 
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {service.subject_type} • Level {service.level}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p>{service.status}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditService(service.id)}
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteServiceClick(service.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Session Rate
                            </p>
                            <p className="text-lg font-semibold">
                              GHS {service.session_rate}/hr
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Semester Rate
                            </p>
                            <p className="text-lg font-semibold">
                              GHS {service.semester_rate}
                            </p>
                          </div>
                        </div>

                        {service.discount > 0 && (
                          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-3">
                            <p className="text-sm text-green-700 dark:text-green-400">
                              {service.discount}% discount on semester bookings
                            </p>
                          </div>
                        )}

                        {service.paid_requests &&
                          service.paid_requests.length > 0 && (
                            <div className="border-t pt-4">
                              <p className="text-sm font-medium mb-2">
                                Active Students: {service.paid_requests.length}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {service.paid_requests
                                  .slice(0, 5)
                                  .map((req) => (
                                    <Badge key={req.id} variant="outline">
                                      {req.requester_full_name ||
                                        req.requester_username ||
                                        "Student"}
                                    </Badge>
                                  ))}
                                {service.paid_requests.length > 5 && (
                                  <Badge variant="outline">
                                    +{service.paid_requests.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}

                          <div>
                            <p>Availability</p>
                            <p>{service.availability}</p>
                          </div>
                      </div>
                    ))}

                    {/* Infinite Scroll Trigger */}
                    {hasNextTutorServicesPage && (
                      <div
                        ref={loadMoreTutorServicesRef}
                        className="flex justify-center py-8"
                      >
                        {isFetchingNextTutorServices && (
                          <LoadingSpinner size="md" />
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    No tutoring services yet
                  </h3>
                  <p className="text-muted-foreground">
                    Your tutoring services will appear here
                  </p>
                </div>
              )}
            </TabsContent>
          )}


          {/* Monetization Tab (only for approved tutors) */}
          {showMonetizationTab && (
            <TabsContent value="monetization">
              <MonetizationTab />
            </TabsContent>
          )}
        </Tabs>
      </div>

      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Tutors</SheetTitle>
            <SheetDescription>
              Refine your search with these filters
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-2">
              <Label>Subject / Course</Label>
              <Select
                value={pendingFilters.subjectType}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({ ...prev, subjectType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="course">Course</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={pendingFilters.level}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="My Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">My Level (default)</SelectItem>
                  <SelectItem value="100">Level 100</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                  <SelectItem value="500">Level 500</SelectItem>
                  <SelectItem value="600">Level 600</SelectItem>
                  <SelectItem value="700">Level 700</SelectItem>
                  <SelectItem value="800">Level 800</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {pendingFilters.level !== "all" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="levelAndBelow"
                  checked={pendingFilters.levelAndBelow}
                  onChange={(e) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      levelAndBelow: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="levelAndBelow" className="cursor-pointer">
                  And Below
                </Label>
              </div>
            )}

            <div className="space-y-2">
              <Label>Minimum Rating</Label>
              <Select
                value={pendingFilters.minRating.toString()}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    minRating: parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="1">⭐ 1+ Stars</SelectItem>
                  <SelectItem value="2">⭐⭐ 2+ Stars</SelectItem>
                  <SelectItem value="3">⭐⭐⭐ 3+ Stars</SelectItem>
                  <SelectItem value="4">⭐⭐⭐⭐ 4+ Stars</SelectItem>
                  <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>
                Session Rate (GHS {pendingFilters.minSessionRate} - GHS{" "}
                {pendingFilters.maxSessionRate}/hr)
              </Label>
              <Slider
                min={0}
                max={MAX_SESSION_RATE}
                step={5}
                value={[
                  pendingFilters.minSessionRate,
                  pendingFilters.maxSessionRate,
                ]}
                onValueChange={([min, max]) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    minSessionRate: min,
                    maxSessionRate: max,
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="space-y-3">
              <Label>
                Semester Rate (GHS {pendingFilters.minSemesterRate} - GHS{" "}
                {pendingFilters.maxSemesterRate})
              </Label>
              <Slider
                min={0}
                max={MAX_SEMESTER_RATE}
                step={50}
                value={[
                  pendingFilters.minSemesterRate,
                  pendingFilters.maxSemesterRate,
                ]}
                onValueChange={([min, max]) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    minSemesterRate: min,
                    maxSemesterRate: max,
                  }))
                }
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="hasDiscount"
                checked={pendingFilters.hasDiscount}
                onChange={(e) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    hasDiscount: e.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="hasDiscount" className="cursor-pointer">
                Only show tutors with semester discounts
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button onClick={applyFilters} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {selectedTutor && (
        <RequestTutoringModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          tutor={selectedTutor}
          onSubmit={handleSubmitRequest}
          isLoading={createRequestMutation.isPending}
        />
      )}

      {selectedRequest && (
        <>
          <PaymentModal
            open={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            request={selectedRequest}
            tutorName={
              selectedRequest.tutor_full_name ||
              selectedRequest.tutor_username ||
              "Tutor"
            }
            hourlyRate={
              selectedRequest.session_rate
                ? Number(selectedRequest.session_rate)
                : Number(selectedRequest.semester_rate)
            }
            userEmail={user?.email || ""}
            onPayment={handlePayment}
            isLoading={verifyPaymentMutation.isPending}
          />

          <SessionCompletionModal
            open={completionModalOpen}
            onOpenChange={setCompletionModalOpen}
            tutorName={
              selectedRequest.tutor_full_name ||
              selectedRequest.tutor_username ||
              "Tutor"
            }
            onComplete={handleSubmitCompletion}
            onReportIssue={handleReportIssue}
            isLoading={completeSessionMutation.isPending}
          />

          <RefundRequestModal
            open={refundModalOpen}
            onOpenChange={setRefundModalOpen}
            tutorName={
              selectedRequest.tutor_full_name ||
              selectedRequest.tutor_username ||
              "Tutor"
            }
            refundAmount={selectedRequest.payment_details?.amount || 0}
            onSubmit={handleSubmitRefund}
            isLoading={refundRequestMutation.isPending}
          />

          <ReviewSessionModal
            open={reviewModalOpen}
            onOpenChange={setReviewModalOpen}
            tutorName={
              selectedRequest.tutor_full_name ||
              selectedRequest.tutor_username ||
              "Tutor"
            }
            onSubmit={handleSubmitReview}
            isLoading={createReviewMutation.isPending}
            sessionType="tutoring"
          />
        </>
      )}

      {/* Delete Service Confirmation Dialog */}
      <Dialog open={deleteServiceModalOpen} onOpenChange={setDeleteServiceModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tutoring service? This action cannot be undone.
              All active students and session data will remain, but you will no longer accept new requests for this service.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteServiceModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteService}
            >
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default TutoringContent;
