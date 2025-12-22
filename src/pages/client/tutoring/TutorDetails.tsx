import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  MessageCircle,
  UserCheck,
  UserMinus,
  BadgeCheck,
  Star,
  GraduationCap,
  Award,
  ArrowLeft,
  BookOpen,
  Calendar,
  DollarSign,
} from "lucide-react";
import {
  TutorProfile,
  getTutorProfile,
  getAverageRating,
  getReviewsByReviewee,
  SessionReview,
  AverageRating,
  createTutoringRequest,
} from "@/api/tutoring.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  followUser,
  unfollowUser,
  checkFollowingStatus,
} from "@/api/users.api";
import { RequestTutoringModal } from "@/components/tutoring/RequestTutoringModal";
import { toast as sonnerToast } from "sonner";

export function TutorDetails() {
  const { tutorId } = useParams<{ tutorId: string }>();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: tutor, isLoading: loadingTutor } = useQuery({
    queryKey: ["tutor-profile", tutorId],
    queryFn: () => getTutorProfile(tutorId!),
    enabled: !!tutorId,
  });

  const { data: ratingData } = useQuery({
    queryKey: ["tutor-rating", tutor?.user_id],
    queryFn: () => getAverageRating(tutor!.user_id),
    enabled: !!tutor?.user_id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["tutor-reviews", tutor?.user_id],
    queryFn: () => getReviewsByReviewee(tutor!.user_id, 10, 0),
    enabled: !!tutor?.user_id,
  });

  useEffect(() => {
    const checkFollowStatus = async () => {
      if (tutor?.user_id) {
        try {
          const status = await checkFollowingStatus(tutor.user_id);
          setIsFollowing(status);
        } catch (error) {
          setIsFollowing(false);
        }
      }
    };
    checkFollowStatus();
  }, [tutor?.user_id]);

  const createRequestMutation = useMutation({
    mutationFn: (data: {
      tutor_id: string;
      message?: string;
      session_type: "single" | "semester";
      schedules?: string[];
    }) => createTutoringRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-tutoring-requests"] });
      sonnerToast.success("Tutoring request sent successfully!");
      setIsRequestModalOpen(false);
      navigate("/tutoring?tab=my-requests");
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to send request"
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
    onMutate: async () => {
      setIsFollowing(true);
    },
    onSuccess: () => {
      sonnerToast.success("Successfully followed tutor");
    },
    onError: () => {
      setIsFollowing(false);
      sonnerToast.error("Failed to follow tutor");
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => unfollowUser(userId),
    onMutate: async () => {
      setIsFollowing(false);
    },
    onSuccess: () => {
      sonnerToast.success("Successfully unfollowed tutor");
    },
    onError: () => {
      setIsFollowing(true);
      sonnerToast.error("Failed to unfollow tutor");
    },
  });

  const handleContact = () => {
    if (!tutor?.user_id) {
      sonnerToast.error("Unable to message this tutor");
      return;
    }
    messageTutorMutation.mutate(tutor.user_id);
  };

  const handleFollow = () => {
    if (!tutor?.user_id) {
      sonnerToast.error("Unable to follow this tutor");
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate(tutor.user_id);
    } else {
      followMutation.mutate(tutor.user_id);
    }
  };

  const handleRequestTutoring = (data: {
    message: string;
    sessionType: "single" | "semester";
    schedules: string[];
  }) => {
    if (!tutor) return;

    createRequestMutation.mutate({
      tutor_id: tutor.id,
      message: data.message,
      session_type: data.sessionType,
      schedules: data.schedules,
    });
  };

  if (loadingTutor) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Skeleton className="h-20 w-20 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  if (!tutor) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Tutor not found</p>
            <Button onClick={() => navigate(-1)} className="mt-4">
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const tutorName = tutor?.full_name ||  "Unknown";
  const sessionRate = tutor.session_rate || tutor.hourly_rate;
  const rating = ratingData?.average_rating || 0;
  const reviewCount = ratingData?.review_count || 0;

  return (
    <AppLayout showRightSidebar={false}>
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Main Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 rounded-sm flex-shrink-0">
                  <AvatarImage src={tutor.user?.avatar} alt={tutorName} />
                  <AvatarFallback className="rounded-sm text-xl sm:text-2xl">
                    {tutorName.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold truncate">
                      {tutorName}
                    </h1>
                    {tutor.verified && (
                      <BadgeCheck className="h-5 w-5 text-primary flex-shrink-0" />
                    )}
                  </div>
                  {tutor.user?.department && (
                    <p className="text-sm sm:text-base text-muted-foreground mb-2">
                      {tutor.user.department}
                      {tutor.user.level && ` • ${tutor.user.level}`}
                    </p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-4 mb-3">
                    {rating > 0 && (
                      <div className="flex items-center">
                        <Star className="h-5 w-5 text-yellow-500 mr-1 fill-yellow-500" />
                        <span className="font-medium">{rating.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({reviewCount}{" "}
                          {reviewCount === 1 ? "review" : "reviews"})
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  {tutor.badges && tutor.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {tutor.badges.map((badge, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Subject */}
                  {tutor.subject && (
                    <Badge variant="outline" className="text-sm">
                      <BookOpen className="h-3 w-3 mr-1" />
                      {tutor.subject}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 lg:w-64">
                <Button
                  onClick={() => setIsRequestModalOpen(true)}
                  size="lg"
                  className="w-full bg-foreground hover:bg-foreground/90 text-background"
                  disabled={createRequestMutation.isPending}
                >
                  Request Tutoring
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={handleContact}
                    variant="outline"
                    className="flex-1"
                    disabled={messageTutorMutation.isPending}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Contact</span>
                  </Button>
                  <Button
                    onClick={handleFollow}
                    variant="outline"
                    disabled={
                      followMutation.isPending || unfollowMutation.isPending
                    }
                  >
                    {isFollowing ? (
                      <UserMinus className="h-4 w-4" />
                    ) : (
                      <UserCheck className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="pt-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio */}
                {tutor.bio && (
                  <div>
                    <h3 className="font-semibold mb-2 text-base sm:text-lg">
                      About
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {tutor.bio}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {tutor.experience && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-base sm:text-lg">
                      <Award className="h-4 w-4 mr-2 flex-shrink-0" />
                      Experience
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
                      {tutor.experience}
                    </p>
                  </div>
                )}

                {/* Qualifications */}
                {tutor.qualifications && (
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-base sm:text-lg">
                      <GraduationCap className="h-4 w-4 mr-2 flex-shrink-0" />
                      Qualifications
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">
                      {tutor.qualifications}
                    </p>
                  </div>
                )}

                {/* Reviews */}
                {reviews.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4 text-base sm:text-lg">
                      Recent Reviews
                    </h3>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id}>
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                                <AvatarImage src={review.reviewer_avatar} />
                                <AvatarFallback>
                                  {review.reviewer_username
                                    ?.substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="font-medium text-sm sm:text-base truncate">
                                    {review.reviewer_full_name ||
                                      review.reviewer_username}
                                  </span>
                                  <div className="flex items-center flex-shrink-0">
                                    {[...Array(5)].map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`h-3 w-3 ${
                                          i < review.rating
                                            ? "text-yellow-500 fill-yellow-500"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {review.review_text && (
                                  <p className="text-sm text-muted-foreground">
                                    {review.review_text}
                                  </p>
                                )}
                                {review.created_at && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {new Date(
                                      review.created_at
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Pricing & Availability */}
              <div className="space-y-4 sm:space-y-6">
                {/* Pricing */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sessionRate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Session Rate
                        </span>
                        <span className="font-semibold text-sm sm:text-base">
                          {formatCurrency(sessionRate)}
                        </span>
                      </div>
                    )}
                    {tutor.semester_rate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          Semester Rate
                        </span>
                        <span className="font-semibold text-sm sm:text-base">
                          {formatCurrency(tutor.semester_rate)}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Availability */}
                {tutor.availability &&
                  Array.isArray(tutor.availability) &&
                  tutor.availability.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base flex items-center">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          Availability
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {tutor.availability.map((slot, index) => (
                            <div key={index} className="text-sm">
                              {typeof slot === "string"
                                ? slot
                                : `${slot.day}: ${slot.startTime} - ${slot.endTime}`}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Request Modal */}
        <RequestTutoringModal
          open={isRequestModalOpen}
          onOpenChange={setIsRequestModalOpen}
          tutor={{
            id: tutor.id,
            full_name: tutorName,
            username: tutor.user?.username,
            avatar: tutor.user?.avatar,
            subject: tutor.subject,
            session_rate: tutor.session_rate,
            semester_rate: tutor.semester_rate,
            availability: tutor.availability,
          }}
          onSubmit={handleRequestTutoring}
          isLoading={createRequestMutation.isPending}
        />
      </div>
    </AppLayout>
  );
}
