import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutoringRequest as ApiTutoringRequest } from "@/api/mentorship.api";
import { Calendar, Check, X, User } from "lucide-react";
import { format } from "date-fns";

interface TutoringRequestCardProps {
  request: ApiTutoringRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  showActions?: boolean;
}

export function TutoringRequestCard({
  request,
  onAccept,
  onDecline,
  showActions = true,
}: TutoringRequestCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
      case "approved":
        return "bg-green-500";
      case "declined":
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(request.id);
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline(request.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              Tutoring Request
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              From:{" "}
              {request.requester_full_name ||
                request.requester_username ||
                "Student"}
            </p>
            {request.subjects && request.subjects.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Subjects: {request.subjects.join(", ")}
              </p>
            )}
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {request.created_at && (
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Submitted: {format(new Date(request.created_at), "MMM dd, yyyy")}
          </div>
        )}

        {request.message && (
          <div>
            <h4 className="font-medium mb-2">Message:</h4>
            <p className="text-sm text-muted-foreground">{request.message}</p>
          </div>
        )}

        {request.availability && request.availability.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Availability:</h4>
            <div className="flex flex-wrap gap-1">
              {request.availability.map((slot, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {slot}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showActions && request.status === "pending" && (
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDecline}
              className="text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
