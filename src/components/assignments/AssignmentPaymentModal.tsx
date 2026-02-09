import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Application, Assignment } from "@/types/accounts";
import {
  DollarSign,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { initializeAssignmentPayment } from "@/api/accounts.api";
import { toast } from "sonner";

interface AssignmentPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignment: Assignment;
  application: Application;
  userEmail: string;
  onPayment: (reference: string) => void;
  isLoading?: boolean;
}

const PLATFORM_FEE_PERCENTAGE = 0.15;

export function AssignmentPaymentModal({
  open,
  onOpenChange,
  assignment,
  application,
  userEmail,
  onPayment,
  isLoading = false,
}: AssignmentPaymentModalProps) {
  const { formatCurrency } = useCurrency();
  const [isInitializing, setIsInitializing] = useState(false);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);

  const calculatePricing = () => {
    const baseAmount = Number(assignment.price) + Number(assignment.gift);
    const platformFee = baseAmount * PLATFORM_FEE_PERCENTAGE;
    const total = baseAmount + platformFee;
    const helperAmount = baseAmount;

    return {
      baseAmount,
      platformFee,
      total,
      helperAmount,
    };
  };

  const pricing = calculatePricing();
  const refundWindow = "24 hours";

  const handlePayment = async () => {
    if (isInitializing || isLoading) return;

    setIsInitializing(true);
    try {
      const paymentData = await initializeAssignmentPayment({
        application_id: application.id,
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
          onPayment(paymentData.reference);
          onOpenChange(false);
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
            Secure your assignment with {application.applicant_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="rounded-lg border p-4 space-y-2">
            <h3 className="font-semibold">Assignment Details</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Helper:</div>
              <div className="font-medium">
                {application.applicant_name || "Unknown"}
              </div>
              <div className="text-muted-foreground">Assignment:</div>
              <div className="font-medium line-clamp-2">{assignment.title}</div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Payment Breakdown</h3>

            <div className="rounded-lg border p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Assignment price:
                  </span>
                  <span>{formatCurrency(Number(assignment.price))}</span>
                </div>
                {Number(assignment.gift) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Gift/Bonus:</span>
                    <span>+{formatCurrency(Number(assignment.gift))}</span>
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

          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 flex gap-3">
              <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Secure Escrow Payment
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Your payment is held securely until you mark the assignment as
                  completed. The helper receives payment on a biweekly payout
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
                  this period, refunds are subject to review.
                </p>
              </div>
            </div>
          </div>

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
              {isInitializing
                ? "Initializing..."
                : `Pay ${formatCurrency(pricing.total)}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
