import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMentorshipRequestStatus,
  MentorshipRequest,
} from "@/api/mentorship.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageCircle,
  User,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface MentorshipRequestDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: MentorshipRequest | null;
  isMentor: boolean;
}

export const MentorshipRequestDetailsModal = ({
  open,
  onOpenChange,
  request,
  isMentor,
}: MentorshipRequestDetailsModalProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const updateStatusMutation = useMutation({
    mutationFn: ({
      requestId,
      status,
      responseMessage,
    }: {
      requestId: string;
      status: "approved" | "rejected" | "cancelled";
      responseMessage?: string;
    }) => updateMentorshipRequestStatus(requestId, status, responseMessage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentoring-requests-sent"] });
      queryClient.invalidateQueries({
        queryKey: ["mentoring-requests-received"],
      });
      toast.success("Request updated successfully");
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update request");
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const messageMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateDirectConversation(userId),
    onSuccess: (response) => {
      navigate(`/messages/${response.conversation_id}`);
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to start conversation"
      );
    },
  });

  const handleAccept = () => {
    if (!request) return;
    setIsProcessing(true);
    updateStatusMutation.mutate({ requestId: request.id, status: "approved" });
  };

  const handleDecline = () => {
    if (!request) return;
    setIsProcessing(true);
    updateStatusMutation.mutate({ requestId: request.id, status: "rejected" });
  };

  const handleMessage = () => {
    if (!request) return;
    const userId = isMentor ? request.requester_id : request.session_id;
    messageMutation.mutate(userId);
  };

  if (!request) return null;

  const isReceived = isMentor && request.status === "pending";

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "approved":
        return "default";
      case "rejected":
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const participantName = isMentor
    ? request.requester_full_name || request.requester_username || "Unknown"
    : request.mentor_full_name || request.mentor_username || "Unknown";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mentorship Request Details</DialogTitle>
          <DialogDescription>
            {isMentor
              ? "Review and manage this mentorship request"
              : "View your mentorship request details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Status
            </span>
            <Badge
              variant={getStatusBadgeVariant(request.status)}
              className="capitalize"
            >
              {request.status}
            </Badge>
          </div>

          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={request.requester_avatar}
                alt={participantName}
              />
              <AvatarFallback>
                {participantName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">
                {isMentor ? "Requester" : "Mentor"}
              </p>
              <p className="text-sm text-muted-foreground">{participantName}</p>
              {isMentor && request.requester_department && (
                <p className="text-xs text-muted-foreground">
                  {request.requester_department}{" "}
                  {request.requester_level && `• ${request.requester_level}`}
                </p>
              )}
            </div>
          </div>

          {!isMentor && request.industry && (
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Industry</p>
                <p className="text-sm text-muted-foreground">
                  {request.industry}
                </p>
              </div>
            </div>
          )}

          {!isMentor &&
            request.specialties &&
            request.specialties.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {request.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {request.requested_at && (
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Requested On</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(request.requested_at), "PPP")}
                </p>
              </div>
            </div>
          )}

          {request.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Message</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.message}
              </p>
            </div>
          )}

          {request.response_message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Response</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {request.response_message}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleMessage}
            disabled={messageMutation.isPending}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>

          {isReceived ? (
            <>
              <Button
                variant="outline"
                onClick={handleDecline}
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline
              </Button>
              <Button onClick={handleAccept} disabled={isProcessing}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
