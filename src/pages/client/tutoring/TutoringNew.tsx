import { useState, useEffect } from "react";
import { Search, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TutorCard } from "@/components/tutoring/TutorCard";
import { TutorApplicationCard } from "@/components/tutoring/TutorApplicationCard";
import { TutoringRequestCard } from "@/components/tutoring/TutoringRequestCard";
import { RequestTutoringModal } from "@/components/tutoring/RequestTutoringModal";
import { PaymentModal } from "@/components/tutoring/PaymentModal";
import { StudentRequestCard } from "@/components/tutoring/StudentRequestCard";
import { SessionCompletionModal } from "@/components/tutoring/SessionCompletionModal";
import { RefundRequestModal } from "@/components/tutoring/RefundRequestModal";
import { useAuth } from "@/contexts/AuthContext";

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  TutorProfile as ApiTutorProfile,
  TutoringRequest,
} from "@/api/mentorship.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { toast as sonnerToast } from "sonner";
import {
  useMockTutoring,
  MockTutoringProvider,
} from "@/contexts/MockTutoringContext";
import {
  mockTutors,
  getTutorApplicationForUser,
  getTutorProfileForUser,
} from "@/data/mockTutors";

const subjectFilters = [
  "All",
  "DCIT 101",
  "DCIT 201",
  "Mathematics",
  "Programming",
  "Calculus I",
  "Statistics",
];

