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
  searchMentors,
  getMyMentorProfile,
  getMyMentorApplication,
  getRecommendedMentors,
  getUserMentorshipRequests,
  getMentorSessionRequests,
  MentorProfile as ApiMentorProfile,
  MentorApplication as ApiMentorApplication,
  MentoringRequest,
} from "@/api/mentorship.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { toast } from "sonner";
import { MentorshipRequestDetailsModal } from "@/components/mentors/MentorshipRequestDetailsModal";
import { RequestMentoringSessionModal } from "@/components/mentors/RequestMentoringSessionModal";
import { useAuth } from "@/contexts/AuthContext";

type MentoringTabMentor = "available" | "requests" | "myservices";
type MentoringTabNonMentor = "available" | "requests";
type RequestFilter = "received" | "sent" | "all";

const Mentoring = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMentorTab, setActiveMentorTab] =
    useState<MentoringTabMentor>("available");
  const [activeNonMentorTab, setActiveNonMentorTab] =
    useState<MentoringTabNonMentor>("available");
  const [requestFilter, setRequestFilter] = useState<RequestFilter>("received");
  const [selectedRequest, setSelectedRequest] =
    useState<MentoringRequest | null>(null);
  const [isRequestDetailsOpen, setIsRequestDetailsOpen] = useState(false);
  const [isRequestSessionOpen, setIsRequestSessionOpen] = useState(false);
  const [selectedMentorForRequest, setSelectedMentorForRequest] =
    useState<ApiMentorProfile | null>(null);
  const [followingStatus, setFollowingStatus] = useState<
    Record<string, boolean>
  >({});

  const { data: recommendedMentors = [], isLoading: loadingRecommended } =
    useQuery({
      queryKey: ["recommended-mentors"],
      queryFn: () => getRecommendedMentors(5),
      staleTime: 300000,
      retry: false,
    });

  const { data: mentors = [], isLoading: loadingMentors } = useQuery({
    queryKey: ["mentors", searchQuery],
    queryFn: () =>
      searchMentors(searchQuery || undefined, { page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: myMentorApplication, isLoading: loadingMyApplication } =
    useQuery({
      queryKey: ["my-mentor-application"],
      queryFn: () => getMyMentorApplication(),
      staleTime: 60000,
      retry: false,
    });

  const { data: myMentorProfile, isLoading: loadingMyProfile } = useQuery({
    queryKey: ["my-mentor-profile"],
    queryFn: () => getMyMentorProfile(),
    staleTime: 60000,
    retry: false,
  });

  const { data: sentRequests = [], isLoading: loadingSentRequests } = useQuery({
    queryKey: ["mentoring-requests-sent"],
    queryFn: () => getUserMentorshipRequests(1, 100),
    staleTime: 30000,
  });

  const { data: receivedRequests = [], isLoading: loadingReceivedRequests } =
    useQuery({
      queryKey: ["mentoring-requests-received"],
      queryFn: () => getMentorSessionRequests(1, 100),
      enabled: !!myMentorProfile,
      staleTime: 30000,
    });

  const loading = loadingMentors || loadingMyApplication;

  const isMentor = !!myMentorProfile;
  const hasPendingApplication =
    myMentorApplication && myMentorApplication.status === "pending";
  const isApprovedMentor =
    myMentorApplication && myMentorApplication.status === "approved";

  const filteredMentors = mentors.filter((mentor) => {
    if (myMentorProfile && mentor.id === myMentorProfile.id) {
      return false;
    }

    const userName = mentor.full_name || mentor.username || "";
    const matchesSearch =
      userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise?.some((topic) =>
        topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesSearch;
  });

  const getFilteredRequestsMentor = () => {
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

  const getFilteredRequestsNonMentor = () => {
    return sentRequests;
  };

  const handleMentorAction = () => {
    if (isApprovedMentor) {
      navigate("/mentoring/become-mentor");
      toast.info("Add another mentoring specialty or topic");
    } else if (
      myMentorApplication &&
      myMentorApplication.status === "pending"
    ) {
      toast.info("Your application is pending review");
    } else {
      navigate("/mentoring/become-mentor");
    }
  };

  const getMentorButtonText = () => {
    if (isApprovedMentor) {
      return "Add Another Service";
    } else if (
      myMentorApplication &&
      myMentorApplication.status === "pending"
    ) {
      return "Application Pending";
    }
    return "Become a Mentor";
  };

  const messageMentorMutation = useMutation({
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

  const handleContactMentor = (mentor: ApiMentorProfile) => {
    if (!mentor.user_id) {
      toast.error("Unable to message this mentor");
      return;
    }
    messageMentorMutation.mutate(mentor.user_id);
  };

  const handleRequestMentoring = (mentor: ApiMentorProfile) => {
    setSelectedMentorForRequest(mentor);
    setIsRequestSessionOpen(true);
  };

  const followMutation = useMutation({
    mutationFn: (userId: string) => followUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
    },
    onSuccess: (_, userId) => {
      toast.success("Successfully followed mentor");
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
    onError: (error: any, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
      toast.error(error.response?.data?.message || "Failed to follow mentor");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onMutate: async (userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: false }));
    },
    onSuccess: (_, userId) => {
      toast.success("Successfully unfollowed mentor");
      queryClient.invalidateQueries({ queryKey: ["mentors"] });
    },
    onError: (error: any, userId) => {
      setFollowingStatus((prev) => ({ ...prev, [userId]: true }));
      toast.error(error.response?.data?.message || "Failed to unfollow mentor");
    },
  });

  const handleFollowMentor = async (mentor: ApiMentorProfile) => {
    if (!mentor.user_id) {
      toast.error("Unable to follow this mentor");
      return;
    }

    const isFollowing = followingStatus[mentor.user_id];
    if (isFollowing) {
      unfollowMutation.mutate(mentor.user_id);
    } else {
      followMutation.mutate(mentor.user_id);
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
    const mentorsToCheck = [...filteredMentors, ...recommendedMentors];
    mentorsToCheck.forEach((mentor) => {
      if (mentor.user_id && !followingStatus[mentor.user_id]) {
        checkFollowStatus(mentor.user_id);
      }
    });
  }, [filteredMentors, recommendedMentors]);

  const RecommendedMentorsList = () => {
    if (loadingRecommended) {
      return (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      );
    }

    const recommendations = recommendedMentors.filter(
      (mentor) => !myMentorProfile || mentor.id !== myMentorProfile.id
    );

    if (recommendations.length === 0) {
      return null;
    }

    return (
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Mentors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((mentor) => {
            const userName = mentor.full_name || mentor.username || "Unknown";
            const isFollowing = followingStatus[mentor.user_id || ""];

            return (
              <Card
                key={mentor.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={mentor.avatar} alt={userName} />
                      <AvatarFallback>
                        {userName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{userName}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        {mentor.rating && (
                          <div className="flex items-center mr-2">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span>{mentor.rating.toFixed(1)}</span>
                          </div>
                        )}
                        {mentor.hourly_rate && (
                          <div className="flex items-center">
                            <DollarSign className="h-3 w-3" />
                            <span>{mentor.hourly_rate}/hr</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {mentor.expertise && mentor.expertise.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {mentor.expertise.slice(0, 3).map((topic, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRequestMentoring(mentor)}
                      size="sm"
                      className="flex-1"
                      variant="default"
                    >
                      Request Mentoring
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContactMentor(mentor)}
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        disabled={messageMentorMutation.isPending}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                      {!isFollowing && (
                        <Button
                          onClick={() => handleFollowMentor(mentor)}
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

  const AvailableMentorsList = () => {
    if (loadingMentors) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (filteredMentors.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Available Mentors</h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "No mentors match your search"
              : "No mentors are currently available"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredMentors.map((mentor) => {
          const mentorName = mentor.full_name || mentor.username || "Unknown";
          const mentorAvatar = mentor.avatar;
          const isFollowing = followingStatus[mentor.user_id || ""];

          return (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex items-start space-x-4 flex-1">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentorAvatar} alt={mentorName} />
                      <AvatarFallback>
                        {mentorName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">{mentorName}</h3>
                        {mentor.rating && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-sm">
                              {mentor.rating.toFixed(1)}
                            </span>
                          </div>
                        )}
                      </div>

                      {mentor.bio && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {mentor.bio}
                        </p>
                      )}

                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="text-xs text-muted-foreground mr-2">
                            Expertise:
                          </span>
                          {mentor.expertise.map((topic, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {mentor.hourly_rate && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4 mr-1" />$
                          {mentor.hourly_rate}/hour
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-64 space-y-2">
                    <Button
                      onClick={() => handleRequestMentoring(mentor)}
                      size="sm"
                      className="w-full"
                      variant="default"
                    >
                      Request Mentoring
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleContactMentor(mentor)}
                        size="sm"
                        className="flex-1"
                        variant="outline"
                        disabled={messageMentorMutation.isPending}
                      >
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                      <Button
                        onClick={() => handleFollowMentor(mentor)}
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

  const RequestsList = ({ requests }: { requests: MentoringRequest[] }) => {
    if (requests.length === 0) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Requests</h3>
          <p className="text-muted-foreground">No mentoring requests found</p>
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
          const isReceived = request.session_id === myMentorProfile?.id;

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

                      {request.topic && (
                        <div className="flex items-center gap-2 text-sm mb-2">
                          <BookOpen className="h-4 w-4" />
                          <span>Topic: {request.topic}</span>
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
              <h1 className="text-3xl font-bold mb-2">Mentoring</h1>
              <p className="text-muted-foreground">
                Find expert mentors or share your knowledge
              </p>
            </div>
            <Button
              onClick={handleMentorAction}
              disabled={hasPendingApplication}
            >
              <Plus className="h-4 w-4 mr-2" />
              {getMentorButtonText()}
            </Button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                placeholder="Search by mentor name or topic..."
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
            {isMentor ? (
              <Tabs
                value={activeMentorTab}
                onValueChange={(value: string) =>
                  setActiveMentorTab(value as MentoringTabMentor)
                }
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="available">
                    Recommended Mentors
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    Requests{" "}
                    {receivedRequests.length > 0 &&
                      `(${receivedRequests.length})`}
                  </TabsTrigger>
                  <TabsTrigger value="myservices">My Services</TabsTrigger>
                </TabsList>

                <TabsContent value="available">
                  <RecommendedMentorsList />
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
                  <RequestsList requests={getFilteredRequestsMentor()} />
                </TabsContent>

                <TabsContent value="myservices">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">
                        My Mentoring Services
                      </h3>
                      <Button onClick={handleMentorAction} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Service
                      </Button>
                    </div>

                    {myMentorApplication ? (
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex flex-col space-y-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-semibold">
                                    {myMentorApplication.industry}
                                  </h3>
                                  <Badge
                                    variant={
                                      myMentorApplication.status === "approved"
                                        ? "default"
                                        : myMentorApplication.status ===
                                          "pending"
                                        ? "secondary"
                                        : "destructive"
                                    }
                                  >
                                    {myMentorApplication.status}
                                  </Badge>
                                </div>
                                {myMentorApplication.company && (
                                  <p className="text-sm text-muted-foreground">
                                    {myMentorApplication.position} at{" "}
                                    {myMentorApplication.company}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    navigate("/mentoring/become-mentor")
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {myMentorApplication.specialties &&
                              myMentorApplication.specialties.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Specialties:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {myMentorApplication.specialties.map(
                                      (specialty, index) => (
                                        <Badge key={index} variant="secondary">
                                          {specialty}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                            {myMentorApplication.motivation && (
                              <div>
                                <h4 className="text-sm font-medium mb-2">
                                  Motivation:
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {myMentorApplication.motivation}
                                </p>
                              </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <BookOpen className="h-4 w-4" />
                                <span>
                                  {myMentorApplication.experience} years
                                  experience
                                </span>
                              </div>
                              {myMentorApplication.rate && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${myMentorApplication.rate}/hr</span>
                                </div>
                              )}
                            </div>

                            {myMentorApplication.availability &&
                              myMentorApplication.availability.length > 0 && (
                                <div>
                                  <h4 className="text-sm font-medium mb-2">
                                    Availability:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {myMentorApplication.availability.map(
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
                          You haven't created any mentoring services
                        </p>
                        <Button onClick={handleMentorAction}>
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
                value={activeNonMentorTab}
                onValueChange={(value: string) =>
                  setActiveNonMentorTab(value as MentoringTabNonMentor)
                }
              >
                <TabsList className="mb-6">
                  <TabsTrigger value="available">
                    Recommended Mentors
                  </TabsTrigger>
                  <TabsTrigger value="requests">
                    My Requests{" "}
                    {sentRequests.length > 0 && `(${sentRequests.length})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="available">
                  <RecommendedMentorsList />
                </TabsContent>

                <TabsContent value="requests">
                  <RequestsList requests={getFilteredRequestsNonMentor()} />
                </TabsContent>
              </Tabs>
            )}
          </>
        )}

        {selectedMentorForRequest && (
          <RequestMentoringSessionModal
            open={isRequestSessionOpen}
            onOpenChange={setIsRequestSessionOpen}
            sessionId={selectedMentorForRequest.id}
            sessionTopic={
              selectedMentorForRequest.expertise?.[0] || "Mentoring"
            }
            mentorName={
              selectedMentorForRequest.full_name ||
              selectedMentorForRequest.username ||
              "Mentor"
            }
          />
        )}

        {selectedRequest && (
          <MentorshipRequestDetailsModal
            open={isRequestDetailsOpen}
            onOpenChange={setIsRequestDetailsOpen}
            request={selectedRequest}
            isMentor={isMentor}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Mentoring;
