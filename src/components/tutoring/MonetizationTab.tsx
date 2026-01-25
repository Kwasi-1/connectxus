import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getTutorServices, requestPayout } from "@/api/tutoring.api";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  BookOpen,
  Eye,
  Wallet,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { toast } from "sonner";

export const MonetizationTab = () => {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["tutor-services"],
    queryFn: getTutorServices,
  });

  const payoutMutation = useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      toast.success("Payout request submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["tutor-services"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to request payout");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (services && services.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No services yet</h3>
        <p className="text-muted-foreground">
          Your approved tutoring services will appear here
        </p>
      </div>
    );
  }

  const allRequests = services && services.reduce((acc, service) => {
    if (service.paid_requests) {
      service.paid_requests.forEach(req => {
        acc.set(req.id, req);
      });
    }
    return acc;
  }, new Map());

  const uniqueRequests = allRequests ? Array.from(allRequests.values()) : [];

  const isEligibleForPayout = (req: any) => {
    if (req.session_status !== "completed" || req.money_credited) return false;
    if (!req.completed_at) return false;

    const completedDate = new Date(req.completed_at);
    const hoursSinceCompletion = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion >= 36;
  };

  const calculateTutorShare = (amount: string) => {
    return parseFloat(amount || "0") * 0.75;
  };

  const pendingPayoutsAmount = uniqueRequests
    .filter(isEligibleForPayout)
    .reduce((total, req) => total + calculateTutorShare(req.amount || "0"), 0);

  const payoutsReceivedAmount = uniqueRequests
    .filter(req => req.money_credited)
    .reduce((total, req) => total + calculateTutorShare(req.amount || "0"), 0);

  const completedTutoringsCount = uniqueRequests.filter(
    req => req.session_status === "completed"
  ).length;

  const pendingTutoringsCount = uniqueRequests.filter(
    req => ["pending", "accepted", "ongoing"].includes(req.session_status)
  ).length;

  const hasPendingPayouts = services.some(s => s.payout_requested);
  const hasEligiblePayouts = pendingPayoutsAmount > 0;

  return (
    <div className="space-y-6">
      {hasEligiblePayouts && !hasPendingPayouts && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-900">
                  You have {formatCurrency(pendingPayoutsAmount)} available for payout!
                </h3>
                <p className="text-sm text-green-700 mt-1">
                  Earnings from completed sessions (&gt;36 hours ago). Platform fee: 25%
                </p>
              </div>
              <Button
                onClick={() => payoutMutation.mutate()}
                disabled={payoutMutation.isPending}
                size="lg"
                className="bg-green-600 hover:bg-green-700"
              >
                <Wallet className="h-4 w-4 mr-2" />
                {payoutMutation.isPending ? "Requesting..." : "Request Payout"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {hasPendingPayouts && (
        <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900">
                  Payout Request Pending
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Your payout request is being processed by the admin team
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(pendingPayoutsAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for payout (&gt;36hrs)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Payouts Received
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(payoutsReceivedAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Already paid out
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {completedTutoringsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              All completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Sessions
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingTutoringsCount}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Not yet completed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services && services.map((service) => {
          const totalEarnings = service.paid_requests
            ? service.paid_requests
                .filter(req => req.money_credited)
                .reduce((sum, req) => sum + calculateTutorShare(req.amount || "0"), 0)
            : 0;
          const availableForPayout = service.paid_requests
            ? service.paid_requests
                .filter(isEligibleForPayout)
                .reduce((sum, req) => sum + calculateTutorShare(req.amount || "0"), 0)
            : 0;
          const totalSessions = service.paid_requests
            ? service.paid_requests.length
            : 0;

          return (
            <Card
              key={service.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/tutoring/monetization/${service.id}`)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{service.subject}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline">{service.subject_type}</Badge>
                      {service.level && (
                        <Badge variant="secondary">{service.level}</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span>Total Earnings</span>
                    </div>
                    <div className="text-xl font-bold">
                      {formatCurrency(totalEarnings)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Available</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">
                      {formatCurrency(availableForPayout)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <CreditCard className="h-3 w-3" />
                    <span>{totalSessions} Sessions</span>
                  </div>
                  {service.discount > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {service.discount}% off
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Single:</span>
                    <span className="font-medium ml-1">
                      {formatCurrency(service.session_rate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium ml-1">
                      {formatCurrency(service.semester_rate)}
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/tutoring/monetization/${service.id}`);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
