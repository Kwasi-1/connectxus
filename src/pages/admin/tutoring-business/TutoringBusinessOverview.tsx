import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Users,
  GraduationCap,
  TrendingUp,
  Wallet,
  BookOpen,
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
} from "recharts";
import {
  mockTutoringBusinessData,
  mockRevenueHistory,
  mockSessionBreakdown,
} from "@/data/tutoringBusinessMockData";

export function TutoringBusinessOverview() {
  const stats = [
    {
      title: "Total Revenue",
      value: `$${mockTutoringBusinessData.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      description:
        mockTutoringBusinessData.monthOverMonthGrowth + " from last month",
      color: "text-green-600",
    },
    {
      title: "Total Sessions",
      value: mockTutoringBusinessData.totalSessions.toLocaleString(),
      icon: BookOpen,
      description: `Avg $${mockTutoringBusinessData.averageSessionValue.toFixed(
        0
      )} per session`,
      color: "text-blue-600",
    },
    {
      title: "Platform Fees",
      value: `$${mockTutoringBusinessData.platformFees.toLocaleString()}`,
      icon: Wallet,
      description: "15% of total revenue",
      color: "text-purple-600",
    },
    {
      title: "Pending Payouts",
      value: `$${mockTutoringBusinessData.pendingPayouts.toLocaleString()}`,
      icon: TrendingUp,
      description: "Due by end of month",
      color: "text-orange-600",
    },
    {
      title: "Active Students",
      value: mockTutoringBusinessData.activeStudents.toLocaleString(),
      icon: Users,
      description: "This month",
      color: "text-cyan-600",
    },
    {
      title: "Active Tutors",
      value: mockTutoringBusinessData.activeTutors.toLocaleString(),
      icon: GraduationCap,
      description: "Earning this month",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">
          Tutoring Business Overview
        </h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              {stat.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Last 6 Months</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockRevenueHistory}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Session Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Session Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={mockSessionBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {mockSessionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockSessionBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value} sessions</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
