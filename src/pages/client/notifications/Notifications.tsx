import { useState, useEffect, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/api/notifications.api";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck } from "lucide-react";
import { getWebSocketClient } from "@/lib/websocket";
import { useAuth } from "@/contexts/AuthContext";

type NotificationTab = "all" | "unread" | "mentions";

const Notifications = () => {
  const [activeTab, setActiveTab] = useState<NotificationTab>("all");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const wsClient = useRef(getWebSocketClient());
  const [wsConnected, setWsConnected] = useState(false);

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => getNotifications({ page: 1, limit: 100 }),
    staleTime: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("All notifications marked as read");
    },
    onError: () => {
      toast.error("Failed to mark notifications as read");
    },
  });

    useEffect(() => {
    const initializeWebSocket = async () => {
      try {
        await wsClient.current.connect();
        setWsConnected(true);

                const notificationHandler = (notification: any) => {
                    queryClient.setQueryData(["notifications"], (old: any) => {
            if (!old) return [notification];
            const exists = old.some((n: any) => n.id === notification.id);
            if (exists) return old;
            return [notification, ...old];
          });

                    const notificationSound = new Audio("/notification.mp3");
          notificationSound.volume = 0.3;
          notificationSound.play().catch((error) => {
            console.log("Could not play notification sound:", error);
          });

                    toast.info(notification.title || "New notification", {
            description: notification.message,
          });
        };

        wsClient.current.on("notification.created", notificationHandler);

                if (user?.id) {
          wsClient.current.subscribe(`user:${user.id}`);
        }

                return () => {
          wsClient.current.off("notification.created", notificationHandler);
        };
      } catch (error) {
        console.error("Failed to connect to WebSocket:", error);
        setWsConnected(false);
      }
    };

    const cleanup = initializeWebSocket();

    return () => {
      cleanup?.then((cleanupFn) => {
        if (cleanupFn && typeof cleanupFn === 'function') {
          cleanupFn();
        }
      });
      if (user?.id) {
        wsClient.current.unsubscribe(`user:${user.id}`);
      }
    };
  }, [queryClient, user?.id]);

  const handleNotificationClick = (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      markReadMutation.mutate(notificationId);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "unread") {
      return !notification.is_read;
    }
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <h1 className="text-xl font-bold text-foreground">
                Notifications
              </h1>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "like":
        return "❤️";
      case "comment":
        return "💬";
      case "follow":
        return "👤";
      case "mention":
        return "@";
      case "post":
        return "📝";
      case "group":
        return "👥";
      default:
        return "🔔";
    }
  };

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md borderb border-border">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">Notifications</h1>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
                className="gap-2"
              >
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as NotificationTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="all"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              All
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            <TabsTrigger
              value="mentions"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Mentions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No notifications</p>
                <p className="text-sm">
                  When you get notifications, they'll show up here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.is_read
                        ? "bg-blue-50/10 dark:bg-blue-950/10"
                        : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.is_read
                      )
                    }
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {notification.from_user?.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.from_user.avatar} />
                            <AvatarFallback>
                              {notification.from_user.full_name?.[0]?.toUpperCase() ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.from_user && (
                                <span className="font-semibold text-foreground">
                                  {notification.from_user.full_name ||
                                    "Someone"}
                                </span>
                              )}
                              {notification.title && (
                                <span className="text-muted-foreground">
                                  {notification.title}
                                </span>
                              )}
                            </div>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              {notification.priority &&
                                notification.priority !== "normal" && (
                                  <Badge
                                    variant={
                                      notification.priority === "urgent"
                                        ? "destructive"
                                        : "default"
                                    }
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(notification.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="unread" className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.is_read
                        ? "bg-blue-50/10 dark:bg-blue-950/10"
                        : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.is_read
                      )
                    }
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {notification.from_user?.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.from_user.avatar} />
                            <AvatarFallback>
                              {notification.from_user.full_name?.[0]?.toUpperCase() ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.from_user && (
                                <span className="font-semibold text-foreground">
                                  {notification.from_user.full_name ||
                                    "Someone"}
                                </span>
                              )}
                              {notification.title && (
                                <span className="text-muted-foreground">
                                  {notification.title}
                                </span>
                              )}
                            </div>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              {notification.priority &&
                                notification.priority !== "normal" && (
                                  <Badge
                                    variant={
                                      notification.priority === "urgent"
                                        ? "destructive"
                                        : "default"
                                    }
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(notification.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="mentions" className="mt-0">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">No mentions</p>
                <p className="text-sm">
                  When someone mentions you, it'll show up here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                      !notification.is_read
                        ? "bg-blue-50/10 dark:bg-blue-950/10"
                        : ""
                    }`}
                    onClick={() =>
                      handleNotificationClick(
                        notification.id,
                        notification.is_read
                      )
                    }
                  >
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        {notification.from_user?.avatar ? (
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={notification.from_user.avatar} />
                            <AvatarFallback>
                              {notification.from_user.full_name?.[0]?.toUpperCase() ||
                                "?"}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-lg">
                            {getNotificationIcon(notification.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.from_user && (
                                <span className="font-semibold text-foreground">
                                  {notification.from_user.full_name ||
                                    "Someone"}
                                </span>
                              )}
                              {notification.title && (
                                <span className="text-muted-foreground">
                                  {notification.title}
                                </span>
                              )}
                            </div>
                            {notification.message && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {notification.type}
                              </Badge>
                              {notification.priority &&
                                notification.priority !== "normal" && (
                                  <Badge
                                    variant={
                                      notification.priority === "urgent"
                                        ? "destructive"
                                        : "default"
                                    }
                                    className="text-xs"
                                  >
                                    {notification.priority}
                                  </Badge>
                                )}
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(
                                  new Date(notification.created_at),
                                  { addSuffix: true }
                                )}
                              </span>
                              {!notification.is_read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Notifications;
