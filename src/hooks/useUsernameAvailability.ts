import { useState, useEffect } from 'react';
import { checkUsernameAvailability } from '@/api/auth.api';
import { useDebounce } from '@/hooks/useDebounce';

export type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export interface UseUsernameAvailabilityResult {
  status: UsernameStatus;
  message: string;
  isChecking: boolean;
  isAvailable: boolean | null;
}

export const useUsernameAvailability = (username: string, minLength: number = 3): UseUsernameAvailabilityResult => {
  const [status, setStatus] = useState<UsernameStatus>('idle');
  const [message, setMessage] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

  const debouncedUsername = useDebounce(username, 500);

  useEffect(() => {
    if (!debouncedUsername || debouncedUsername.length < minLength) {
      setStatus('idle');
      setMessage('');
      setIsAvailable(null);
      return;
    }

    setStatus('checking');
    setMessage('Checking username availability...');

    const checkUsername = async () => {
      try {
        const response = await checkUsernameAvailability(debouncedUsername);

        if (response.available) {
          setStatus('available');
          setMessage('Username is available ✓');
          setIsAvailable(true);
        } else {
          setStatus('taken');
          setMessage('Username is already taken');
          setIsAvailable(false);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error checking username availability');
        setIsAvailable(null);
        console.error('Error checking username:', error);
      }
    };

    checkUsername();
  }, [debouncedUsername, minLength]);

  return {
    status,
    message,
    isChecking: status === 'checking',
    isAvailable,
  };
};
