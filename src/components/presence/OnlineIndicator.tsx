import { useUserOnline } from '@/hooks/usePresenceData';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  userId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showOffline?: boolean; 
}


export const OnlineIndicator = ({
  userId,
  size = 'md',
  className,
  showOffline = false,
}: OnlineIndicatorProps) => {
  const { data: isOnline, isLoading } = useUserOnline(userId);

  if (isLoading) return null;
  if (!isOnline && !showOffline) return null;

  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'rounded-full border-2 border-background',
        sizeClasses[size],
        isOnline ? 'bg-green-500' : 'bg-gray-400',
        className
      )}
      title={isOnline ? 'Online' : 'Offline'}
    />
  );
};

interface OnlineStatusBadgeProps {
  userId: string;
  className?: string;
}


export const OnlineStatusBadge = ({ userId, className }: OnlineStatusBadgeProps) => {
  const { data: isOnline, isLoading } = useUserOnline(userId);

  if (isLoading) return null;

  return (
    <span
      className={cn(
        'text-xs font-medium px-2 py-0.5 rounded-full',
        isOnline
          ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
        className
      )}
    >
      {isOnline ? 'Online' : 'Offline'}
    </span>
  );
};

interface AvatarWithPresenceProps {
  userId: string;
  avatarSrc?: string | null;
  avatarFallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPresence?: boolean;
  className?: string;
}


export const AvatarWithPresence = ({
  userId,
  avatarSrc,
  avatarFallback,
  size = 'md',
  showPresence = true,
  className,
}: AvatarWithPresenceProps) => {
  const { data: isOnline } = useUserOnline(userId);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const indicatorSize = {
    sm: 'sm' as const,
    md: 'sm' as const,
    lg: 'md' as const,
    xl: 'md' as const,
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden',
          sizeClasses[size]
        )}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt={avatarFallback} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {avatarFallback}
          </span>
        )}
      </div>
      {showPresence && isOnline && (
        <OnlineIndicator
          userId={userId}
          size={indicatorSize[size]}
          className="absolute bottom-0 right-0"
        />
      )}
    </div>
  );
};