const TutoringContent = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  // Modal states
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<ApiTutorProfile | null>(
    null
  );
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<TutoringRequest | null>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [refundModalOpen, setRefundModalOpen] = useState(false);

  // Mock tutoring context and loading states
  const mockTutoring = useMockTutoring();
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [isAcceptingRequest, setIsAcceptingRequest] = useState(false);
  const [isDecliningRequest, setIsDecliningRequest] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isCompletingSession, setIsCompletingSession] = useState(false);
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);

  // Use mock data instead of API calls
  const tutors = mockTutors;

  // User-based tutor detection
  const myTutorApplication = getTutorApplicationForUser(user?.email);
  const myTutorProfile = getTutorProfileForUser(user?.email, user?.id);

  const loadingTutors = false;
  const loadingMyApplication = false;
  const loadingMyProfile = false;

  // Use mock data for requests
  const sentRequests = mockTutoring.getUserRequests();
  const receivedRequests = myTutorProfile
    ? mockTutoring.getTutorRequests(myTutorProfile.user_id || "")
    : [];
  const loadingSentRequests = false;
  const loadingReceivedRequests = false;

  const loading = loadingTutors || loadingMyApplication;
  const requestsLoading = loadingSentRequests || loadingReceivedRequests;

  const hasApplication = !!myTutorApplication;
  const isApprovedTutor =
    myTutorApplication && myTutorApplication.status === "approved";

  const filteredTutors = (tutors as ExtendedTutorProfile[]).filter((tutor) => {
    if (myTutorProfile && tutor.id === myTutorProfile.id) {
      return false;
    }
    const userName =
      tutor.full_name || tutor.username || tutor.user?.name || "";
    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects?.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesSubject =
      selectedSubject === "All" || tutor.subjects?.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const userApplications = myTutorApplication ? [myTutorApplication] : [];
  const userRequests = receivedRequests || [];

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

  const handleSubmitRequest = async (data: {
    subject: string;
    topic: string;
    preferredSchedule: string[];
    sessionType: "single" | "semester";
  }) => {
    if (!selectedTutor?.user_id) return;

    setIsCreatingRequest(true);
    try {
      await mockTutoring.createRequest({
        tutor_id: selectedTutor.user_id,
        subject: data.subject,
        topic: data.topic,
        preferred_schedule: data.preferredSchedule,
        session_type: data.sessionType,
      });
      setRequestModalOpen(false);
      setSelectedTutor(null);
      sonnerToast.success("Request sent! The tutor has 24 hours to respond.");
    } catch (error) {
      sonnerToast.error("Failed to send request");
    } finally {
      setIsCreatingRequest(false);
    }
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

  const handleEditApplication = () => {
    navigate("/tutoring/become-tutor");
  };

  const handleSaveApplication = () => {
    queryClient.invalidateQueries({ queryKey: ["my-tutor-application"] });
    sonnerToast.success("Application updated successfully");
  };

  const handleDeleteApplication = async (applicationId: string) => {
    sonnerToast.info("Delete functionality coming soon");
  };

  const handleAcceptRequest = async (requestId: string) => {
    setIsAcceptingRequest(true);
    try {
      await mockTutoring.acceptRequest(requestId);
      sonnerToast.success("Request accepted! Student will be notified.");
    } catch (error) {
      sonnerToast.error("Failed to accept request");
    } finally {
      setIsAcceptingRequest(false);
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    setIsDecliningRequest(true);
    try {
      await mockTutoring.declineRequest(requestId);
      sonnerToast.success("Request declined.");
    } catch (error) {
      sonnerToast.error("Failed to decline request");
    } finally {
      setIsDecliningRequest(false);
    }
  };

  // Payment flow
  const handleProceedToPayment = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setPaymentModalOpen(true);
  };

  const handlePayment = async (
    sessionType: "single" | "semester",
    reference: string
  ) => {
    if (!selectedRequest) return;
    const tutor = tutors.find((t) => t.user_id === selectedRequest.tutor_id);
    const hourlyRate = tutor?.hourly_rate || 25;
    const baseAmount =
      sessionType === "single" ? hourlyRate : hourlyRate * 12 * 0.85;
    const platformFee = baseAmount * 0.15;
    const total = baseAmount + platformFee;

    setIsProcessingPayment(true);
    try {
      await mockTutoring.payForSession(selectedRequest.id, {
        amount: total,
        session_type: sessionType,
        platform_fee: platformFee,
        tutor_amount: baseAmount,
        payment_reference: reference,
      });
      setPaymentModalOpen(false);
      setSelectedRequest(null);
      sonnerToast.success(
        "Payment successful! You can now message your tutor to schedule your session."
      );
    } catch (error) {
      sonnerToast.error("Payment failed");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Messaging
  const handleMessageTutor = (request: TutoringRequest) => {
    if (!request.tutor_id) {
      sonnerToast.error("Unable to message this tutor");
      return;
    }
    messageTutorMutation.mutate(request.tutor_id);
  };

  // Session completion
  const handleMarkComplete = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setCompletionModalOpen(true);
  };

  const handleCompleteSession = async (rating: number, review?: string) => {
    if (!selectedRequest) return;

    setIsCompletingSession(true);
    try {
      await mockTutoring.completeSession(selectedRequest.id, rating, review);
      setCompletionModalOpen(false);
      setSelectedRequest(null);
      sonnerToast.success(
        "Thank you! Payment will be released to the tutor on the next payout date."
      );
    } catch (error) {
      sonnerToast.error("Failed to complete session");
    } finally {
      setIsCompletingSession(false);
    }
  };

  const handleReportIssue = (reason: string) => {
    sonnerToast.info(
      "Issue reported. Our support team will contact you within 48 hours."
    );
    setCompletionModalOpen(false);
    setSelectedRequest(null);
  };

  // Refund request
  const handleRequestRefund = (request: TutoringRequest) => {
    setSelectedRequest(request);
    setRefundModalOpen(true);
  };

  const handleSubmitRefund = async (reason: string, explanation?: string) => {
    if (!selectedRequest) return;

    setIsRequestingRefund(true);
    try {
      await mockTutoring.requestRefund(selectedRequest.id, reason, explanation);
      setRefundModalOpen(false);
      setSelectedRequest(null);
      sonnerToast.success(
        "Refund request submitted. You'll hear back within 48 hours."
      );
    } catch (error) {
      sonnerToast.error("Failed to request refund");
    } finally {
      setIsRequestingRefund(false);
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 space-y-6 custom-fonts">
        {/* Header */}
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tutoring</h1>
            <p className="text-muted-foreground mt-1">
              Find tutors to help with your studies
            </p>
          </div>
          <Button variant="outline" onClick={handleBecomeTutor}>
            <BookOpen className="h-4 w-4" />
            <span className="hidden md:block ml-2">Become a Tutor</span>
          </Button>
        </div>

        {isApprovedTutor ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="available">Available Tutors</TabsTrigger>
              <TabsTrigger value="services">My Services</TabsTrigger>
              <TabsTrigger value="requests">
                Requests ({userRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="available" className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tutors or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                <div className="flex w-full overflow-x-auto scrollbar-hide gap-2">
                  {subjectFilters.map((subject) => (
                    <Button
                      key={subject}
                      variant={
                        selectedSubject === subject ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                      className="rounded-full px-5"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  {/* Tutors List */}
                  <div className="space-y-4">
                    {filteredTutors.map((tutor) => {
                      const isFollowing = followingStatus[tutor.user_id || ""];
                      return (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isFollowing={isFollowing}
                          onContact={() => handleContactTutor(tutor)}
                          onFollow={() => handleFollowTutor(tutor)}
                          onRequestTutoring={() => handleRequestTutoring(tutor)}
                          showRequestButton={true}
                          isContactLoading={messageTutorMutation.isPending}
                          isFollowLoading={
                            followMutation.isPending ||
                            unfollowMutation.isPending
                          }
                        />
                      );
                    })}
                  </div>

                  {/* No Results */}
                  {filteredTutors.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No tutors found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              {myTutorApplication && (
                <TutorApplicationCard
                  application={myTutorApplication}
                  onEdit={handleEditApplication}
                />
              )}
            </TabsContent>

            <TabsContent value="requests" className="space-y-4">
              {requestsLoading ? (
                <LoadingSpinner size="md" />
              ) : (
                <>
                  {userRequests.length > 0 ? (
                    <div className="space-y-4">
                      {userRequests.map((request) => (
                        <TutoringRequestCard
                          key={request.id}
                          request={request}
                          onAccept={handleAcceptRequest}
                          onDecline={handleDeclineRequest}
                          showActions={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No tutoring requests
                      </h3>
                      <p className="text-muted-foreground">
                        Requests from students will appear here
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        ) : hasApplication ? (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="available">Available Tutors</TabsTrigger>
              <TabsTrigger value="application">My Application</TabsTrigger>
            </TabsList>

            <TabsContent value="available">
              {/* Same content as the regular tutoring page */}
              {/* Search and Filters */}
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search tutors or subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                <div className="flex w-full overflow-x-auto scrollbar-hide gap-2">
                  {subjectFilters.map((subject) => (
                    <Button
                      key={subject}
                      variant={
                        selectedSubject === subject ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedSubject(subject)}
                      className="rounded-full px-5"
                    >
                      {subject}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Loading State */}
              {loading ? (
                <LoadingSpinner />
              ) : (
                <>
                  {/* Tutors List */}
                  <div className="space-y-4">
                    {filteredTutors.map((tutor) => {
                      const isFollowing = followingStatus[tutor.user_id || ""];
                      return (
                        <TutorCard
                          key={tutor.id}
                          tutor={tutor}
                          isFollowing={isFollowing}
                          onContact={() => handleContactTutor(tutor)}
                          onFollow={() => handleFollowTutor(tutor)}
                          onRequestTutoring={() => handleRequestTutoring(tutor)}
                          showRequestButton={true}
                          isContactLoading={messageTutorMutation.isPending}
                          isFollowLoading={
                            followMutation.isPending ||
                            unfollowMutation.isPending
                          }
                        />
                      );
                    })}
                  </div>

                  {filteredTutors.length === 0 && (
                    <div className="text-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No tutors found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="application" className="space-y-4">
              {myTutorApplication && (
                <TutorApplicationCard
                  application={myTutorApplication}
                  onEdit={handleEditApplication}
                />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tutors or subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-full"
                />
              </div>

              <div className="flex w-full overflow-x-auto scrollbar-hide gap-2">
                {subjectFilters.map((subject) => (
                  <Button
                    key={subject}
                    variant={
                      selectedSubject === subject ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedSubject(subject)}
                    className="rounded-full px-5"
                  >
                    {subject}
                  </Button>
                ))}
              </div>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                <div className="space-y-4">
                  {filteredTutors.map((tutor) => (
                    <TutorCard
                      key={tutor.id}
                      tutor={tutor}
                      onContact={() => handleContactTutor(tutor)}
                      onFollow={() => handleFollowTutor(tutor)}
                      onRequestTutoring={() => handleRequestTutoring(tutor)}
                      showRequestButton={true}
                    />
                  ))}
                </div>

                {filteredTutors.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No tutors found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {selectedTutor && (
        <RequestTutoringModal
          open={requestModalOpen}
          onOpenChange={setRequestModalOpen}
          tutor={selectedTutor}
          onSubmit={handleSubmitRequest}
          isLoading={isCreatingRequest}
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
              tutors.find((t) => t.user_id === selectedRequest.tutor_id)
                ?.hourly_rate || 25
            }
            userEmail={user?.email || ""}
            onPayment={handlePayment}
            isLoading={isProcessingPayment}
          />

          <SessionCompletionModal
            open={completionModalOpen}
            onOpenChange={setCompletionModalOpen}
            tutorName={
              selectedRequest.tutor_full_name ||
              selectedRequest.tutor_username ||
              "Tutor"
            }
            onComplete={handleCompleteSession}
            onReportIssue={handleReportIssue}
            isLoading={isCompletingSession}
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
            isLoading={isRequestingRefund}
          />
        </>
      )}
    </AppLayout>
  );
};

// Wrapper component that provides the context
const Tutoring = () => {
  return (
    <MockTutoringProvider>
      <TutoringContent />
    </MockTutoringProvider>
  );
};

export default Tutoring;
