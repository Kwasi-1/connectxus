import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/apiClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

interface PushSubscriptionJSON {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}


export const usePushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serviceWorkerRegistration, setServiceWorkerRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const checkSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;
      setIsSupported(supported);

      if (supported && Notification.permission) {
        setPermission(Notification.permission);
      }
    };

    checkSupport();
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        setServiceWorkerRegistration(registration);

        const existingSubscription = await registration.pushManager.getSubscription();
        if (existingSubscription) {
          setSubscription(existingSubscription);
        }
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    };

    registerServiceWorker();
  }, [isSupported]);

  const urlBase64ToUint8Array = useCallback((base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Push notifications are not supported in this browser');
      return false;
    }

    if (permission === 'granted') {
      return true;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        toast.success('Notification permission granted!');
        return true;
      } else if (result === 'denied') {
        toast.error('Notification permission denied');
        return false;
      } else {
        toast.info('Notification permission dismissed');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission');
      return false;
    }
  }, [isSupported, permission]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !serviceWorkerRegistration) {
      toast.error('Push notifications are not supported');
      return null;
    }

    if (!VAPID_PUBLIC_KEY) {
      console.error('VAPID public key is not configured');
      toast.error('Push notifications are not configured. Please contact support.');
      return null;
    }

    setIsLoading(true);

    try {
      const hasPermission = await requestPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const newSubscription = await serviceWorkerRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      setSubscription(newSubscription);

      await sendSubscriptionToBackend(newSubscription);

      toast.success('Push notifications enabled!');
      setIsLoading(false);
      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      toast.error('Failed to enable push notifications');
      setIsLoading(false);
      return null;
    }
  }, [isSupported, serviceWorkerRegistration, requestPermission, urlBase64ToUint8Array]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }

    setIsLoading(true);

    try {
      await subscription.unsubscribe();

      await removeSubscriptionFromBackend(subscription);

      setSubscription(null);
      toast.success('Push notifications disabled');
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      toast.error('Failed to disable push notifications');
      setIsLoading(false);
      return false;
    }
  }, [subscription]);

  const sendSubscriptionToBackend = async (sub: PushSubscription): Promise<void> => {
    try {
      const subscriptionJSON = sub.toJSON() as PushSubscriptionJSON;

      await apiClient.post('/push/subscribe', {
        endpoint: subscriptionJSON.endpoint,
        keys: subscriptionJSON.keys,
      });
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
      throw error;
    }
  };

  const removeSubscriptionFromBackend = async (sub: PushSubscription): Promise<void> => {
    try {
      const subscriptionJSON = sub.toJSON() as PushSubscriptionJSON;

      await apiClient.post('/push/unsubscribe', {
        endpoint: subscriptionJSON.endpoint,
      });
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
      throw error;
    }
  };

  const toggleSubscription = useCallback(async (): Promise<void> => {
    if (subscription) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  }, [subscription, subscribe, unsubscribe]);

  return {
    isSupported,
    permission,
    subscription,
    isSubscribed: !!subscription,
    isLoading,
    subscribe,
    unsubscribe,
    toggleSubscription,
    requestPermission,
  };
};


export const useIsPushNotificationsEnabled = (): boolean => {
  const { isSubscribed } = usePushNotifications();
  return isSubscribed;
};
