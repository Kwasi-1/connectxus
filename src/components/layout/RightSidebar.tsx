
import { useState } from 'react';
import { Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockTrendingTopics, mockCampusHighlights } from '@/data/mockData';

export function RightSidebar() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full p-4 pt-0 space-y-2 h-full overflow-y-auto">
      {/* Search */}
      <div className="sticky top-0 bg-background py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search Campus Vibe" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-3 bg-muted border-none rounded-full text-base"
          />
        </div>
      </div>

      <div className='flex flex-col-reverse gap-4'>
      {/* Trending Topics */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">What's happening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockTrendingTopics.slice(0, 5).map((topic, index) => (
            <div key={topic.id} className="hover:bg-muted p-3 rounded-lg cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {index + 1} · Trending in {topic.category}
                  </p>
                  <p className="font-semibold text-foreground text-base">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.posts.toLocaleString()} posts
                  </p>
                </div>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary hover:bg-muted">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Campus Highlights */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Campus Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {mockCampusHighlights.slice(0, 4).map((highlight) => (
            <div key={highlight.id} className="hover:bg-muted p-3 rounded-lg cursor-pointer transition-colors">
              <h4 className="font-semibold text-foreground text-base">{highlight.title}</h4>
              <p className="text-sm text-muted-foreground mt-1">{highlight.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {highlight.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary hover:bg-muted">
            View all announcements
          </Button>
        </CardContent>
      </Card>

      {/* Who to follow */}
      <Card className="bg-muted/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: 'Study Group Hub', handle: '@studygroups', verified: true },
            { name: 'Career Center', handle: '@careers', verified: false },
            { name: 'Campus Events', handle: '@campuslife', verified: true }
          ].map((user, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="font-semibold text-foreground">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.handle}</p>
                </div>
              </div>
              <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-4">
                Follow
              </Button>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary hover:bg-muted">
            Show more
          </Button>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
