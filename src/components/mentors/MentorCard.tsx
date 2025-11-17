import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, UserCheck, UserMinus } from "lucide-react";

interface MentorCardProps {
  mentor: {
    id: string;
    full_name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    expertise?: string[];
    rating?: number;
    user_id?: string;
  };
  isFollowing?: boolean;
  onContact: () => void;
  onFollow: () => void;
  onRequestMentoring?: () => void;
  isContactLoading?: boolean;
  isFollowLoading?: boolean;
  showRequestButton?: boolean;
}

export function MentorCard({
  mentor,
  isFollowing,
  onContact,
  onFollow,
  onRequestMentoring,
  isContactLoading,
  isFollowLoading,
  showRequestButton = false,
}: MentorCardProps) {
  const mentorName = mentor.full_name || mentor.username || "Unknown";

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mentor Info */}
          <div className="flex items-start space-x-4 flex-1">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.avatar} alt={mentorName} />
              <AvatarFallback>
                {mentorName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold">{mentorName}</h3>
                {mentor.rating && (
                  <Badge variant="default" className="text-xs">
                    ★ {mentor.rating.toFixed(1)}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-4 lg:mb-2">
                {mentor.bio || "Mentor"}
              </p>

              {/* Expertise */}
              {mentor.expertise && mentor.expertise.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {mentor.expertise.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="lg:w-64 space-y-2">
            {showRequestButton ? (
              <Button
                onClick={onRequestMentoring}
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
              >
                Request Mentoring
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
