import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getTutorServices } from "@/api/tutoring.api";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";
import { format, parseISO } from "date-fns";

export const ServiceMonetization = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["tutor-services"],
    queryFn: getTutorServices,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const service = services.find((s) => s.id === serviceId);

  if (!service) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">Service not found</h3>
          <Button onClick={() => navigate("/tutoring")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutoring
          </Button>
        </div>
      </div>
    );
  }

  const isEligibleForPayout = (req: any) => {
    if (req.session_status !== "completed" || req.money_credited) return false;
    if (!req.completed_at) return false;

    const completedDate = new Date(req.completed_at);
    const hoursSinceCompletion =
      (Date.now() - completedDate.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion >= 36;
  };

  const calculateTutorShare = (amount: string) => {
    return parseFloat(amount || "0") * 0.75;
  };

  const requests = service.paid_requests || [];

  const totalEarnings = requests
    .filter((req) => req.money_credited)
    .reduce((sum, req) => sum + calculateTutorShare(req.amount || "0"), 0);

  const availableForPayout = requests
    .filter(isEligibleForPayout)
    .reduce((sum, req) => sum + calculateTutorShare(req.amount || "0"), 0);

  const pendingAmount = requests
    .filter(
      (req) =>
        req.session_status === "completed" &&
        !req.money_credited &&
        !isEligibleForPayout(req)
    )
    .reduce((sum, req) => sum + calculateTutorShare(req.amount || "0"), 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => navigate("/tutoring")}
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{service.subject}</h1>
          <div className="flex gap-2 mt-2">
            <Badge variant="outline">{service.subject_type}</Badge>
            {service.level && <Badge variant="secondary">{service.level}</Badge>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Already paid</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(availableForPayout)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Ready for payout
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(pendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Waiting for eligibility
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total sessions</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tutoring Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tutoring requests yet
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => {
                const isEligible = isEligibleForPayout(request);
                const isPaid = request.money_credited;
                const isPending =
                  request.session_status === "completed" &&
                  !isPaid &&
                  !isEligible;

                return (
                  <Card key={request.id} className="border-l-4 border-l-muted">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              {request.requester_full_name ||
                                request.requester_username ||
                                "Student"}
                            </span>
                            <Badge variant="outline" className="ml-2">
                              {request.session_type || "single"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                Status:
                              </span>
                              <Badge
                                variant={
                                  request.session_status === "completed"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.session_status}
                              </Badge>
                            </div>

                            {request.paid_at && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Paid: {format(parseISO(request.paid_at), "MMM d, yyyy")}
                                </span>
                              </div>
                            )}

                            {request.completed_at && (
                              <div className="flex items-center gap-2">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                  Completed:{" "}
                                  {format(parseISO(request.completed_at), "MMM d, yyyy")}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {formatCurrency(parseFloat(request.amount || "0"))}
                              </span>
                              <span className="text-muted-foreground">
                                (Your share:{" "}
                                {formatCurrency(
                                  calculateTutorShare(request.amount || "0")
                                )}
                                )
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isPaid && (
                              <Badge
                                variant="default"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Paid Out
                              </Badge>
                            )}
                            {isEligible && !isPaid && (
                              <Badge
                                variant="default"
                                className="bg-orange-600 hover:bg-orange-700"
                              >
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Ready for Payout
                              </Badge>
                            )}
                            {isPending && (
                              <Badge variant="secondary">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending Eligibility (&lt;36hrs)
                              </Badge>
                            )}
                            {request.session_status !== "completed" && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Session {request.session_status}
                              </Badge>
                            )}
                          </div>

                          {request.money_credited_at && (
                            <div className="text-xs text-muted-foreground">
                              Paid out on:{" "}
                              {format(
                                parseISO(request.money_credited_at),
                                "MMM d, yyyy 'at' h:mm a"
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
