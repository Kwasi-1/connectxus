import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  User,
  AlertCircle,
  Edit,
  Plus,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";
import { getTutorServiceDetails, requestTutorPayout, verifyTutoringPayment } from "@/api/tutoring.api";
import { getMyAccountDetails } from "@/api/accounts.api";
import { AccountModal } from "@/components/assignments/AccountModal";
import { RequestPayoutModal } from "@/components/tutoring/RequestPayoutModal";
import { PaymentModal } from "@/components/tutoring/PaymentModal";
import { toast as sonnerToast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import type { AccountDetail } from "@/types/accounts";

export const MonetizationDetails = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [tutoringPaymentModalOpen, setTutoringPaymentModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountDetail | undefined>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const { data: serviceDetails, isLoading } = useQuery({
    queryKey: ["tutor-service-details", serviceId],
    queryFn: () => getTutorServiceDetails(serviceId!),
    enabled: !!serviceId,
  });

  const { data: accountsData } = useQuery({
    queryKey: ["account-details"],
    queryFn: getMyAccountDetails,
  });

  const accounts = accountsData?.accounts || [];

  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id);
    }
  }, [accounts, selectedAccountId]);

  const requestPayoutMutation = useMutation({
    mutationFn: () => requestTutorPayout(serviceId!),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-service-details", serviceId],
      });
      queryClient.invalidateQueries({ queryKey: ["tutor-services"] });
      sonnerToast.success("Payout request submitted successfully");
      setPayoutModalOpen(false);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.message || "Failed to request payout"
      );
    },
  });

  const paymentVerificationMutation = useMutation({
    mutationFn: (data: { requestId: string; reference: string }) =>
      verifyTutoringPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tutor-service-details", serviceId],
      });
      sonnerToast.success("Payment verified successfully");
      setTutoringPaymentModalOpen(false);
      setSelectedRequest(null);
    },
    onError: (error: any) => {
      sonnerToast.error(
        error?.response?.data?.error?.message || "Failed to verify payment"
      );
    },
  });

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </AppLayout>
    );
  }

  if (!serviceDetails) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Service not found</h3>
            <Button onClick={() => navigate("/tutoring")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tutoring
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const totalEarnings = serviceDetails.paid_requests
    ? serviceDetails.paid_requests.reduce(
        (sum, req) => sum + parseFloat(req.amount || "0"),
        0
      )
    : 0;
  const availableForPayout = serviceDetails.paid_requests
    ? serviceDetails.paid_requests
        .filter((req) => req.session_status === "completed" && !req.money_credited)
        .reduce((sum, req) => sum + parseFloat(req.amount || "0"), 0)
    : 0;

  const totalSessions = serviceDetails.paid_requests
    ? serviceDetails.paid_requests.length
    : 0;

  const handleRequestPayout = () => {
    if (accounts.length === 0) {
      sonnerToast.error(
        "Please add a payout account before requesting payout"
      );
      setAccountModalOpen(true);
      return;
    }
    setPayoutModalOpen(true);
  };

  const handlePayRequest = (request: any) => {
    setSelectedRequest(request);
    setTutoringPaymentModalOpen(true);
  };

  const handlePaymentSuccess = (sessionType: "single" | "semester", reference: string) => {
    if (!selectedRequest) return;

    const amount = sessionType === "single"
      ? serviceDetails.session_rate * 1.15 
      : serviceDetails.session_rate * 12 * 0.85 * 1.15; 

    paymentVerificationMutation.mutate({
      request_id: selectedRequest.id,
      reference,
    });
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/tutoring")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Service Details</h1>
              <p className="text-muted-foreground mt-1">
                {serviceDetails.subject}
              </p>
            </div>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2">
            {serviceDetails.subject_type}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalEarnings)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From all sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available for Payout
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(availableForPayout)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Completed sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Paid sessions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Payout Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            {accounts.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No payout accounts configured
                </p>
                <Button
                  onClick={() => {
                    setSelectedAccountForEdit(undefined);
                    setAccountModalOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {accounts.length === 2 && (
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Account to Update
                    </label>
                    <Select
                      value={selectedAccountId}
                      onValueChange={setSelectedAccountId}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(accounts) && accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.account_name} ({account.account_type === "mobile_money" ? "Mobile Money" : "Bank"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {Array.isArray(accounts) && accounts.map((account) => (
                  <div
                    key={account.id}
                    className={`border rounded-lg p-4 ${
                      accounts.length === 1 || account.id === selectedAccountId
                        ? "block"
                        : "hidden"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-medium mb-1">
                          {account.account_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {account.account_type.replace("_", " ").toUpperCase()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {account.account_number}
                        </div>
                        {account.mobile_money_network && (
                          <div className="text-sm text-muted-foreground">
                            Network: {account.mobile_money_network}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      if (accounts.length === 1) {
                        setSelectedAccountForEdit(accounts[0]);
                      } else {
                        const selected = accounts.find(acc => acc.id === selectedAccountId);
                        setSelectedAccountForEdit(selected);
                      }
                      setAccountModalOpen(true);
                    }}
                    disabled={accounts.length === 2 && !selectedAccountId}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Update Account
                  </Button>

                  {accounts.length === 1 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedAccountForEdit(undefined);
                        setAccountModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Second Account
                    </Button>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleRequestPayout}
                    disabled={
                      availableForPayout <= 0 || requestPayoutMutation.isPending
                    }
                    className="w-full"
                  >
                    Request Payout ({formatCurrency(availableForPayout)})
                  </Button>
                  {serviceDetails.payout_requested_at && (
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Last requested:{" "}
                      {format(
                        new Date(serviceDetails.payout_requested_at),
                        "MMM dd, yyyy HH:mm"
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session History</CardTitle>
          </CardHeader>
          <CardContent>
            {serviceDetails.paid_requests &&
            serviceDetails.paid_requests.length > 0 ? (
              <div className="space-y-3">
                {serviceDetails.paid_requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex justify-between items-start border-b pb-3 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {request.requester_full_name ||
                            request.requester_username}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {request.session_type || "Single Session"}
                      </div>
                      {request.schedules &&
                       request.schedules.length > 0 &&
                       request.schedules[0] &&
                       !isNaN(new Date(request.schedules[0]).getTime()) && (
                        <div className="text-xs text-muted-foreground flex items-center mt-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(request.schedules[0]), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>
                    <div className="text-right ml-4 space-y-2">
                      <div className="font-bold">
                        {formatCurrency(parseFloat(request.amount || "0"))}
                      </div>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={
                            request.session_status === "completed"
                              ? "default"
                              : request.session_status === "ongoing"
                              ? "secondary"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {request.session_status}
                        </Badge>
                        <Badge
                          variant={
                            request.payment_status === "paid"
                              ? "default"
                              : request.payment_status === "not_paid"
                              ? "destructive"
                              : "outline"
                          }
                          className="text-xs"
                        >
                          {request.payment_status === "paid"
                            ? "Paid"
                            : request.payment_status === "not_paid"
                            ? "Unpaid"
                            : request.payment_status || "Unknown"}
                        </Badge>
                        {request.payment_status === "paid" && (
                          <Badge
                            variant={request.money_credited ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {request.money_credited ? "Credited" : "Pending"}
                          </Badge>
                        )}
                      </div>
                      {request.money_credited_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Credited: {format(new Date(request.money_credited_at), "MMM dd, yyyy")}
                        </p>
                      )}
                      {request.payment_status === "not_paid" &&
                       user?.id === request.requester_id && (
                        <Button
                          size="sm"
                          onClick={() => handlePayRequest(request)}
                          className="w-full mt-2"
                        >
                          {request.session_rate === "0" || request.payment_details?.amount === 0
                            ? "Book Now"
                            : "Pay Now"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No sessions yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <AccountModal
          open={accountModalOpen}
          onClose={() => {
            setAccountModalOpen(false);
            setSelectedAccountForEdit(undefined);
            queryClient.invalidateQueries({ queryKey: ["account-details"] });
          }}
          accounts={accounts}
          currentAccount={selectedAccountForEdit}
        />

        <RequestPayoutModal
          open={payoutModalOpen}
          onClose={() => setPayoutModalOpen(false)}
          paymentInfo={accounts.length > 0 ? {
            payment_method: accounts[0].account_type === "mobile_money" ? "mobile_money" : "bank_account",
            mobile_money_network: accounts[0].mobile_money_network,
            account_number: accounts[0].account_number,
            account_name: accounts[0].account_name,
          } : undefined}
          amount={availableForPayout}
          onConfirm={() => requestPayoutMutation.mutate()}
          isLoading={requestPayoutMutation.isPending}
        />

        {selectedRequest && (
          <PaymentModal
            open={tutoringPaymentModalOpen}
            onOpenChange={setTutoringPaymentModalOpen}
            request={{
              id: selectedRequest.id,
              subject: serviceDetails.subject,
              session_type: selectedRequest.session_type || "single",
            } as any}
            tutorName={serviceDetails.subject}
            hourlyRate={serviceDetails.session_rate}
            userEmail={user?.email || ""}
            onPayment={handlePaymentSuccess}
            isLoading={paymentVerificationMutation.isPending}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default MonetizationDetails;
