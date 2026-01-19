import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutoringRequest as ApiTutoringRequest } from "@/api/tutoring.api";
import { getOrCreateDirectConversation } from "@/api/messaging.api";
import {
  Calendar,
  Check,
  X,
  User,
  MessageCircle,
  Phone,
  XCircle,
  DollarSign,
  RefreshCw,
  Star,
} from "lucide-react";
import {
  format,
  parseISO,
  differenceInHours,
  differenceInDays,
} from "date-fns";
import { toast } from "sonner";
import { CancelRequestModal } from "./CancelRequestModal";

interface TutoringRequestCardProps {
  request: ApiTutoringRequest;
  onAccept?: (requestId: string) => void;
  onDecline?: (requestId: string) => void;
  onMessage?: (request: ApiTutoringRequest) => void;
  onCall?: (request: ApiTutoringRequest) => void;
  onCancel?: (requestId: string, reason: string) => void;
  onPay?: (request: ApiTutoringRequest) => void;
  onRequestRefund?: (request: ApiTutoringRequest) => void;
  onComplete?: (request: ApiTutoringRequest) => void;
  onRate?: (request: ApiTutoringRequest) => void;
  onRequestAgain?: (request: ApiTutoringRequest) => void;
  onCancelRequest?: (requestId: string, reason: string) => void;
  showActions?: boolean;
  viewMode?: "student" | "tutor";
}

