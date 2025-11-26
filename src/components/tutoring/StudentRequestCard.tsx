import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "lucide-react";
import { format, isPast } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface StudentRequestCardProps {
  request: TutoringRequest;
  onProceedToPayment?: (request: TutoringRequest) => void;
  onMessageTutor?: (request: TutoringRequest) => void;
  onMarkComplete?: (request: TutoringRequest) => void;
  onRequestRefund?: (request: TutoringRequest) => void;
}

export function StudentRequestCard({
  request,
  onProceedToPayment,
  onMessageTutor,
  onMarkComplete,
  onRequestRefund,
}: StudentRequestCardProps) {
  const { formatCurrency } = useCurrency();
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-yellow-500",
          icon: HourglassIcon,
          label: "Pending",
          description: "Waiting for tutor response",
        };
      case "accepted":
        return {
          color: "bg-green-500",
          icon: CheckCircle2,
          label: "Accepted",
          description: "Tutor accepted your request",
        };
      case "declined":
        return {
          color: "bg-red-500",
          icon: XCircle,
          label: "Declined",
          description: "Tutor declined your request",
        };
      case "expired":
        return {
          color: "bg-gray-500",
          icon: Clock,
          label: "Expired",
          description: "Request timed out after 24 hours",
        };
      case "paid":
        return {
          color: "bg-blue-500",
          icon: CreditCard,
          label: "Paid",
          description: "Payment completed - ready to schedule",
        };
      case "completed":
        return {
          color: "bg-purple-500",
          icon: Star,
          label: "Completed",
          description: "Session completed",
        };
      case "refund_pending":
        return {
          color: "bg-orange-500",
          icon: AlertCircle,
          label: "Refund Pending",
          description: "Refund request under review",
        };
      default:
        return {
          color: "bg-gray-500",
          icon: AlertCircle,
          label: status,
          description: "",
        };
    }
  };

  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;

  const isRefundEligible = () => {
    if (!request.payment_details?.refund_eligible_until) return false;
    return !isPast(new Date(request.payment_details.refund_eligible_until));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              {request.subject}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Tutor:{" "}
              {request.tutor_full_name || request.tutor_username || "Unknown"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {statusConfig.description}
            </p>
          </div>
          <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Topic */}
        <div>
          <h4 className="font-medium text-sm mb-1">Topic:</h4>
          <p className="text-sm text-muted-foreground">{request.topic}</p>
        </div>

        {/* Schedule */}
        {request.preferred_schedule &&
          request.preferred_schedule.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2">Preferred Schedule:</h4>
              <div className="flex flex-wrap gap-1">
                {request.preferred_schedule.map((slot, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

        {/* Session Type */}
        {request.session_type && (
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground mr-2">Session Type:</span>
            <Badge variant="outline">
              {request.session_type === "single"
                ? "Single Session"
                : "Semester Package (12 sessions)"}
            </Badge>
          </div>
        )}

        {/* Created Date */}
        {request.created_at && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
            Requested: {format(new Date(request.created_at), "MMM dd, yyyy")}
          </div>
        )}

        {/* Payment Details */}
        {request.payment_details && (
          <div className="rounded-lg bg-muted p-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-medium">
                {formatCurrency(request.payment_details.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Refund Eligible Until:
              </span>
              <span className="text-xs">
                {format(
                  new Date(request.payment_details.refund_eligible_until),
                  "MMM dd, yyyy"
                )}
              </span>
            </div>
          </div>
        )}

        {/* Rating */}
        {request.rating && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Rating:</span>
            <div className="flex items-center">
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

        {/* Response Message */}
        {request.response_message && (
          <div className="rounded-lg bg-muted p-3">
            <h4 className="font-medium text-sm mb-1">Tutor's Response:</h4>
            <p className="text-sm text-muted-foreground">
              {request.response_message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          {request.status === "accepted" && onProceedToPayment && (
            <Button
              onClick={() => onProceedToPayment(request)}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Proceed to Payment
            </Button>
          )}

          {request.status === "paid" && onMessageTutor && (
            <Button
              onClick={() => onMessageTutor(request)}
              variant="outline"
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Message Tutor
            </Button>
          )}

          {request.status === "paid" && onMarkComplete && (
            <Button
              onClick={() => onMarkComplete(request)}
              variant="default"
              className="flex-1"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Mark as Completed
            </Button>
          )}

          {request.status === "paid" &&
            isRefundEligible() &&
            onRequestRefund && (
              <Button
                onClick={() => onRequestRefund(request)}
                variant="outline"
                size="sm"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Request Refund
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
