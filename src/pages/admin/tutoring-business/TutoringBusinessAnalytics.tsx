import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  DollarSign,
  Star,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { adminApi } from "@/api/admin.api";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";

export function TutoringBusinessAnalytics() {
  const { formatCurrency } = useCurrency();
  const { selectedSpaceId } = useAdminSpace();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [revenueBySubject, setRevenueBySubject] = useState<any[]>([]);
  const [topTutors, setTopTutors] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [selectedSpaceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [analyticsData, revenueData, tutorsData] = await Promise.all([
        adminApi.getTutoringBusinessAnalytics(selectedSpaceId),
        adminApi.getTutoringBusinessRevenueBySubject(selectedSpaceId),
        adminApi.getTutoringBusinessTopTutors(selectedSpaceId, 10),
      ]);

      setAnalytics(analyticsData);
      setRevenueBySubject(revenueData);
      setTopTutors(tutorsData);
    } catch (err: any) {
      console.error("Failed to load analytics:", err);
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold custom-font">Business Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold custom-font">Business Analytics</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircleIcon className="h-5 w-5" />
              <p>Failed to load analytics: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analytics) return null;

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const revenueChartData = revenueBySubject.map((item, idx) => ({
    subject: item.subject,
    revenue: parseFloat(item.total_revenue),
    color: COLORS[idx % COLORS.length],
  }));

  const conversionFunnel = [
    {
      stage: "Requests",
      count: analytics.total_requests,
      percentage: 100,
    },
    {
      stage: "Accepted",
      count: analytics.accepted_requests,
      percentage:
        analytics.total_requests > 0
          ? (
              (analytics.accepted_requests / analytics.total_requests) *
              100
            ).toFixed(1)
          : 0,
    },
    {
      stage: "Paid",
      count: analytics.paid_sessions,
      percentage:
        analytics.total_requests > 0
          ? (
              (analytics.paid_sessions / analytics.total_requests) *
              100
            ).toFixed(1)
          : 0,
    },
    {
      stage: "Completed",
      count: analytics.completed_sessions,
      percentage:
        analytics.total_requests > 0
          ? (
              (analytics.completed_sessions / analytics.total_requests) *
              100
            ).toFixed(1)
          : 0,
    },
  ];
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Business Analytics</h1>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.total_requests}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.conversion_rate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Request to completion
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Session Price
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(analytics.avg_session_price))}
            </div>
            <p className="text-xs text-muted-foreground">
              Per completed session
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(analytics.total_revenue))}
            </div>
            <p className="text-xs text-muted-foreground">All sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={conversionFunnel}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="stage" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Count" />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              {conversionFunnel.map((item, index) => (
                <div key={index} className="text-xs">
                  <div className="font-medium">{item.percentage}%</div>
                  <div className="text-muted-foreground">{item.stage}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Subject */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="revenue"
                  label={({ subject, revenue }) =>
                    `${subject}: ${formatCurrency(revenue)}`
                  }
                >
                  {revenueChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {revenueChartData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.subject}</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Tutors */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Tutors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topTutors.map((tutor, idx) => (
              <div
                key={tutor.tutor_id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  #{idx + 1}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarFallback>{tutor.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{tutor.tutor_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.total_sessions} sessions completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatCurrency(parseFloat(tutor.total_earned))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total earned
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
