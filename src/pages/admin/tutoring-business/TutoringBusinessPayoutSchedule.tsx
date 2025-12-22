import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { adminApi } from "@/api/admin.api";
import { Settings, DollarSign, Calendar, Percent, Clock, CalendarDays } from "lucide-react";

type PayoutScheduleMode = "automatic" | "frequency" | "days" | null;

interface PayoutSettings {
  active_mode: PayoutScheduleMode;
  payout_frequency: "weekly" | "biweekly" | "monthly" | null;
  payout_days: number[]; 
  platform_fee_percent: number;
  refund_fee_percent: number;
  refund_window_hours: number;
}

const DAYS_OF_WEEK = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

export function TutoringBusinessPayoutSchedule() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PayoutSettings>({
    active_mode: null,
    payout_frequency: null,
    payout_days: [],
    platform_fee_percent: 15,
    refund_fee_percent: 0,
    refund_window_hours: 24,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const allSettings = await adminApi.getSettings();

      const payoutSetting = allSettings.find((s: any) => s.key === "tutoring_payout_settings");
      if (payoutSetting) {
        const value = typeof payoutSetting.value === "string"
          ? JSON.parse(payoutSetting.value)
          : payoutSetting.value;
        setSettings({
          active_mode: value.active_mode || null,
          payout_frequency: value.payout_frequency || null,
          payout_days: value.payout_days || [],
          platform_fee_percent: value.platform_fee_percent || 15,
          refund_fee_percent: value.refund_fee_percent || 0,
          refund_window_hours: value.refund_window_hours || 24,
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    if (settings.active_mode === "frequency" && !settings.payout_frequency) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a payout frequency",
      });
      return;
    }

    if (settings.active_mode === "days" && settings.payout_days.length === 0) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select at least one payout day",
      });
      return;
    }

    try {
      setSaving(true);
      await adminApi.updateSetting(
        "tutoring_payout_settings",
        settings,
        "Tutoring business payout schedule and fee settings"
      );
      toast({
        title: "Success",
        description: "Payout settings updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = (mode: PayoutScheduleMode) => {
    if (settings.active_mode === mode) {
      setSettings({
        ...settings,
        active_mode: null,
      });
    } else {
      setSettings({
        ...settings,
        active_mode: mode,
      });
    }
  };

  const handleFrequencyChange = (frequency: "weekly" | "biweekly" | "monthly") => {
    setSettings({
      ...settings,
      payout_frequency: frequency,
    });
  };

  const togglePayoutDay = (day: number) => {
    const newDays = settings.payout_days.includes(day)
      ? settings.payout_days.filter(d => d !== day)
      : [...settings.payout_days, day].sort();

    setSettings({
      ...settings,
      payout_days: newDays,
    });
  };

  const handlePlatformFeeChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setSettings({
        ...settings,
        platform_fee_percent: numValue,
      });
    }
  };

  const handleRefundFeeChange = (value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setSettings({
        ...settings,
        refund_fee_percent: numValue,
      });
    }
  };

  const handleRefundWindowChange = (value: string) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setSettings({
        ...settings,
        refund_window_hours: numValue,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Payout Schedule Settings</h1>
          <p className="text-gray-500 mt-1">
            Configure automatic payout schedules and platform fees
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Payout Schedule Settings
        </h1>
        <p className="text-gray-500 mt-1">
          Configure payout schedules, platform fees, and refund policies
        </p>
      </div>

      <div className="grid gap-6">
        {/* Payout Schedule Options - Only ONE can be active */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Payout Schedule Options
            </CardTitle>
            <CardDescription>
              Select ONE payout schedule option. Only one can be active at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Option 1: Automatic Payouts */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-0.5">
                <Label htmlFor="automatic-payouts" className="text-base font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Automatic Payouts
                </Label>
                <p className="text-sm text-gray-500">
                  Process payouts automatically without manual configuration
                </p>
              </div>
              <Switch
                id="automatic-payouts"
                checked={settings.active_mode === "automatic"}
                onCheckedChange={() => toggleMode("automatic")}
              />
            </div>

            {/* Option 2: Payout Frequency */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="payout-frequency-toggle" className="text-base font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Payout Frequency
                  </Label>
                  <p className="text-sm text-gray-500">
                    Set a recurring payout schedule (weekly, bi-weekly, monthly)
                  </p>
                </div>
                <Switch
                  id="payout-frequency-toggle"
                  checked={settings.active_mode === "frequency"}
                  onCheckedChange={() => toggleMode("frequency")}
                />
              </div>

              {/* Frequency Selection - Only shown when this option is active */}
              {settings.active_mode === "frequency" && (
                <div className="space-y-3 pl-4">
                  <Label htmlFor="frequency-select" className="text-base font-medium">
                    Select Frequency
                  </Label>
                  <Select
                    value={settings.payout_frequency || ""}
                    onValueChange={(value) => handleFrequencyChange(value as any)}
                  >
                    <SelectTrigger id="frequency-select">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (Every 2 weeks)</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    {settings.payout_frequency === "weekly" && "Payouts will be processed every week"}
                    {settings.payout_frequency === "biweekly" && "Payouts will be processed every two weeks"}
                    {settings.payout_frequency === "monthly" && "Payouts will be processed every month"}
                    {!settings.payout_frequency && "Choose how often payouts should be processed"}
                  </p>
                </div>
              )}
            </div>

            {/* Option 3: Payout Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="payout-days-toggle" className="text-base font-medium flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    Payout Days
                  </Label>
                  <p className="text-sm text-gray-500">
                    Select specific days of the week for payouts
                  </p>
                </div>
                <Switch
                  id="payout-days-toggle"
                  checked={settings.active_mode === "days"}
                  onCheckedChange={() => toggleMode("days")}
                />
              </div>

              {/* Day Selection - Only shown when this option is active */}
              {settings.active_mode === "days" && (
                <div className="space-y-3 pl-4">
                  <Label className="text-base font-medium">
                    Select Days (one or more)
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {DAYS_OF_WEEK.map((day) => {
                      const isSelected = settings.payout_days.includes(day.value);
                      return (
                        <Button
                          key={day.value}
                          type="button"
                          variant={isSelected ? "default" : "outline"}
                          className="w-full"
                          onClick={() => togglePayoutDay(day.value)}
                        >
                          {day.label}
                        </Button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-gray-500">
                    {settings.payout_days.length > 0
                      ? `Payouts will be processed on: ${settings.payout_days.map(d => DAYS_OF_WEEK[d].label).join(", ")}`
                      : "Select one or more days for payout processing"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Platform Fees
            </CardTitle>
            <CardDescription>
              Set commission rates for the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Commission */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="platform-fee" className="text-base font-medium">
                  Platform Commission (%)
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">
                    {settings.platform_fee_percent}%
                  </span>
                </div>
              </div>
              <Input
                id="platform-fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.platform_fee_percent}
                onChange={(e) => handlePlatformFeeChange(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Commission taken from each tutoring session payment.
                Tutors receive {100 - settings.platform_fee_percent}% of the session fee.
              </p>
            </div>

            {/* Refund Fee */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="refund-fee" className="text-base font-medium">
                  Refund Processing Fee (%)
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">
                    {settings.refund_fee_percent}%
                  </span>
                </div>
              </div>
              <Input
                id="refund-fee"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={settings.refund_fee_percent}
                onChange={(e) => handleRefundFeeChange(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Commission taken from refunded transactions. Set to 0 to not charge refund fees.
              </p>
            </div>

            {/* Refund Window */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="refund-window" className="text-base font-medium">
                  Refund Window (hours)
                </Label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-2xl font-bold">
                    {settings.refund_window_hours}h
                  </span>
                </div>
              </div>
              <Input
                id="refund-window"
                type="number"
                min="0"
                step="1"
                value={settings.refund_window_hours}
                onChange={(e) => handleRefundWindowChange(e.target.value)}
                className="text-lg"
              />
              <p className="text-sm text-gray-500">
                Time window (in hours) during which students can request refunds for sessions.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Settings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-900">
            <div className="flex justify-between">
              <span className="font-medium">Active Schedule Mode:</span>
              <span className="capitalize">
                {settings.active_mode === "automatic" && "Automatic Payouts"}
                {settings.active_mode === "frequency" && "Payout Frequency"}
                {settings.active_mode === "days" && "Payout Days"}
                {!settings.active_mode && "None (Manual Payouts)"}
              </span>
            </div>
            {settings.active_mode === "frequency" && settings.payout_frequency && (
              <div className="flex justify-between">
                <span className="font-medium">Frequency:</span>
                <span className="capitalize">{settings.payout_frequency}</span>
              </div>
            )}
            {settings.active_mode === "days" && settings.payout_days.length > 0 && (
              <div className="flex justify-between">
                <span className="font-medium">Selected Days:</span>
                <span>
                  {settings.payout_days
                    .map(d => DAYS_OF_WEEK[d].label.substring(0, 3))
                    .join(", ")}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-blue-200 pt-2">
              <span className="font-medium">Platform Commission:</span>
              <span>{settings.platform_fee_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tutor Receives:</span>
              <span>{100 - settings.platform_fee_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Refund Fee:</span>
              <span>{settings.refund_fee_percent}%</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Refund Window:</span>
              <span>{settings.refund_window_hours} hours</span>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="lg"
            className="min-w-[200px]"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>
    </div>
  );
}
