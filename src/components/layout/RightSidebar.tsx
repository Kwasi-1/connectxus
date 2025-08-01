
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingTopic, CampusHighlight } from '@/types/global.d';

interface RightSidebarProps {
  trendingTopics: TrendingTopic[];
  campusHighlights: CampusHighlight[];
}

export function RightSidebar({ trendingTopics, campusHighlights }: RightSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="h-screen overflow-y-auto p-4 space-y-4 bg-background">
      {/* Search */}
      <div className="sticky top-0 bg-background pb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-muted border-none rounded-full h-12 text-base focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </div>

      {/* Premium Promotion */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Subscribe to Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Subscribe to unlock new features and if eligible, receive a share of ads revenue.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            Subscribe
          </Button>
        </CardContent>
      </Card>

      {/* What's happening */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">What's happening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {trendingTopics.slice(0, 5).map((topic, index) => (
            <div key={topic.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">
                    {index + 1} · Trending in {topic.category}
                  </p>
                  <p className="font-bold text-foreground truncate">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.posts.toLocaleString()} posts
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-muted rounded-full p-2 ml-2">
                  •••
                </Button>
              </div>
            </div>
          ))}
          <div className="p-3">
            <Button variant="ghost" className="text-primary hover:bg-muted/50 rounded-full">
              Show more
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Campus Highlights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Campus Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-0">
          {campusHighlights.slice(0, 3).map((highlight) => (
            <div key={highlight.id} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors">
              <h4 className="font-bold text-foreground text-sm">{highlight.title}</h4>
              <p className="text-sm text-muted-foreground line-clamp-2">{highlight.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {highlight.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
          <div className="p-3">
            <Button variant="ghost" className="text-primary hover:bg-muted/50 rounded-full">
              View all announcements
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-0">
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">SG</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">Study Group Hub</p>
                <p className="text-xs text-muted-foreground truncate">@studygroups</p>
              </div>
            </div>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4">
              Follow
            </Button>
          </div>
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">CC</span>
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">Career Center</p>
                <p className="text-xs text-muted-foreground truncate">@careers</p>
              </div>
            </div>
            <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4">
              Follow
            </Button>
          </div>
          <div className="p-3">
            <Button variant="ghost" className="text-primary hover:bg-muted/50 rounded-full">
              Show more
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
