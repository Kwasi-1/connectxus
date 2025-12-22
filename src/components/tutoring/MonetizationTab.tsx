import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getTutorServices } from "@/api/tutoring.api";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  BookOpen,
  Eye,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

export const MonetizationTab = () => {
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

  if (services.length === 0) {
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

  const allRequests = services.reduce((acc, service) => {
    if (service.paid_requests) {
      service.paid_requests.forEach(req => {
        acc.set(req.id, req);
      });
    }
    return acc;
  }, new Map());

  const uniqueRequests = Array.from(allRequests.values());

  const overallEarnings = uniqueRequests.reduce((total, req) => {
    return total + parseFloat(req.amount || "0");
  }, 0);

  const overallAvailableForPayout = uniqueRequests
    .filter((req) => req.session_status === "completed")
    .reduce((total, req) => total + parseFloat(req.amount || "0"), 0);

  const overallSessions = uniqueRequests.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overallEarnings)}</div>
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
              {formatCurrency(overallAvailableForPayout)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Sessions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSessions}</div>
            <p className="text-xs text-muted-foreground mt-1">Paid sessions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => {
          const totalEarnings = service.paid_requests
            ? service.paid_requests.reduce(
                (sum, req) => sum + parseFloat(req.amount || "0"),
                0
              )
            : 0;
          const availableForPayout = service.paid_requests
            ? service.paid_requests
                .filter((req) => req.session_status === "completed")
                .reduce((sum, req) => sum + parseFloat(req.amount || "0"), 0)
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
