import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  MessageCircle,
  UserCheck,
  UserMinus,
  BadgeCheck,
  Star,
  GraduationCap,
  Award,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { useNavigate } from "react-router-dom";

interface TutorCardProps {
  tutor: {
    id: string;
    full_name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    subject?: string;
    rating?: number;
    hourly_rate?: number;
    session_rate?: number;
    semester_rate?: number;
    department?: string;
    year?: string;
    availability?:
      | string[]
      | { day: string; startTime: string; endTime: string }[];
    user_id?: string;
    verified?: boolean;
    experience?: string;
    qualifications?: string;
  };
  isFollowing?: boolean;
  onContact: () => void;
  onFollow: () => void;
  onRequestTutoring?: () => void;
  isContactLoading?: boolean;
  isFollowLoading?: boolean;
  showRequestButton?: boolean;
}

export function TutorCard({
  tutor,
  isFollowing,
  onContact,
  onFollow,
  onRequestTutoring,
  isContactLoading,
  isFollowLoading,
  showRequestButton = false,
}: TutorCardProps) {
  const tutorName = tutor.full_name || tutor.username || "Unknown";
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();

  const sessionRate = parseFloat(String(tutor.session_rate || tutor.hourly_rate || 0)) || undefined;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    navigate(`/tutoring/${tutor.id}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-5">
          {/* Tutor Info */}
          <div className="flex items-start gap-4 flex-1">
            <Avatar className="h-14 w-14 rounded-sm">
              <AvatarImage src={tutor.avatar} alt={tutorName} />
              <AvatarFallback className="rounded-sm">
                {tutorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold truncate">{tutorName}</h3>
                {tutor.verified && (
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              {(tutor.department || tutor.year) && (
                <p className="text-muted-foreground mb-4 lg:mb-2">
                  {tutor.department && tutor.year
                    ? `${tutor.department} • ${tutor.year}`
                    : tutor.department || tutor.year}
                </p>
              )}
              {tutor.bio && (
                <p className="text-sm mb-3 -ml-[4.5rem] lg:ml-0">
                  {tutor.bio}
                </p>
              )}

              {/* Experience */}
              {tutor.experience && (
                <div className="flex items-start gap-2 mb-3 -ml-[4.5rem] lg:ml-0">
                  <Award className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Experience</p>
                    <p className="text-sm line-clamp-4">{tutor.experience}</p>
                  </div>
                </div>
              )}

              {/* Qualifications */}
              {tutor.qualifications && (
                <div className="flex items-start gap-2 mb-3 -ml-[4.5rem] lg:ml-0">
                  <GraduationCap className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Qualifications</p>
                    <p className="text-sm line-clamp-4">{tutor.qualifications}</p>
                  </div>
                </div>
              )}

              {/* Subject */}
              {tutor.subject && (
                <div className="flex flex-wrap gap-1 mb-3 -ml-[4.5rem] lg:ml-0">
                  <Badge variant="secondary" className="text-xs">
                    {tutor.subject}
                  </Badge>
                </div>
              )}

              {/* Pricing */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground -ml-[4.5rem] lg:ml-0">
                {tutor.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {tutor.rating.toFixed(1)}
                  </div>
                )}
                {sessionRate && (
                  <div className="font-medium">
                    {formatCurrency(sessionRate)}
                    <span className="text-muted-foreground font-normal">
                      /session
                    </span>
                  </div>
                )}
                {tutor.semester_rate && (
                  <div className="text-muted-foreground">
                    {formatCurrency(parseFloat(String(tutor.semester_rate)))}
                    <span className="text-xs">/semester</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability & Actions */}
          <div className="lg:w-64 space-y-4">
            {/* Availability */}
            {tutor.availability &&
              Array.isArray(tutor.availability) &&
              tutor.availability.length > 0 && (
                <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                    Availability
                  </h4>
                  <div className="space-y-1">
                    {tutor.availability
                      .slice(0, 2)
                      .map(
                        (
                          slot:
                            | string
                            | {
                                day: string;
                                startTime: string;
                                endTime: string;
                              },
                          index: number
                        ) => (
                          <div
                            key={index}
                          className="text-sm text-muted-foreground"
                          >
                            {typeof slot === "string"
                              ? slot
                              : `${slot.day}: ${slot.startTime} - ${slot.endTime}`}
                          </div>
                        )
                      )}
                    {tutor.availability.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{tutor.availability.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              )}

            {/* Actions */}
            {showRequestButton ? (
              <Button
                onClick={onRequestTutoring}
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
              >
                Request Tutoring
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={onContact}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  disabled={isContactLoading}
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="ml-2">Contact</span>
                </Button>
                <Button
                  onClick={onFollow}
                  size="sm"
                  variant="outline"
                  disabled={isFollowLoading}
                >
                  {isFollowing ? (
                    <UserMinus className="h-4 w-4" />
                  ) : (
                    <UserCheck className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
