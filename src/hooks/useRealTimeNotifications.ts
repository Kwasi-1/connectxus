import { useEffect, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack:react-query';
import { getWebSocketClient } from '@/lib/websocket';
import { useNotificationSound } from './useNotificationSound';
import { notificationKeys } from './useNotifications';
import { toast } from 'sonner';

interface NotificationPayload {
  id: string;
  to_user_id: string;
  from_user_id?: string;
  type: string;
  title?: string;
  message?: string;
  related_id?: string;
  is_read: boolean;
  priority?: string;
  action_required?: boolean;
  created_at?: number;
}

interface UseRealTimeNotificationsOptions {
  soundEnabled?: boolean;
  toastEnabled?: boolean;
  soundVolume?: number;
}

export function useRealTimeNotifications(options: UseRealTimeNotificationsOptions = {}) {
  const {
    soundEnabled = true,
    toastEnabled = true,
    soundVolume = 0.5,
  } = options;

  const queryClient = useQueryClient();
  const { playNotificationSound } = useNotificationSound({
    enabled: soundEnabled,
    volume: soundVolume,
  });
  const wsClientRef = useRef(getWebSocketClient());
  const isSubscribedRef = useRef(false);

  const handleNotification = useCallback((payload: NotificationPayload) => {
        queryClient.invalidateQueries({ queryKey: notificationKeys.all });

        if (soundEnabled) {
      playNotificationSound(payload.type);
    }

        if (toastEnabled && payload.title) {
            const toastOptions = {
        duration: 5000,
        action: payload.action_required ? {
          label: 'View',
          onClick: () => {
                        window.location.href = `/notifications`;
          },
        } : undefined,
      };

      switch (payload.priority) {
        case 'high':
          toast.success(payload.title, toastOptions);
          break;
        case 'low':
          toast.info(payload.title, toastOptions);
          break;
        default:
          toast(payload.title, toastOptions);
      }
    }
  }, [queryClient, soundEnabled, toastEnabled, playNotificationSound]);

  useEffect(() => {
    const wsClient = wsClientRef.current;

        if (!wsClient.isConnectionOpen()) {
      wsClient.connect().catch((error) => {
        console.error('Failed to connect to WebSocket for notifications:', error);
      });
    }

        if (!isSubscribedRef.current) {
      wsClient.on('notification.new', handleNotification);
      isSubscribedRef.current = true;
    }

        return () => {
      if (isSubscribedRef.current) {
        wsClient.off('notification.new', handleNotification);
        isSubscribedRef.current = false;
      }
    };
  }, [handleNotification]);

  return {
    isConnected: wsClientRef.current.isConnectionOpen(),
  };
}
