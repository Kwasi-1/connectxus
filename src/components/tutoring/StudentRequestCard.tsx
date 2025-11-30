import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TutoringRequest } from "@/api/mentorship.api";
import {
  Calendar,
  Clock,
  MessageCircle,
  CreditCard,
  Star,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HourglassIcon,
  RefreshCw,
  DollarSign,
} from "lucide-react";
import { format, isPast, addWeeks } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface StudentRequestCardProps {
  request: TutoringRequest;
  onProceedToPayment?: (request: TutoringRequest) => void;
  onMessageTutor?: (request: TutoringRequest) => void;
  onRequestAgain?: (request: TutoringRequest) => void;
  onRequestRefund?: (request: TutoringRequest) => void;
  onReviewSession?: (request: TutoringRequest) => void;
}

export function StudentRequestCard({
  request,
  onProceedToPayment,
  onMessageTutor,
  onRequestAgain,
  onRequestRefund,
  onReviewSession,
}: StudentRequestCardProps) {
  const { formatCurrency } = useCurrency();

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          variant: "secondary" as const,
          icon: HourglassIcon,
          label: "Pending",
          description: "Waiting for tutor response",
        };
      case "accepted":
        return {
          variant: "default" as const,
          icon: CheckCircle2,
          label: "Accepted",
          description: "Tutor accepted your request",
        };
      case "declined":
        return {
          variant: "destructive" as const,
          icon: XCircle,
          label: "Declined",
          description: "Tutor declined your request",
        };
      case "expired":
        return {
          variant: "outline" as const,
          color: "bg-gray-500",
          icon: Clock,
          label: "Expired",
          description: "Request timed out after 24 hours",
        };
      case "paid":
        return {
          color: "bg-green-500",
          variant: "default" as const,
          icon: CreditCard,
          label: "Paid",
          description: "Payment completed - ready to schedule",
        };
      case "completed":
        return {
          variant: "secondary" as const,
          icon: Star,
          label: "Completed",
          description: "Session completed",
        };
      case "refund_pending":
        return {
          variant: "outline" as const,
          icon: AlertCircle,
          label: "Refund Pending",
          description: "Refund request under review",
        };
      default:
        return {
          variant: "outline" as const,
          icon: AlertCircle,
          label: status,
          description: "",
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  // Check if session is completed (1 week after scheduled time or has rating)
  const isSessionCompleted = () => {
    if (request.rating) return true;
    if (request.preferred_schedule && request.preferred_schedule.length > 0) {
      // Simplified check - in real app, you'd check actual scheduled_at date
      const scheduledDate = new Date(request.created_at);
      const completionDate = addWeeks(scheduledDate, 1);
      return isPast(completionDate);
    }
    return false;
  };

  const isRefundEligible = () => {
    if (!request.payment_details?.refund_eligible_until) return false;
    return !isPast(new Date(request.payment_details.refund_eligible_until));
  };

  const showCompletedActions =
    request.status === "paid" && isSessionCompleted();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold text-lg truncate">
                {request.subject}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Tutor:{" "}
              {request.tutor_full_name || request.tutor_username || "Unknown"}
            </p>
          </div>
          <Badge variant={statusConfig.variant} className={`flex-shrink-0 ${statusConfig.color}`}>
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Topic */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Topic</p>
          <p className="text-sm">{request.topic}</p>
        </div>

        {/* Session Details Grid */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border">
          {/* Session Type */}
          {request.session_type && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Session Type</p>
              <p className="text-sm font-medium">
                {request.session_type === "single"
                  ? "Single Session"
                  : "Semester Package"}
              </p>
            </div>
          )}

          {/* Created Date */}
          {request.created_at && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Requested</p>
              <p className="text-sm font-medium">
                {format(new Date(request.created_at), "MMM dd, yyyy")}
              </p>
            </div>
          )}
        </div>

        {/* Preferred Schedule */}
        {request.preferred_schedule &&
          request.preferred_schedule.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Preferred Schedule
              </p>
              <div className="flex flex-wrap gap-2">
                {request.preferred_schedule.map((slot, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Payment Details */}
        {request.payment_details && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="text-sm font-semibold">
                {formatCurrency(request.payment_details.amount)}
              </span>
            </div>
            {request.payment_details.refund_eligible_until && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Refund Eligible Until
                </span>
                <span className="text-xs font-medium">
                  {format(
                    new Date(request.payment_details.refund_eligible_until),
                    "MMM dd, yyyy"
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Rating */}
        {request.rating && (
          <div className="flex items-center gap-2 py-2">
            <span className="text-sm text-muted-foreground">Your Rating:</span>
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < request.rating!
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tutor's Response */}
        {request.response_message && (
          <div className="rounded-lg bg-muted/50 p-4 space-y-1">
            <p className="text-sm font-medium">Tutor's Response</p>
            <p className="text-sm text-muted-foreground">
              {request.response_message}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-2">
          {/* Accepted: Show Payment Button */}
          {request.status === "accepted" && onProceedToPayment && (
            <Button
              onClick={() => onProceedToPayment(request)}
              className="w-full"
              size="lg"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          )}

          {/* Paid: Show Message Button */}
          {request.status === "paid" &&
            !showCompletedActions &&
            onMessageTutor && (
              <Button
                onClick={() => onMessageTutor(request)}
                variant="default"
                className="w-full"
                size="lg"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Tutor
              </Button>
            )}

          {/* Completed: Show Request Again, Refund, and Review */}
          {showCompletedActions && (
            <div className="space-y-2">
              {!request.rating && onReviewSession && (
                <Button
                  onClick={() => onReviewSession(request)}
                  variant="default"
                  className="w-full bg-foreground hover:bg-foreground/80 text-white"
                  size="lg"
                >
                  <Star className="h-4 w-4 mr-2" />
                  Review Session
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                {onRequestAgain && (
                  <Button
                    onClick={() => onRequestAgain(request)}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Request Again
                  </Button>
                )}

                {isRefundEligible() && onRequestRefund && (
                  <Button
                    onClick={() => onRequestRefund(request)}
                    variant="outline"
                    size="sm"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Refund
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
