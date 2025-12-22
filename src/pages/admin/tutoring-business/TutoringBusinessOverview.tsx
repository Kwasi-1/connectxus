import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  GraduationCap,
  TrendingUp,
  Wallet,
  BookOpen,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCurrency } from "@/hooks/useCurrency";
import { adminApi } from "@/api/admin.api";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";
import { Skeleton } from "@/components/ui/skeleton";

export function TutoringBusinessOverview() {
  const { formatCurrency } = useCurrency();
  const { selectedSpaceId } = useAdminSpace();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [revenueHistory, setRevenueHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedSpaceId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const [overviewStats, revHistory] = await Promise.all([
        adminApi.getTutoringBusinessOverviewStats(selectedSpaceId),
        adminApi.getTutoringBusinessRevenueHistory(
          selectedSpaceId,
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        ),
      ]);

      setStats(overviewStats);
      setRevenueHistory(revHistory);
    } catch (err: any) {
      console.error("Failed to load tutoring business data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold custom-font">
          Tutoring Business Overview
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
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
        <h1 className="text-3xl font-bold custom-font">
          Tutoring Business Overview
        </h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load data: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) return null;

  const metricsCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(parseFloat(stats.total_revenue)),
      icon: DollarSign,
      description: "All-time earnings",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Platform Commission",
      value: formatCurrency(parseFloat(stats.platform_commission)),
      icon: Wallet,
      description: "15% platform fee",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Payouts",
      value: formatCurrency(parseFloat(stats.pending_payouts)),
      icon: TrendingUp,
      description: "Awaiting distribution",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Completed Payouts",
      value: formatCurrency(parseFloat(stats.completed_payouts)),
      icon: CheckCircle,
      description: "Successfully paid",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Total Sessions",
      value: stats.total_sessions.toLocaleString(),
      icon: BookOpen,
      description: `${stats.completed_sessions} completed`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Tutors",
      value: stats.total_tutors.toLocaleString(),
      icon: GraduationCap,
      description: "Approved and active",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Total Students",
      value: stats.total_students.toLocaleString(),
      icon: Users,
      description: "Unique requesters",
      color: "text-cyan-600",
      bgColor: "bg-cyan-50",
    },
    {
      title: "Pending Disputes",
      value: stats.pending_disputes.toLocaleString(),
      icon: AlertCircle,
      description: "Requiring attention",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const chartData = revenueHistory.map((item) => ({
    date: new Date(item.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: parseFloat(item.revenue),
    commission: parseFloat(item.commission),
  }));

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">
          Tutoring Business Overview
        </h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricsCards.map((metric, index) => (
          <Card key={index} className={`border-l-4 ${metric.bgColor}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              {metric.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trends (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis tick={{ fontSize: 12 }} tickMargin={10} />
                <Tooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Total Revenue"
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="commission"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Platform Commission"
                  dot={{ fill: "#8b5cf6", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Session Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Session Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completed Sessions</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.completed_sessions}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Sessions</span>
                <span className="text-lg font-bold text-blue-600">
                  {stats.total_sessions}
                </span>
              </div>
              {stats.total_sessions > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">
                      Completion Rate
                    </span>
                    <span className="text-lg font-bold text-indigo-600">
                      {(
                        (stats.completed_sessions / stats.total_sessions) *
                        100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disputes Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Pending Disputes</span>
                <span className="text-lg font-bold text-orange-600">
                  {stats.pending_disputes}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Resolved Disputes</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.resolved_disputes}
                </span>
              </div>
              {stats.pending_disputes > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-amber-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {stats.pending_disputes} dispute(s) need attention
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
