import { Briefcase, MessageCircle, Star, UserCheck } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Badge } from "../ui/badge"
import { Card, CardContent } from "../ui/card"
import { Button } from "../ui/button"

type Mentor = {
  id: string;
  user: {
    avatar: string;
    displayName: string;
  };
  verified: boolean;
  position?: string;
  company?: string;
  industry: string;
  experience: number;
  description: string;
  specialties: string[];
  rating: number;
  reviewCount: number;
};

type MentoringCardProps = {
  mentor: Mentor;
  handleContactMentor: (mentor: Mentor) => void;
  handleFollowMentor: (mentor: Mentor) => void;
};

function MentoringCard({
  mentor,
  handleContactMentor,
  handleFollowMentor,
}: MentoringCardProps) {
  return (
    <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Mentor Header */}
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={mentor.user.avatar} alt={mentor.user.displayName} />
              <AvatarFallback>{mentor.user.displayName.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold">{mentor.user.displayName}</h3>
                {mentor.verified && (
                  <Badge variant="default" className="text-xs">Verified</Badge>
                )}
              </div>
              {mentor.position && mentor.company && (
                <p className="text-muted-foreground mb-2">
                  {mentor.position} at {mentor.company}
                </p>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                {mentor.industry} • {mentor.experience} years experience
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground">{mentor.description}</p>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1">
            {mentor.specialties.map((specialty: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>

          {/* Rating and Actions */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              {mentor.rating} ({mentor.reviewCount} reviews)
            </div>
            <div className="flex space-x-2">
              <Button 
                onClick={() => handleContactMentor(mentor)}
                size="sm"
                variant="outline"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Contact</span>
              </Button>
              <Button 
                onClick={() => handleFollowMentor(mentor)}
                size="sm"
                variant="outline"
              >
                <UserCheck className="h-4 w-4" />
                <span className="hidden md:inline ml-2">Follow</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
export default MentoringCard