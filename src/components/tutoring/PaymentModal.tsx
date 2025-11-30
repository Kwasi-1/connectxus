import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TutoringRequest } from "@/api/mentorship.api";
import {
  CreditCard,
  Shield,
  CheckCircle2,
  Info,
  X,
  Lightbulb,
} from "lucide-react";
import { PaystackButton } from "react-paystack";
import { variables } from "@/utils/env";
import { useCurrency } from "@/hooks/useCurrency";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: TutoringRequest;
  tutorName: string;
  hourlyRate: number;
  semesterRate?: number; // Optional semester rate set by tutor
  userEmail: string;
  onPayment: (sessionType: "single" | "semester", reference: string) => void;
  isLoading?: boolean;
}

// Onboarding popup for first-time payment
function EscrowOnboarding({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-background rounded shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-accent transition-colors"
          aria-label="Close onboarding"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Shield className="h-12 w-12 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Secure Payment Protection</h2>
            <p className="text-muted-foreground">
              Your payment is safe with our escrow system
            </p>
          </div>

          <div className="w-full space-y-3 text-left">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">1</span>
              </div>
              <div>
                <p className="font-medium">Payment Held Securely</p>
                <p className="text-sm text-muted-foreground">
                  Your money is held in escrow until the session is completed
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">2</span>
              </div>
              <div>
                <p className="font-medium">Complete Your Session</p>
                <p className="text-sm text-muted-foreground">
                  Attend your tutoring session and mark it as complete
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">3</span>
              </div>
              <div>
                <p className="font-medium">Tutor Gets Paid</p>
                <p className="text-sm text-muted-foreground">
                  Payment is released to the tutor on the next payout date
                </p>
              </div>
            </div>
          </div>

          {/* Advice for first-time users */}
          <div className="w-full rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-left">
            <div className="flex gap-2">
              <Lightbulb className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Pro Tip
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  Start with a single session to build trust and ensure the
                  tutor is a good fit before committing to bulk or semester
                  packages.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full pt-2">
            <Button onClick={onClose} className="w-full" size="lg">
              Got it!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentModal({
  open,
  onOpenChange,
  request,
  tutorName,
  hourlyRate,
  semesterRate,
  userEmail,
  onPayment,
  isLoading = false,
}: PaymentModalProps) {
  const [selectedType, setSelectedType] = useState<"single" | "semester">(
    request.session_type || "single"
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [bulkEnabled, setBulkEnabled] = useState(false);
  const [bulkSessionCount, setBulkSessionCount] = useState(12);
  const { formatCurrency } = useCurrency();

  // Check if user has seen onboarding before
  useEffect(() => {
    if (open) {
      const hasSeenOnboarding = localStorage.getItem(
        "tutoring_payment_onboarding_seen"
      );
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [open]);

  const handleCloseOnboarding = () => {
    localStorage.setItem("tutoring_payment_onboarding_seen", "true");
    setShowOnboarding(false);
  };

  // Calculate pricing based on tutor's rates
  const singlePrice = hourlyRate;
  const semesterPrice = semesterRate || hourlyRate * bulkSessionCount; // Use bulk count if no semester rate
  const hasSemesterRate = !!semesterRate;

  const selectedPrice = selectedType === "single" ? singlePrice : semesterPrice;

  // Generate unique reference for this transaction
  const reference = `TUT-${Date.now()}-${Math.random()
    .toString(36)
    .substring(7)}`;

  // Paystack configuration
  const paystackConfig = {
    reference,
    email: userEmail,
    amount: Math.round(selectedPrice * 100), // Convert to pesewas
    currency: "GHS",
    publicKey:
      variables().PAYSTACK_PUBLIC_API_KEY ||
      "pk_test_c8e9fcf6be7da2f938b8d277203a0b781fff6c39",
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

  const handlePaystackSuccessAction = (reference: any) => {
    onPayment(selectedType, reference.reference);
    onOpenChange(false); // Close modal after successful payment
  };

  const handlePaystackCloseAction = () => {
    console.log("Payment popup closed");
  };

  // Close modal when Paystack button is clicked
  const handlePaystackClick = () => {
    onOpenChange(false);
  };

  const refundWindow = selectedType === "single" ? "1 week" : "2 weeks";

  const componentProps = {
    ...paystackConfig,
    text: (
      <span className="flex items-center">
        <CreditCard className="h-4 w-4 mr-2" />
        Pay {formatCurrency(selectedPrice)}
      </span>
    ),
    onSuccess: handlePaystackSuccessAction,
    onClose: handlePaystackCloseAction,
  };

  return (
    <>
      {showOnboarding && <EscrowOnboarding onClose={handleCloseOnboarding} />}

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Complete Payment
            </DialogTitle>
            <DialogDescription>
              Secure your session with {tutorName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Session Summary */}
            <div className="rounded-sm bg-muted/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">{request.subject}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Topic</span>
                <span className="font-medium line-clamp-1">
                  {request.topic}
                </span>
              </div>
            </div>

            {/* Pricing Options */}
            <div className="space-y-3">
              {/* Single Session */}
              {!bulkEnabled && (
                <button
                  onClick={() => setSelectedType("single")}
                  className={`w-full text-left rounded-sm border-2 p-4 transition-all ${
                    selectedType === "single"
                      ? "border-foreground shadow-sm"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Single Session</h4>
                      {selectedType === "single" && (
                        <CheckCircle2 className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                    <div className="flex items-center text-xl font-bold">
                      {formatCurrency(singlePrice)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One tutoring session
                  </p>
                </button>
              )}

              {/* Semester Package - Only show if tutor has set a semester rate */}
              {hasSemesterRate ? (
                <button
                  onClick={() => setSelectedType("semester")}
                  className={`w-full text-left rounded-sm border-2 p-4 transition-all ${
                    selectedType === "semester"
                      ? "border-foreground shadow-sm"
                      : "border-border hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">Semester Package</h4>
                      {selectedType === "semester" && (
                        <CheckCircle2 className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                    <div className="flex items-center text-xl font-bold">
                      {formatCurrency(semesterPrice)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    12 sessions package
                  </p>
                </button>
              ) : (
                /* Bulk Sessions Toggle - Show if no semester rate */
                <div className="rounded-sm border-2 border-border p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Bulk Sessions</h4>
                      <p className="text-sm text-muted-foreground">
                        Pay for multiple sessions upfront
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setBulkEnabled(!bulkEnabled);
                        if (!bulkEnabled) {
                          setSelectedType("semester");
                        } else {
                          setSelectedType("single");
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        bulkEnabled
                          ? "bg-primary"
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                      aria-label="Toggle bulk sessions"
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          bulkEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  {bulkEnabled && (
                    <div className="space-y-4 pt-3 border-t border-border">
                      <div className="space-y-3">
                        <label className="text-sm font-medium">
                          Number of Sessions
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() =>
                              setBulkSessionCount(
                                Math.max(2, bulkSessionCount - 1)
                              )
                            }
                            className="h-10 w-10 rounded-sm border border-border hover:bg-accent flex items-center justify-center font-medium"
                            aria-label="Decrease session count"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="2"
                            max="20"
                            value={bulkSessionCount}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 2;
                              setBulkSessionCount(
                                Math.min(20, Math.max(2, value))
                              );
                            }}
                            className="w-24 h-10 text-center text-lg font-semibold rounded-sm border border-border bg-background [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Number of bulk sessions"
                          />
                          <button
                            onClick={() =>
                              setBulkSessionCount(
                                Math.min(20, bulkSessionCount + 1)
                              )
                            }
                            className="h-10 w-10 rounded-sm border border-border hover:bg-accent flex items-center justify-center font-medium"
                            aria-label="Increase session count"
                          >
                            +
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Min: 2 sessions • Max: 20 sessions
                        </p>
                      </div>

                      <div className="rounded-sm bg-muted/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {bulkSessionCount} sessions ×{" "}
                            {formatCurrency(hourlyRate)}
                          </span>
                          <span className="text-lg font-bold">
                            {formatCurrency(semesterPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Refund Info */}
            <div className="rounded-sm bg-amber-50 dark:bg-amber-950/20 p-4 flex gap-3">
              <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                  Refund Policy
                </p>
                <p className="text-amber-700 dark:text-amber-300">
                  70% refund available within {refundWindow} of payment
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <div onClick={handlePaystackClick} className="flex-1">
                <PaystackButton
                  {...componentProps}
                  className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-sm text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
