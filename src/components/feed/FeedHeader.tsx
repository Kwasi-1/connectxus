
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeedHeaderProps {
  activeFilter: 'following' | 'university';
  onFilterChange: (filter: 'following' | 'university') => void;
}

export function FeedHeader({ activeFilter, onFilterChange }: FeedHeaderProps) {
  return (
    <div className="sticky top-16 lg:top-0 z-10 bg-background lg:bg-background/80 lg:backdrop-blur-md border-b border-border">
      <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as 'following' | 'university')} className="w-full">
        <TabsList className="w-full text-muted-foreground h-12 bg-transparent rounded-none p-0">
          <TabsTrigger
            value="following"
            className="px-1 mx-auto h-full rounded-none border-b-[3px] border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:bg-hover"
          >
            For You
          </TabsTrigger>
          <TabsTrigger
            value="university"
            className="px-1 mx-auto h-full rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent data-[state=active]:text-foreground hover:bg-hover"
          >
            University
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
