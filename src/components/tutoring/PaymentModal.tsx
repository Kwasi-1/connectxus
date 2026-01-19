import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TutoringRequest, initializeTutoringPayment, verifyTutoringPayment } from "@/api/tutoring.api";
import {
  DollarSign,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: TutoringRequest;
  tutorName: string;
  hourlyRate: number;
  userEmail: string;
  onPayment: (sessionType: "single" | "semester", reference: string) => void;
  isLoading?: boolean;
}

const PLATFORM_FEE_PERCENTAGE = 0.15;

export function PaymentModal({
  open,
  onOpenChange,
  request,
  tutorName,
  hourlyRate,
  userEmail,
  onPayment,
  isLoading = false,
}: PaymentModalProps) {
  const sessionType = request.session_type || "single";
  const { formatCurrency } = useCurrency();
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const calculatePricing = (type: "single" | "semester") => {
    const baseAmount = type === "single" ? hourlyRate : hourlyRate * 12;
    const discount = type === "semester" ? 0.15 : 0;
    const discountedAmount = baseAmount * (1 - discount);
    const platformFee = discountedAmount * PLATFORM_FEE_PERCENTAGE;
    const total = discountedAmount + platformFee;
    const tutorAmount = discountedAmount;

    return {
      baseAmount,
      discount: baseAmount * discount,
      discountedAmount,
      platformFee,
      total,
      tutorAmount,
    };
  };

  const pricing = calculatePricing(sessionType);

  const refundWindow = "24 hours";

  const handlePayment = async () => {
    if (isInitializing || isLoading) return;

    setIsInitializing(true);
    try {
      if (pricing.total === 0) {
        toast.success("Session activated! (No payment required)");
        onPayment(sessionType, "free-session");
        onOpenChange(false);
        setIsInitializing(false);
        return;
      }

      const paymentData = await initializeTutoringPayment({
        request_id: request.id,
      });

      setPaymentReference(paymentData.reference);

      const width = 600;
      const height = 700;
      const left = window.innerWidth / 2 - width / 2;
      const top = window.innerHeight / 2 - height / 2;

      const paymentWindow = window.open(
        paymentData.authorization_url,
        "PaystackPayment",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      const pollTimer = setInterval(async () => {
        if (paymentWindow && paymentWindow.closed) {
          clearInterval(pollTimer);
          setIsInitializing(false);

          try {
            const verifiedPayment = await verifyTutoringPayment({
              reference: paymentData.reference,
            });

            toast.success("Payment successful!");
            onPayment(sessionType, paymentData.reference);
            onOpenChange(false);
          } catch (error: any) {
            console.error("Payment verification failed:", error);
            toast.error(
              error?.response?.data?.error?.message || "Payment verification failed"
            );
          }
        }
      }, 500);
    } catch (error: any) {
      setIsInitializing(false);
      console.error("Payment initialization failed:", error);
      toast.error(
        error?.response?.data?.error?.message || "Failed to initialize payment"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Payment
          </DialogTitle>
          <DialogDescription>
            Secure your tutoring session with {tutorName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Details */}
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold">Session Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Tutor:</div>
              <div className="font-medium">{tutorName}</div>
              <div className="text-muted-foreground">Subject:</div>
              <div className="font-medium line-clamp-2">
                {request.subject || "Tutoring Session"}
              </div>
            </div>
          </div>

          {/* Session Type & Pricing */}
          <div className="space-y-3">
            <h3 className="font-semibold">Payment Details</h3>

            {/* Display session type (read-only) */}
            <div className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">
                      {sessionType === "single"
                        ? "Single Session"
                        : "Semester Package"}
                    </h4>
                    {sessionType === "semester" && (
                      <Badge variant="default" className="text-xs">
                        Save{" "}
                        {formatCurrency(pricing.discount, {
                          decimals: 0,
                        })}
                      </Badge>
                    )}
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {sessionType === "single"
                      ? "One tutoring session"
                      : "12 sessions with 15% discount"}
                  </p>
                  <div className="space-y-1 text-sm">
                    {sessionType === "semester" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Regular price:
                          </span>
                          <span className="line-through">
                            {formatCurrency(pricing.baseAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Discounted (15% off):</span>
                          <span>
                            {formatCurrency(pricing.discountedAmount)}
                          </span>
                        </div>
                      </>
                    )}
                    {sessionType === "single" && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Session rate:
                        </span>
                        <span>{formatCurrency(pricing.baseAmount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Platform fee (15%):
                      </span>
                      <span>{formatCurrency(pricing.platformFee)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span className="flex items-center">
                        {formatCurrency(pricing.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notices */}
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Secure Escrow Payment
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your payment is held securely until you mark the session as
                  completed. The tutor receives payment on a biweekly payout
                  schedule.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Refund Policy
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Full refund available within {refundWindow} of payment. After
                  this period, refunds are no longer available.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading || isInitializing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isInitializing || isLoading}
              className="inline-flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {isInitializing ? "Initializing..." : `Pay ${formatCurrency(pricing.total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
