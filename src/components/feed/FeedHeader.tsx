
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedHeaderProps {
  activeFilter: 'for-you' | 'following' | 'university';
  onFilterChange: (filter: 'for-you' | 'following' | 'university') => void;
}

export function FeedHeader({ activeFilter, onFilterChange }: FeedHeaderProps) {
  return (
    <div className="sticky top-16 lg:top-0 z-10 bg-background lg:bg-background/80 lg:backdrop-blur-md border-b border-border">
      <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as 'for-you' | 'following' | 'university')} className="w-full">
        <TabsList className="w-full h-12 bg-transparent rounded-none p-0">
          <TabsTrigger 
            value="for-you" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent text-foreground hover:bg-hover"
          >
            For you
          </TabsTrigger>
          <TabsTrigger 
            value="following" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent text-foreground hover:bg-hover"
          >
            Following
          </TabsTrigger>
          <TabsTrigger 
            value="university" 
            className="flex-1 h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent text-foreground hover:bg-hover"
          >
            University
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
