import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedHeaderProps {
  activeFilter: 'all' | 'following';
  onFilterChange: (filter: 'all' | 'following') => void;
}

export function FeedHeader({ activeFilter, onFilterChange }: FeedHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex">
        <Button
          variant="ghost"
          onClick={() => onFilterChange('all')}
          className={cn(
            "flex-1 py-4 text-lg font-medium rounded-none hover:bg-hover",
            activeFilter === 'all' 
              ? "text-foreground border-b-2 border-primary bg-transparent" 
              : "text-muted-foreground"
          )}
        >
          All
        </Button>
        <Button
          variant="ghost"
          onClick={() => onFilterChange('following')}
          className={cn(
            "flex-1 py-4 text-lg font-medium rounded-none hover:bg-hover",
            activeFilter === 'following' 
              ? "text-foreground border-b-2 border-primary bg-transparent" 
              : "text-muted-foreground"
          )}
        >
          Following
        </Button>
      </div>
    </div>
  );
}