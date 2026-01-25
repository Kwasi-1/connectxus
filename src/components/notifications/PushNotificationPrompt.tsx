import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Bell } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const STORAGE_KEY = 'push_notification_prompt_dismissed';
const STORAGE_KEY_ENABLED = 'push_notifications_enabled';

export const PushNotificationPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const { isSupported, permission, isSubscribed, subscribe } = usePushNotifications();

  useEffect(() => {
    const shouldShowPrompt = () => {
      if (!isSupported) return false;

      if (isSubscribed) return false;

      if (permission === 'denied') return false;

      const hasDismissed = localStorage.getItem(STORAGE_KEY) === 'true';
      if (hasDismissed) return false;

      const hasDisabled = localStorage.getItem(STORAGE_KEY_ENABLED) === 'false';
      if (hasDisabled) return false;

      return true;
    };

    const timer = setTimeout(() => {
      if (shouldShowPrompt()) {
        setShowPrompt(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSupported, isSubscribed, permission]);

  const handleEnable = async () => {
    const result = await subscribe();
    if (result) {
      localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
      localStorage.setItem(STORAGE_KEY, 'true'); 
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
    setShowPrompt(false);
  };

  return (
    <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mx-auto mb-4">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <AlertDialogTitle className="text-center">
            Enable Push Notifications?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Stay updated with real-time notifications for messages, posts, and events even when
            you're not using the app. You can change this anytime in settings.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel onClick={handleDismiss} className="m-0">
            Not Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleEnable} className="m-0">
            Enable Notifications
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};


export const usePushNotificationPrompt = () => {
  const resetPrompt = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const markAsEnabled = () => {
    localStorage.setItem(STORAGE_KEY_ENABLED, 'true');
  };

  const markAsDisabled = () => {
    localStorage.setItem(STORAGE_KEY_ENABLED, 'false');
  };

  return {
    resetPrompt,
    markAsEnabled,
    markAsDisabled,
  };
};
