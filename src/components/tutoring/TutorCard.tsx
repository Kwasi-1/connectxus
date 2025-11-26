import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  Clock,
  DollarSign,
  MessageCircle,
  UserCheck,
  UserMinus,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

interface TutorCardProps {
  tutor: {
    id: string;
    full_name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    subjects?: string[];
    rating?: number;
    hourly_rate?: number;
    availability?:
      | string[]
      | { day: string; startTime: string; endTime: string }[];
    user_id?: string;
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Tutor Info */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={tutor.avatar} alt={tutorName} />
              <AvatarFallback>
                {tutorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">{tutorName}</h3>
                {tutor.rating && (
                  <Badge variant="default" className="text-xs">
                    ★ {tutor.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4 lg:mb-2">
                {tutor.bio || "Tutor"}
              </p>
              <p className="text-sm mb-3 -ml-[5rem] lg:ml-0">
                {tutor.bio || ""}
              </p>

              {/* Subjects */}
              <div className="flex flex-wrap gap-1 mb-3 -ml-20 lg:ml-0">
                {tutor.subjects?.map((subject, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {subject}
                  </Badge>
                )) || []}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground -ml-20 lg:ml-0">
                {tutor.rating && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    {tutor.rating.toFixed(1)}
                  </div>
                )}
                {tutor.hourly_rate && (
                  <div className="flex items-center">
                    {formatCurrency(tutor.hourly_rate)}/hour
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Availability & Actions */}
          <div className="lg:w-64 space-y-4">
            <div>
              <h4 className="font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                Availability
              </h4>
              <div className="space-y-1">
                {tutor.availability &&
                  Array.isArray(tutor.availability) &&
                  tutor.availability
                    .slice(0, 2)
                    .map(
                      (
                        slot:
                          | string
                          | { day: string; startTime: string; endTime: string },
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
                {tutor.availability &&
                  Array.isArray(tutor.availability) &&
                  tutor.availability.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{tutor.availability.length - 2} more slots
                    </div>
                  )}
              </div>
            </div>

            {showRequestButton ? (
              <Button
                onClick={onRequestTutoring}
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
              >
                Request Tutoring
              </Button>
            ) : (
              <div className="flex space-x-2">
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
