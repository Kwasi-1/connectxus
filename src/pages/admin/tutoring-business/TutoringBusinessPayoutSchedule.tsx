import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  DollarSign,
  Settings,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { useCurrency } from "@/hooks/useCurrency";

// Mock data for scheduled payouts
const mockScheduledPayouts = [
  {
    id: "SCHEDULE-001",
    scheduledDate: "2024-12-01T00:00:00Z",
    amount: 12450.5,
    tutorCount: 15,
    status: "scheduled" as const,
  },
  {
    id: "SCHEDULE-002",
    scheduledDate: "2024-12-15T00:00:00Z",
    amount: 8920.25,
    tutorCount: 12,
    status: "scheduled" as const,
  },
  {
    id: "SCHEDULE-003",
    scheduledDate: "2024-11-17T00:00:00Z",
    amount: 15680.0,
    tutorCount: 18,
    status: "completed" as const,
  },
  {
    id: "SCHEDULE-004",
    scheduledDate: "2024-11-03T00:00:00Z",
    amount: 14230.75,
    tutorCount: 16,
    status: "completed" as const,
  },
];

export function TutoringBusinessPayoutSchedule() {
  const { formatCurrency } = useCurrency();
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(true);
  const [payoutFrequency, setPayoutFrequency] = useState("bi-weekly");
  const [payoutDay, setPayoutDay] = useState("1"); // 1st and 15th of month

  const upcomingPayouts = mockScheduledPayouts.filter(
    (p) => p.status === "scheduled"
  );
  const completedPayouts = mockScheduledPayouts.filter(
    (p) => p.status === "completed"
  );

  const totalScheduledAmount = upcomingPayouts.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const nextPayoutDate = upcomingPayouts[0]?.scheduledDate;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-600 text-white">Scheduled</Badge>;
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSaveSettings = () => {
    // Here you would save the settings to your backend
    console.log("Saving payout settings:", {
      autoPayoutEnabled,
      payoutFrequency,
      payoutDay,
    });
    alert("Payout schedule settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Payout Schedule</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Payout Date
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {nextPayoutDate
                ? new Date(nextPayoutDate).toLocaleDateString()
                : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {nextPayoutDate
                ? `${Math.ceil(
                    (new Date(nextPayoutDate).getTime() - Date.now()) /
                      (1000 * 60 * 60 * 24)
                  )} days remaining`
                : "No scheduled payouts"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Scheduled Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalScheduledAmount)}
            </div>
            <p className="text-xs text-muted-foreground">
              {upcomingPayouts.length} upcoming payout
              {upcomingPayouts.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Frequency</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {payoutFrequency.replace("-", " ")}
            </div>
            <p className="text-xs text-muted-foreground">
              {autoPayoutEnabled ? "Automatic" : "Manual"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed This Month
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(
                completedPayouts.reduce((sum, p) => sum + p.amount, 0)
              )}{" "}
              paid
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Payout Schedule Settings</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Configure automatic payout schedule using Paystack
              </p>
            </div>
            <Settings className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Payout Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="auto-payout" className="text-base font-medium">
                Enable Automatic Payouts
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically process payouts on schedule via Paystack
              </p>
            </div>
            <Switch
              id="auto-payout"
              checked={autoPayoutEnabled}
              onCheckedChange={setAutoPayoutEnabled}
            />
          </div>

          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label htmlFor="frequency" className="text-base font-medium">
              Payout Frequency
            </Label>
            <Select value={payoutFrequency} onValueChange={setPayoutFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="bi-weekly">
                  Bi-Weekly (Every 2 weeks)
                </SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {payoutFrequency === "bi-weekly" &&
                "Payouts will be processed on the 1st and 15th of each month"}
              {payoutFrequency === "weekly" &&
                "Payouts will be processed every Monday"}
              {payoutFrequency === "monthly" &&
                "Payouts will be processed on the 1st of each month"}
            </p>
          </div>

          {/* Payout Day Selection (for bi-weekly) */}
          {payoutFrequency === "bi-weekly" && (
            <div className="space-y-3">
              <Label htmlFor="payout-day" className="text-base font-medium">
                Payout Days
              </Label>
              <Select value={payoutDay} onValueChange={setPayoutDay}>
                <SelectTrigger id="payout-day">
                  <SelectValue placeholder="Select days" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1st and 15th of month</SelectItem>
                  <SelectItem value="7">7th and 21st of month</SelectItem>
                  <SelectItem value="10">10th and 25th of month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Paystack Integration Info */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Paystack Integration
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Payouts are processed securely through Paystack. Ensure your
                  Paystack account is properly configured with sufficient
                  balance for automatic transfers.
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
              <Settings className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Scheduled Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tutors</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>
                    {new Date(payout.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payout.amount)}
                  </TableCell>
                  <TableCell>{payout.tutorCount} tutors</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Completed Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Schedule ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Tutors</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {completedPayouts.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell className="font-medium">{payout.id}</TableCell>
                  <TableCell>
                    {new Date(payout.scheduledDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payout.amount)}
                  </TableCell>
                  <TableCell>{payout.tutorCount} tutors</TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
