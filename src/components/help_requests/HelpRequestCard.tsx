import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Clock,
  MessageCircle,
  User,
  BookOpen,
  AlertCircle,
  Edit,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { HelpRequest } from "@/types/help_requests";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HelpRequestCardProps {
  helpRequest: HelpRequest;
  onViewDetails?: (id: string) => void;
  onHelp?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onDelete?: (id: string) => void;
  showActions?: "help" | "owner" | "none";
  isActionLoading?: boolean;
}

export function HelpRequestCard({
  helpRequest,
  onViewDetails,
  onHelp,
  onEdit,
  onToggleVisibility,
  onDelete,
  showActions = "none",
  isActionLoading,
}: HelpRequestCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const ownerName = helpRequest.owner_name || helpRequest.owner_username || "Unknown";
  const isUrgent =
    new Date(helpRequest.deadline) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest('[role="button"]')
    ) {
      return;
    }

    if (onViewDetails) {
      onViewDetails(helpRequest.id);
    } else {
      navigate(`/help/${helpRequest.id}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "course":
        return "secondary";
      case "project":
        return "default";
      case "general":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <Card
      className="hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-6">
        {/* Vertical Layout */}
        <div className="space-y-4">
          {/* Header with Avatar and Owner Info */}
          <div className="flex items-start gap-4">
            <Avatar className="h-14 w-14 rounded-sm">
              <AvatarImage src={helpRequest.owner_avatar} alt={ownerName} />
              <AvatarFallback className="rounded-sm">
                {ownerName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-semibold truncate">
                  {helpRequest.title}
                </h3>
                {isUrgent && (
                  <Badge variant="destructive" className="flex-shrink-0">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Urgent
                  </Badge>
                )}
              </div>

              {/* Owner Info */}
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <User className="h-3 w-3" />
                <span>
                  {ownerName}
                  {helpRequest.owner_level && ` • ${helpRequest.owner_level}`}
                  {helpRequest.department_name &&
                    ` • ${helpRequest.department_name}`}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {helpRequest.description}
          </p>

          {/* Subject */}
          {helpRequest.subject && (
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Subject
                </p>
                <p className="text-sm">{helpRequest.subject}</p>
              </div>
            </div>
          )}

          {/* Type Badge & Deadline */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={getTypeColor(helpRequest.type)}>
              {helpRequest.type.charAt(0).toUpperCase() +
                helpRequest.type.slice(1)}
            </Badge>
            <div
              className={`flex items-center gap-1 text-sm ${
                isUrgent
                  ? "text-destructive font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(helpRequest.deadline), "MMM dd, HH:mm")}
              </span>
            </div>
            {helpRequest.status === "private" && (
              <Badge variant="outline" className="text-xs">
                <EyeOff className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          {showActions === "help" && onHelp && (
            <div className="pt-2 border-t">
              <Button
                onClick={() => onHelp(helpRequest.id)}
                className="w-full bg-foreground hover:bg-foreground/90 text-background"
                disabled={isActionLoading}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Offer Help
              </Button>
            </div>
          )}

          {showActions === "owner" && (
            <div className="pt-2 border-t space-y-2">
              <Button
                onClick={() => onEdit?.(helpRequest.id)}
                variant="outline"
                className="w-full"
                size="sm"
                disabled={isActionLoading}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => onToggleVisibility?.(helpRequest.id)}
                  variant="outline"
                  size="sm"
                  disabled={isActionLoading}
                >
                  {helpRequest.status === "public" ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Make Public
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => onDelete?.(helpRequest.id)}
                  variant="destructive"
                  size="sm"
                  disabled={isActionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
