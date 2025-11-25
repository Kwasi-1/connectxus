import { useRef, useCallback } from 'react';

interface NotificationSoundOptions {
  volume?: number;
  enabled?: boolean;
}

export function useNotificationSound(options: NotificationSoundOptions = {}) {
  const { volume = 0.5, enabled = true } = options;
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

    const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

    const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!enabled) return;

    try {
      const context = getAudioContext();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(volume, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration / 1000);
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  }, [enabled, volume, getAudioContext]);

    const playCustomSound = useCallback((soundPath: string) => {
    if (!enabled) return;

    try {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio();
      }

      audioElementRef.current.src = soundPath;
      audioElementRef.current.volume = volume;
      audioElementRef.current.play().catch(error => {
        console.error('Failed to play custom sound:', error);
      });
    } catch (error) {
      console.error('Failed to play custom sound:', error);
    }
  }, [enabled, volume]);

    const playNotificationSound = useCallback((type?: string) => {
    if (!enabled) return;

        switch (type) {
      case 'message':
        playBeep(900, 150);         break;
      case 'follow':
      case 'like':
        playBeep(600, 100);         break;
      case 'group_invite':
      case 'event_invite':
      case 'mentorship_application':
        playBeep(800, 250);         break;
      case 'comment':
      case 'reply':
      case 'mention':
        playBeep(750, 180);         break;
      default:
        playBeep(800, 200);     }
  }, [enabled, playBeep]);

  return {
    playBeep,
    playCustomSound,
    playNotificationSound,
  };
}
