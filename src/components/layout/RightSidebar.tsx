import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingTopic, CampusHighlight } from '@/types/global';

interface RightSidebarProps {
  trendingTopics: TrendingTopic[];
  campusHighlights: CampusHighlight[];
}

export function RightSidebar({ trendingTopics, campusHighlights }: RightSidebarProps) {
  return (
    <div className="w-80 p-4 space-y-4">
      {/* Trending Topics */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">What's happening</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div key={topic.id} className="hover:bg-hover p-2 rounded-lg cursor-pointer transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {index + 1} · Trending in {topic.category}
                  </p>
                  <p className="font-semibold text-foreground">{topic.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {topic.posts.toLocaleString()} posts
                  </p>
                </div>
              </div>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary hover:bg-hover">
            Show more
          </Button>
        </CardContent>
      </Card>

      {/* Campus Highlights */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Campus Highlights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {campusHighlights.map((highlight) => (
            <div key={highlight.id} className="hover:bg-hover p-2 rounded-lg cursor-pointer transition-colors">
              <h4 className="font-semibold text-foreground">{highlight.title}</h4>
              <p className="text-sm text-muted-foreground">{highlight.description}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {highlight.createdAt.toLocaleDateString()}
              </p>
            </div>
          ))}
          <Button variant="ghost" className="w-full text-primary hover:bg-hover">
            View all announcements
          </Button>
        </CardContent>
      </Card>

      {/* Suggested Connections */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Who to follow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">Study Group Hub</p>
                <p className="text-xs text-muted-foreground">@studygroups</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              Follow
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full"></div>
              <div>
                <p className="font-semibold text-sm">Career Center</p>
                <p className="text-xs text-muted-foreground">@careers</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="rounded-full">
              Follow
            </Button>
          </div>
          <Button variant="ghost" className="w-full text-primary hover:bg-hover">
            Show more
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}