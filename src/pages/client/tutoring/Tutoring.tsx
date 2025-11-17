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

import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchTutors,
  getMyTutorProfile,
  getMyTutorApplication,
  getUserTutoringRequests,
  getTutorSessionRequests,
  TutorProfile as ApiTutorProfile,
} from "@/api/mentorship.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { toast as sonnerToast } from "sonner";

const subjectFilters = [
  "All",
  "DCIT 101",
  "DCIT 201",
  "Mathematics",
  "Programming",
  "Calculus I",
  "Statistics",
];

// Extended type for tutors with additional user fields from API
interface ExtendedTutorProfile extends ApiTutorProfile {
  full_name?: string;
  username?: string;
  avatar?: string;
}

const Tutoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  const { data: tutors = [], isLoading: loadingTutors } = useQuery({
    queryKey: ["tutors", searchQuery],
    queryFn: () =>
      searchTutors(searchQuery || undefined, { page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: myTutorApplication, isLoading: loadingMyApplication } =
    useQuery({
      queryKey: ["my-tutor-application"],
      queryFn: () => getMyTutorApplication(),
      staleTime: 60000,
      retry: false,
    });

  const { data: myTutorProfile, isLoading: loadingMyProfile } = useQuery({
    queryKey: ["my-tutor-profile"],
    queryFn: () => getMyTutorProfile(),
    staleTime: 60000,
    retry: false,
  });

  const { data: sentRequests = [], isLoading: loadingSentRequests } = useQuery({
    queryKey: ["tutoring-requests-sent"],
    queryFn: () => getUserTutoringRequests(1, 100),
    staleTime: 30000,
  });

  const { data: receivedRequests = [], isLoading: loadingReceivedRequests } =
    useQuery({
      queryKey: ["tutoring-requests-received"],
      queryFn: () => getTutorSessionRequests(1, 100),
      enabled: !!myTutorProfile,
      staleTime: 30000,
    });

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
    sonnerToast.info("Request tutoring feature coming soon");
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

  const handleAcceptRequest = (requestId: string) => {
    sonnerToast.info("Accept functionality coming soon");
    queryClient.invalidateQueries({ queryKey: ["tutoring-requests-received"] });
  };

  const handleDeclineRequest = (requestId: string) => {
    sonnerToast.info("Decline functionality coming soon");
    queryClient.invalidateQueries({ queryKey: ["tutoring-requests-received"] });
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
    </AppLayout>
  );
};

export default Tutoring;