export function TutoringRequestCard({
  request,
  onAccept,
  onDecline,
  onMessage,
  onCall,
  onCancel,
  onPay,
  onRequestRefund,
  onComplete,
  onRate,
  onRequestAgain,
  onCancelRequest,
  showActions = true,
  viewMode = "student",
}: TutoringRequestCardProps) {
  const navigate = useNavigate();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  
  
  const canComplete = (): boolean => {
    if (!request.schedules || request.schedules.length === 0) {
      return true; 
    }

    try {
      
      const scheduleDates = request.schedules
        .map((s) => {
          try {
            return parseISO(s);
          } catch {
            return null;
          }
        })
        .filter((d): d is Date => d !== null);

      if (scheduleDates.length === 0) {
        return true; 
      }

      
      const lastSchedule = scheduleDates.reduce((latest, current) =>
        current > latest ? current : latest
      );

      const now = new Date();

      
      return now >= lastSchedule;
    } catch (error) {
      return true; 
    }
  };

  
  const isRefundEligible = (): boolean => {
    if (!request.schedules || request.schedules.length === 0) {
      return true; 
    }

    try {
      
      const scheduleDates = request.schedules
        .map((s) => {
          try {
            return parseISO(s);
          } catch {
            return null;
          }
        })
        .filter((d): d is Date => d !== null);

      if (scheduleDates.length === 0) {
        return true; 
      }

      
      const lastSchedule = scheduleDates.reduce((latest, current) =>
        current > latest ? current : latest
      );

      const now = new Date();

      if (request.session_type === "single") {
        
        const hoursDiff = differenceInHours(lastSchedule, now);
        return hoursDiff >= -24 && hoursDiff <= 24;
      } else {
        
        const daysDiff = differenceInDays(lastSchedule, now);
        return daysDiff >= -14 && daysDiff <= 14;
      }
    } catch (error) {
      
      return true;
    }
  };

  
  const createConversationMutation = useMutation({
    mutationFn: (userId: string) => getOrCreateDirectConversation(userId),
    onSuccess: (data) => {
      navigate(`/messages/${data.conversation_id}`);
      toast.success("Opening chat...");
    },
    onError: () => {
      toast.error("Failed to open chat");
    },
  });

  const handleMessage = () => {
    const targetUserId =
      viewMode === "student" ? request.tutor_id : request.requester_id;
    if (targetUserId) {
      createConversationMutation.mutate(targetUserId);
    } else {
      toast.error("Unable to message user");
    }
  };

  const handleCall = () => {
    const phoneNumber =
      viewMode === "student" ? request.tutor_phone : request.requester_phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error("Phone number not available");
    }
  };

  const handleCancelWithReason = (reason: string) => {
    if (viewMode === "student" && onCancelRequest) {
      onCancelRequest(request.id, reason);
    } else if (viewMode === "tutor" && onCancel) {
      onCancel(request.id, reason);
    }
    setCancelModalOpen(false);
  };

  const getStatusConfig = () => {
    
    if (request.session_status === "completed") {
      return { color: "bg-purple-500", label: "Completed" };
    }
    if (request.session_status === "cancelled") {
      return { color: "bg-gray-500", label: "Cancelled" };
    }
    if (
      request.payment_status === "paid" &&
      request.session_status === "ongoing"
    ) {
      return { color: "bg-blue-500", label: "Active" };
    }

    
    if (
      request.session_status === "accepted" &&
      request.payment_status === "not_paid"
    ) {
      return { color: "bg-green-500", label: "Awaiting Payment" };
    }

    
    if (!request.responded_at && request.session_status === "pending") {
      return { color: "bg-yellow-500", label: "Pending" };
    }

    return { color: "bg-gray-500", label: "Unknown" };
  };

  const statusConfig = getStatusConfig();

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
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5" />
              {request.subject || "Tutoring Request"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              From:{" "}
              {request.requester_full_name ||
                request.requester_username ||
                "Student"}
            </p>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
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

        {request.session_type && (
          <div>
            <h4 className="font-medium mb-2">Session Type:</h4>
            <Badge variant="outline">
              {request.session_type === "single"
                ? "Single Session"
                : "Semester Package (12 sessions)"}
            </Badge>
          </div>
        )}

        {showActions && (
          <div className="flex flex-wrap gap-2 pt-4">
            
            {viewMode === "tutor" && (
              <>
                
                {!request.responded_at && (
                  <>
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
                  </>
                )}

                
                {request.payment_status === "paid" &&
                  request.session_status === "ongoing" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMessage}
                        disabled={createConversationMutation.isPending}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCall}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      {onComplete && canComplete() && (
                        <Button
                          size="sm"
                          onClick={() => onComplete(request)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      {onCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setCancelModalOpen(true)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Session
                        </Button>
                      )}
                    </>
                  )}
              </>
            )}

            
            {viewMode === "student" && (
              <>
                
                {!request.responded_at && onCancelRequest && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCancelModalOpen(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Request
                  </Button>
                )}

                
                {request.responded_at &&
                  request.payment_status === "not_paid" &&
                  onPay && (
                    <Button
                      size="sm"
                      onClick={() => onPay(request)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Pay Now
                    </Button>
                  )}

                
                {request.payment_status === "paid" &&
                  request.session_status === "ongoing" && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMessage}
                        disabled={createConversationMutation.isPending}
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleCall}>
                        <Phone className="h-4 w-4 mr-2" />
                        Call
                      </Button>
                      {onRequestRefund && isRefundEligible() && (
                        <>
                          {request.payment_status === "refunded" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-green-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refunded
                            </Button>
                          ) : request.refund_request ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-gray-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refund Requested
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRequestRefund(request)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Request Refund
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}

                
                {request.session_status === "completed" &&
                  request.payment_status === "paid" && (
                    <>
                      {onRequestAgain && (
                        <Button
                          size="sm"
                          onClick={() => onRequestAgain(request)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Request Again
                        </Button>
                      )}
                      {onRate && (
                        <>
                          {request.rating ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-purple-600"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Reviewed
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => onRate(request)}
                              className="bg-purple-600 hover:bg-purple-700"
                            >
                              <Star className="h-4 w-4 mr-2" />
                              Review Session
                            </Button>
                          )}
                        </>
                      )}
                      {onRequestRefund && (
                        <>
                          {request.payment_status === "refunded" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-green-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refunded
                            </Button>
                          ) : request.refund_request ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="text-gray-600"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Refund Requested
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRequestRefund(request)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Request Refund
                            </Button>
                          )}
                        </>
                      )}
                    </>
                  )}
              </>
            )}
          </div>
        )}
      </CardContent>

      
      <CancelRequestModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onConfirm={handleCancelWithReason}
        isPaid={request.payment_status === "paid"}
      />
    </Card>
  );
}