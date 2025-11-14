import { useState, useEffect } from "react";
import {
  Search,
  Star,
  DollarSign,
  BookOpen,
  MessageCircle,
  UserCheck,
  UserMinus,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  searchTutors,
  getMyTutorProfile,
  getMyTutorApplication,
  getRecommendedTutors,
  getUserTutoringRequests,
  getTutorSessionRequests,
  TutorProfile as ApiTutorProfile,
  TutorApplication as ApiTutorApplication,
  TutoringRequest,
} from "@/api/mentorship.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { toast } from "sonner";
import { TutoringRequestDetailsModal } from "@/components/tutoring/TutoringRequestDetailsModal";
import { RequestTutoringSessionModal } from "@/components/tutoring/RequestTutoringSessionModal";
import { useAuth } from "@/contexts/AuthContext";

type TutoringTabTutor = "available" | "requests" | "myservices";
type TutoringTabNonTutor = "available" | "requests";
type RequestFilter = "received" | "sent" | "all";

const Tutoring = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTutorTab, setActiveTutorTab] =
    useState<TutoringTabTutor>("available");
  const [activeNonTutorTab, setActiveNonTutorTab] =
    useState<TutoringTabNonTutor>("available");
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("received");
  const [selectedRequest, setSelectedRequest] =
    useState<TutoringRequest | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [isRequestSessionOpen, setIsRequestSessionOpen] = useState(false);
  const [selectedTutorForRequest, setSelectedTutorForRequest] =
    useState<ApiTutorProfile | null>(null);
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  const { data: recommendedTutors = [], isLoading: loadingRecommended } =
    useQuery({
      queryKey: ["recommended-tutors"],
      queryFn: () => getRecommendedTutors(5),
      staleTime: 300000,
      retry: false,
    });

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

  const isTutor = !!myTutorProfile;
  const hasPendingApplication =
    myTutorApplication && myTutorApplication.status === "pending";
  const isApprovedTutor =
    myTutorApplication && myTutorApplication.status === "approved";

  const filteredTutors = tutors.filter((tutor) => {
    if (myTutorProfile && tutor.id === myTutorProfile.id) {
      return false;
    }

    const userName = tutor.full_name || tutor.username || "";
    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tutor.subjects?.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const getFilteredRequestsTutor = () => {
    switch (requestFilter) {
      case "received":
        return receivedRequests;
      case "sent":
        return sentRequests;
      case "all":
        return [...receivedRequests, ...sentRequests];
      default:
        return receivedRequests;
    }
  };

  const getFilteredRequestsNonTutor = () => {
    return sentRequests;
  };

  const handleTutorAction = () => {
    if (isApprovedTutor) {
      navigate("/tutoring/become-tutor");
      toast.info("Add another tutoring specialty or subject");
    } else if (myTutorApplication && myTutorApplication.status === "pending") {
      toast.info("Your application is pending review");
    } else {
      navigate("/tutoring/become-tutor");
    }
  };

  const getTutorButtonText = () => {
    if (isApprovedTutor) {
      return "Add Another Service";
    } else if (myTutorApplication && myTutorApplication.status === "pending") {
      return "Application Pending";
    }
    return "Become a Tutor";
  };

  const messageTutorMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateDirectConversation(userId),
    onSuccess: (response) => {
      navigate(`/messages/${response.conversation_id}`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to start conversation"
      );
    },
  });

  const handleContactTutor = (tutor: ApiTutorProfile) => {
    if (!tutor.user_id) {
      toast.error("Unable to message this tutor");
      return;
    }
    messageTutorMutation.mutate(tutor.user_id);
  };

  const handleRequestTutoring = (tutor: ApiTutorProfile) => {
    setSelectedTutorForRequest(tutor);
    setIsRequestSessionOpen(true);
  };

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
    },
    onSuccess: (_, userId) => {
      toast.success("Successfully followed tutor");
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
    onError: (error: any, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
      toast.error(error.response?.data?.message || "Failed to follow tutor");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
    },
    onSuccess: (_, userId) => {
      toast.success("Successfully unfollowed tutor");
      queryClient.invalidateQueries({ queryKey: ["tutors"] });
    },
    onError: (error: any, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
      toast.error(error.response?.data?.message || "Failed to unfollow tutor");
    },
  });

  const handleFollowTutor = async (tutor: ApiTutorProfile) => {
    if (!tutor.user_id) {
      toast.error("Unable to follow this tutor");
      return;
    }

    const isFollowing = followingStatus[tutor.user_id];
    if (isFollowing) {
      unfollowMutation.mutate(tutor.user_id);
    } else {
      followMutation.mutate(tutor.user_id);
    }
  };

  const checkFollowStatus = async (userId: string) => {
    try {
      const status = await checkFollowingStatus(userId);
      setFollowingStatus((prev) => ({ ...prev, [userId]: status }));
    } catch (error) {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    const tutorsToCheck = [...filteredTutors, ...recommendedTutors];
    tutorsToCheck.forEach((tutor) => {
      if (tutor.user_id && !followingStatus[tutor.user_id]) {
        checkFollowStatus(tutor.user_id);
      }
    });
  }, [filteredTutors, recommendedTutors]);

  const RecommendedTutorsList = () => {
    if (loadingRecommended) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    const recommendations = recommendedTutors.filter(
      (tutor) => !myTutorProfile || tutor.id !== myTutorProfile.id
    );

    if (recommendations.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Tutors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((tutor) => {
            const userName = tutor.full_name || tutor.username || "Unknown";
            const isFollowing = followingStatus[tutor.user_id || ""];

            return (
              <Card
                key={tutor.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tutor.avatar} alt={userName} />
                      <AvatarFallback>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{userName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        {tutor.rating && (
                          <div className="flex items-center mr-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{tutor.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {tutor.hourly_rate && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3" />
                            <span>{tutor.hourly_rate}/hr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {tutor.subjects.slice(0, 3).map((subject, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestTutoring(tutor)}
                      size="sm"
                      className="flex-1"
                      variant="default"
                    >
                      Request Tutoring
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContactTutor(tutor)}
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        disabled={messageTutorMutation.isPending}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      {!isFollowing && (
                        <Button
                          onClick={() => handleFollowTutor(tutor)}
                          size="sm"
                          variant="outline"
                          disabled={
                            followMutation.isPending ||
                            unfollowMutation.isPending
                          }
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const AvailableTutorsList = () => {
    if (loadingTutors) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (filteredTutors.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Available Tutors</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No tutors match your search"
              : "No tutors are currently available"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredTutors.map((tutor) => {
          const tutorName = tutor.full_name || tutor.username || "Unknown";
          const tutorAvatar = tutor.avatar;
          const isFollowing = followingStatus[tutor.user_id || ""];

          return (
            <Card key={tutor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={tutorAvatar} alt={tutorName} />
                      <AvatarFallback>
                        {tutorName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{tutorName}</h3>
                        {tutor.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {tutor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {tutor.bio && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {tutor.bio}
                        </p>
                      )}

                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs text-muted-foreground mr-2">
                            Subjects:
                          </span>
                          {tutor.subjects.map((subject, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {tutor.hourly_rate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />$
                          {tutor.hourly_rate}/hour
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-2">
                    <Button
                      onClick={() => handleRequestTutoring(tutor)}
                      size="sm"
                      className="w-full"
                      variant="default"
                    >
                      Request Tutoring
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContactTutor(tutor)}
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        disabled={messageTutorMutation.isPending}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        onClick={() => handleFollowTutor(tutor)}
                        size="sm"
                        variant="outline"
                        disabled={
                          followMutation.isPending || unfollowMutation.isPending
                        }
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus className="h-4 w-4" />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-4 w-4" />
                            Follow
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  const RequestsList = ({ requests }: { requests: TutoringRequest[] }) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Requests</h3>
          <p className="text-muted-foreground">No tutoring requests found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {requests.map((request) => {
          const requesterName =
            request.requester_full_name ||
            request.requester_username ||
            "Unknown";
          const isReceived = request.session_id === myTutorProfile?.id;

          return (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={request.requester_avatar}
                        alt={requesterName}
                      />
                      <AvatarFallback>
                        {requesterName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {requesterName}
                        </h3>
                        <Badge
                          variant={
                            request.status === "pending"
                              ? "secondary"
                              : request.status === "approved"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {request.status}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {isReceived ? "Received" : "Sent"}
                        </Badge>
                      </div>

                      {request.message && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {request.message}
                        </p>
                      )}

                      {request.subject && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Subject: {request.subject}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-2">
                    <Button
                      onClick={() => {
                        setSelectedRequest(request);
                        setIsRequestDetailsOpen(true);
                      }}
                      size="sm"
                      className="w-full"
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-7xl mx-auto p-6 h-full flex flex-col">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Tutoring</h1>
              <p className="text-muted-foreground">
                Find expert tutors or share your knowledge
              </p>
            </div>
            <Button
              onClick={handleTutorAction}
              disabled={hasPendingApplication}
            >
              <Plus className="h-4 w-4 mr-2" />
              {getTutorButtonText()}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by tutor name or subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {isTutor ? (
              <Tabs
                value={activeTutorTab}
                onValueChange={(value: string) =>
                  setActiveTutorTab(value as TutoringTabTutor)
                }
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="available">
                    Recommended Tutors
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests{" "}
                    {receivedRequests.length > 0 &&
                      `(${receivedRequests.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="myservices">My Services</TabsTrigger>
                </TabsList>

                <TabsContent value="available">
                  <RecommendedTutorsList />
                </TabsContent>

                <TabsContent value="requests">
                  <div className="mb-4">
                    <Tabs
                      value={requestFilter}
                      onValueChange={(value: string) =>
                        setRequestFilter(value as RequestFilter)
                      }
                    >
                      <TabsList>
                        <TabsTrigger value="received">Received</TabsTrigger>
                        <TabsTrigger value="sent">Sent</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <RequestsList requests={getFilteredRequestsTutor()} />
                </TabsContent>

                <TabsContent value="myservices">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        My Tutoring Services
                      </h3>
                      <Button onClick={handleTutorAction} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    {myTutorApplication ? (
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold">
                                    Tutoring Services
                                  </h3>
                                  <Badge
                                    variant={
                                      myTutorApplication.status === "approved"
                                        ? "default"
                                        : myTutorApplication.status ===
                                          "pending"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {myTutorApplication.status}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    navigate("/tutoring/become-tutor")
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {myTutorApplication.subjects &&
                              myTutorApplication.subjects.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Subjects:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {myTutorApplication.subjects.map(
                                      (subject, index) => (
                                        <Badge key={index} variant="secondary">
                                          {subject}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {myTutorApplication.motivation && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Motivation:
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {myTutorApplication.motivation}
                                </p>
                              </div>
                            )}

                            {myTutorApplication.qualifications && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Qualifications:
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {myTutorApplication.qualifications}
                                </p>
                              </div>
                            )}

                            {myTutorApplication.teaching_style && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Teaching Style:
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {myTutorApplication.teaching_style}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {myTutorApplication.rate && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${myTutorApplication.rate}/hr</span>
                                </div>
                              )}
                            </div>

                            {myTutorApplication.availability &&
                              myTutorApplication.availability.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Availability:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {myTutorApplication.availability.map(
                                      (slot, index) => (
                                        <Badge key={index} variant="outline">
                                          {slot}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">
                          No Services Yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't created any tutoring services
                        </p>
                        <Button onClick={handleTutorAction}>
                          <Plus className="h-4 w-4 mr-2" />
                          Create Your First Service
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <Tabs
                value={activeNonTutorTab}
                onValueChange={(value: string) =>
                  setActiveNonTutorTab(value as TutoringTabNonTutor)
                }
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="available">
                    Recommended Tutors
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    My Requests{" "}
                    {sentRequests.length > 0 && `(${sentRequests.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="available">
                  <RecommendedTutorsList />
                </TabsContent>

                <TabsContent value="requests">
                  <RequestsList requests={getFilteredRequestsNonTutor()} />
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        {selectedTutorForRequest && (
          <RequestTutoringSessionModal
            open={isRequestSessionOpen}
            onOpenChange={setIsRequestSessionOpen}
            sessionId={selectedTutorForRequest.id}
            subject={selectedTutorForRequest.subjects?.[0] || "Tutoring"}
            tutorName={
              selectedTutorForRequest.full_name ||
              selectedTutorForRequest.username ||
              "Tutor"
            }
          />
        )}

        {selectedRequest && (
          <TutoringRequestDetailsModal
            open={isRequestDetailsOpen}
            onOpenChange={setIsRequestDetailsOpen}
            request={selectedRequest}
            isTutor={isTutor}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Tutoring;
