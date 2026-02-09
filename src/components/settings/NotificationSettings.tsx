import { useState } from "react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { usePushNotificationPrompt } from "@/components/notifications/PushNotificationPrompt";
import {
  Bell,
  BellOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiClient } from "@/lib/apiClient";

export const NotificationSettings = () => {
  const {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    toggleSubscription,
  } = usePushNotifications();

  const { markAsEnabled, markAsDisabled } = usePushNotificationPrompt();

  const [testingNotification, setTestingNotification] = useState(false);

  const testNotification = async () => {
    if (!isSubscribed) {
      return;
    }

    setTestingNotification(true);

    try {
      const response = await apiClient.post("/push/test");

      if (response.status === 200) {
        toast.success("Test notification sent from server!");

        if ("Notification" in window) {
          if (Notification.permission === "granted") {
            try {
              new Notification("Test Notification", {
                body: "Push notifications are working!",
                icon: "/logo.png",
                tag: "test-notification",
              });
            } catch (e) {
              console.error("Browser notification error:", e);
              toast.error("Browser blocked the notification popup.");
            }
          } else {
            toast.warning("Notification permission not granted in browser.");
          }
        }
      }
    } catch (error) {
      console.error("Error sending test notification:", error);
      toast.error("Failed to send test notification request.");
    } finally {
      setTestingNotification(false);
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Receive notifications even when the app is closed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in this browser. Please use a
              modern browser like Chrome, Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Receive notifications even when the app is closed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "denied" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Notification permission was denied. Please enable notifications in
              your browser settings to use this feature.
            </AlertDescription>
          </Alert>
        )}

        {permission === "granted" && isSubscribed && (
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Push notifications are enabled. You'll receive notifications even
              when the app is closed.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between space-x-4">
          <div className="flex-1 space-y-1">
            <Label
              htmlFor="push-notifications"
              className="text-base font-medium"
            >
              Enable Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Get notified about new messages, posts, and events
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={async (checked) => {
              await toggleSubscription();
              if (checked) {
                markAsEnabled();
              } else {
                markAsDisabled();
              }
            }}
            disabled={isLoading || permission === "denied"}
          />
        </div>

        <div className="flex items-center gap-2 text-sm">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-muted-foreground">
                {isSubscribed ? "Disabling..." : "Enabling..."}
              </span>
            </>
          ) : isSubscribed ? (
            <>
              <Bell className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-medium">Active</span>
            </>
          ) : (
            <>
              <BellOff className="w-4 h-4 text-gray-400" />
              <span className="text-muted-foreground">Inactive</span>
            </>
          )}
        </div>

        {isSubscribed && (
          <Button
            variant="outline"
            onClick={testNotification}
            disabled={testingNotification}
            className="w-full"
          >
            {testingNotification ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending test notification...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4 mr-2" />
                Send Test Notification
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p>• You can disable notifications at any time</p>
          <p>
            • Notifications will only be sent when you're not actively viewing
            the app
          </p>
          <p>
            • You can manage notification preferences in your browser settings
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
