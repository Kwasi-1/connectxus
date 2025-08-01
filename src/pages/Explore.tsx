import { Search, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import type { ExploreTab, NewsItem, TrendingItem } from '@/types/global.d';

const trendingNews: NewsItem[] = [
  {
    id: '1',
    category: 'Sports',
    title: "Yamal's Brace Secures Barcelona's Seoul Victory",
    posts: '13K posts',
    time: '5 hours ago',
    images: ['/api/placeholder/48/48', '/api/placeholder/48/48']
  },
  {
    id: '2',
    category: 'Sports',
    title: 'Tottenham Wins Hong Kong Derby Against Arsenal',
    posts: '14K posts',
    time: '2 hours ago',
    images: ['/api/placeholder/48/48', '/api/placeholder/48/48']
  },
  {
    id: '3',
    category: 'News',
    title: 'Truck Brake Failure Leads to Bus Collision',
    posts: '1.3K posts',
    time: '7 hours ago',
    images: ['/api/placeholder/48/48']
  }
];

const trendingTopics: TrendingItem[] = [
  { topic: 'Zionisme', location: 'Trending in Netherlands' },
  { topic: 'Wolven', location: 'Trending in Netherlands', posts: '1,849 posts' },
  { topic: '#EpsteinTrumpFiles', category: 'Politics', posts: '20.5K posts' },
  { topic: '#azlives', location: 'Trending in Netherlands' },
  { topic: 'DRILL THE TORIC', category: 'Trending' }
];

const Explore = () => {
  return (
    <AppLayout activeTab="explore">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search" 
                className="pl-12 bg-muted border-none rounded-full h-12"
              />
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="for-you" className="w-full">
          <TabsList className="w-full bg-transparent h-auto p-0 border-b border-border rounded-none">
            <TabsTrigger 
              value="for-you" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              For You
            </TabsTrigger>
            <TabsTrigger 
              value="trending" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              Trending
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              News
            </TabsTrigger>
            <TabsTrigger 
              value="sports" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              Sports
            </TabsTrigger>
            <TabsTrigger 
              value="entertainment" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4 font-medium"
            >
              Entertainment
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="for-you" className="mt-0">
            <div className="p-4">
              <h2 className="text-xl font-bold mb-6">Today's News</h2>
              
              {/* News Items */}
              <div className="space-y-4">
                {trendingNews.map((news) => (
                  <div key={news.id} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="flex -space-x-1">
                            {news.images?.map((img, idx) => (
                              <img 
                                key={idx} 
                                src={img} 
                                alt="" 
                                className="w-6 h-6 rounded-full border-2 border-background"
                              />
                            ))}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {news.time} • {news.category} • {news.posts}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground text-lg leading-tight">{news.title}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Trending Section */}
              <div className="mt-8">
                <h3 className="font-bold text-muted-foreground mb-4">Trending in Netherlands</h3>
                <div className="space-y-2">
                  {trendingTopics.map((trend, idx) => (
                    <div key={idx} className="p-3 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          {trend.category && (
                            <p className="text-sm text-muted-foreground">{trend.category} • Trending</p>
                          )}
                          {trend.location && !trend.category && (
                            <p className="text-sm text-muted-foreground">{trend.location}</p>
                          )}
                          <p className="font-bold text-foreground">{trend.topic}</p>
                          {trend.posts && (
                            <p className="text-sm text-muted-foreground">{trend.posts}</p>
                          )}
                        </div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground rounded-full p-1">
                          •••
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="p-4">
              <div className="space-y-3">
                {trendingTopics.map((trend, idx) => (
                  <div key={idx} className="p-4 hover:bg-muted/50 cursor-pointer transition-colors rounded-lg">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-foreground">{trend.topic}</p>
                        <p className="text-sm text-muted-foreground">{trend.posts || trend.location}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="news">
            <div className="p-4">
              <div className="space-y-4">
                {trendingNews.filter(news => news.category === 'News').map((news) => (
                  <div key={news.id} className="p-4 border border-border rounded-lg hover:bg-hover cursor-pointer transition-colors">
                    <h3 className="font-bold text-foreground mb-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground">{news.posts} • {news.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="sports">
            <div className="p-4">
              <div className="space-y-4">
                {trendingNews.filter(news => news.category === 'Sports').map((news) => (
                  <div key={news.id} className="p-4 border border-border rounded-lg hover:bg-hover cursor-pointer transition-colors">
                    <h3 className="font-bold text-foreground mb-2">{news.title}</h3>
                    <p className="text-sm text-muted-foreground">{news.posts} • {news.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="entertainment">
            <div className="p-4 text-center text-muted-foreground">
              <p>No entertainment news available at the moment.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Explore;
