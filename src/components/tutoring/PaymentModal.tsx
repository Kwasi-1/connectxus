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
import { TutoringRequest } from "@/api/mentorship.api";
import {
  DollarSign,
  CreditCard,
  Shield,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { PaystackButton } from "react-paystack";
import { variables } from "@/utils/env";

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
  const [selectedType, setSelectedType] = useState<"single" | "semester">(
    request.session_type || "single"
  );

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

  const singlePricing = calculatePricing("single");
  const semesterPricing = calculatePricing("semester");

  const selectedPricing =
    selectedType === "single" ? singlePricing : semesterPricing;

  // Generate unique reference for this transaction
  const reference = `TUT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;

  // Paystack configuration
  const paystackConfig = {
    reference,
    email: userEmail,
    amount: Math.round(selectedPricing.total * 100), // Convert to kobo (smallest currency unit)
    publicKey: variables().PAYSTACK_PUBLIC_API_KEY || "",
    metadata: {
      custom_fields: [
        {
          display_name: "Tutor Name",
          variable_name: "tutor_name",
          value: tutorName,
        },
        {
          display_name: "Subject",
          variable_name: "subject",
          value: request.subject,
        },
        {
          display_name: "Session Type",
          variable_name: "session_type",
          value: selectedType,
        },
        {
          display_name: "Request ID",
          variable_name: "request_id",
          value: request.id,
        },
      ],
    },
  };

  // Payment success callback
  const handlePaystackSuccessAction = (reference: any) => {
    onPayment(selectedType, reference.reference);
  };

  // Payment close callback (user closed popup)
  const handlePaystackCloseAction = () => {
    // User closed the payment popup
    console.log("Payment popup closed");
  };

  const refundWindow = selectedType === "single" ? "1 week" : "2 weeks";

  const componentProps = {
    ...paystackConfig,
    text: (
      <span className="flex items-center">
        <CreditCard className="h-4 w-4 mr-2" />
        Pay ${selectedPricing.total.toFixed(2)}
      </span>
    ),
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
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
              <div className="font-medium">{request.subject}</div>
              <div className="text-muted-foreground">Topic:</div>
              <div className="font-medium line-clamp-2">{request.topic}</div>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="space-y-3">
            <h3 className="font-semibold">Select Payment Option</h3>

            {/* Single Session Option */}
            <button
              onClick={() => setSelectedType("single")}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                selectedType === "single"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Single Session</h4>
                    {selectedType === "single" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    One tutoring session
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Session rate:
                      </span>
                      <span>${singlePricing.baseAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Platform fee (15%):
                      </span>
                      <span>${singlePricing.platformFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {singlePricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Semester Package Option */}
            <button
              onClick={() => setSelectedType("semester")}
              className={`w-full text-left rounded-lg border-2 p-4 transition-all ${
                selectedType === "semester"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">Semester Package</h4>
                    <Badge variant="default" className="text-xs">
                      Save ${semesterPricing.discount.toFixed(0)}
                    </Badge>
                    {selectedType === "semester" && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    12 sessions with 15% discount
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Regular price:
                      </span>
                      <span className="line-through">
                        ${semesterPricing.baseAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Discounted (15% off):</span>
                      <span>
                        ${semesterPricing.discountedAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Platform fee (15%):
                      </span>
                      <span>${semesterPricing.platformFee.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>Total:</span>
                      <span className="flex items-center">
                        <DollarSign className="h-4 w-4" />
                        {semesterPricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
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
                  this period, refunds are subject to review.
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
              disabled={isLoading}
            >
              Cancel
            </Button>
            <PaystackButton
              {...componentProps}
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
              disabled={isLoading}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
