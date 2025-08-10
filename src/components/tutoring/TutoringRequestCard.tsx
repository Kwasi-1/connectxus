
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TutoringRequest } from '@/types/tutoring';
import { Calendar, Clock, Check, X, User } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TutoringRequestCardProps {
  request: TutoringRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  showActions?: boolean;
}

export function TutoringRequestCard({ 
  request, 
  onAccept, 
  onDecline, 
  showActions = true 
}: TutoringRequestCardProps) {
  const { toast } = useToast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-500';
      case 'declined':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  const handleAccept = () => {
    if (onAccept) {
      onAccept(request.id);
      toast({
        title: "Request Accepted",
        description: "You have accepted the tutoring request. The student will be notified.",
      });
    }
  };

  const handleDecline = () => {
    if (onDecline) {
      onDecline(request.id);
      toast({
        title: "Request Declined",
        description: "You have declined the tutoring request. The student will be notified.",
      });
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
              Subject: {request.subject}
            </p>
          </div>
          <Badge className={getStatusColor(request.status)}>
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Submitted: {format(request.createdAt, 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            Preferred Times: {request.preferredTimes}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Message:</h4>
          <p className="text-sm text-muted-foreground">{request.message}</p>
        </div>

        {showActions && request.status === 'pending' && (
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
