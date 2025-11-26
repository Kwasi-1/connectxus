import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
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
  Users,
  Star,
} from "lucide-react";
import { mockAnalyticsData } from "@/data/tutoringBusinessMockData";

export function TutoringBusinessAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Business Analytics</h1>
      </div>

      {/* Refund Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.refundAnalytics.totalRefunds}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAnalyticsData.refundAnalytics.refundRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {mockAnalyticsData.refundAnalytics.trend} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {mockAnalyticsData.refundAnalytics.totalRefundAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total refunded</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Reason</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {mockAnalyticsData.refundAnalytics.commonReasons[0].reason}
            </div>
            <p className="text-xs text-muted-foreground">
              {mockAnalyticsData.refundAnalytics.commonReasons[0].count} cases
            </p>
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
              <BarChart data={mockAnalyticsData.conversionFunnel}>
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
              {mockAnalyticsData.conversionFunnel.map((item, index) => (
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
                  data={mockAnalyticsData.revenueBySubject}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="revenue"
                  label={({ subject, revenue }) => `${subject}: $${revenue}`}
                >
                  {mockAnalyticsData.revenueBySubject.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockAnalyticsData.revenueBySubject.map((item, index) => (
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
                    ${item.revenue.toLocaleString()}
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
            {mockAnalyticsData.topTutors.map((tutor) => (
              <div
                key={tutor.tutorId}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm">
                  #{tutor.rank}
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={tutor.tutorAvatar} />
                  <AvatarFallback>{tutor.tutorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-medium">{tutor.tutorName}</div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.subjects.join(", ")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    ${tutor.totalEarnings.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {tutor.sessionsCompleted} sessions
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium">{tutor.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort Retention */}
        <Card>
          <CardHeader>
            <CardTitle>Student Retention (Cohort)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockAnalyticsData.cohortRetention}>
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
                  dataKey="retention"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Retention %"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Times */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Request Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockAnalyticsData.peakTimes}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                  }}
                />
                <Bar
                  dataKey="morning"
                  stackId="a"
                  fill="hsl(var(--chart-1))"
                  name="Morning"
                />
                <Bar
                  dataKey="afternoon"
                  stackId="a"
                  fill="hsl(var(--chart-2))"
                  name="Afternoon"
                />
                <Bar
                  dataKey="evening"
                  stackId="a"
                  fill="hsl(var(--chart-3))"
                  name="Evening"
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(var(--chart-1))" }}
                />
                <span>Morning (8AM-12PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(var(--chart-2))" }}
                />
                <span>Afternoon (12PM-5PM)</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: "hsl(var(--chart-3))" }}
                />
                <span>Evening (5PM-9PM)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Refund Reasons */}
      <Card>
        <CardHeader>
          <CardTitle>Common Refund Reasons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockAnalyticsData.refundAnalytics.commonReasons.map(
              (reason, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">
                        {reason.reason}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {reason.count} cases
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${
                            (reason.count /
                              mockAnalyticsData.refundAnalytics.totalRefunds) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
