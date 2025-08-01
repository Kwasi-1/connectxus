
import { Search, Settings, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightSidebar } from '@/components/layout/RightSidebar';
import { mockTrendingTopics, mockCampusHighlights } from '@/data/mockData';

const trendingNews = [
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

const trendingTopics = [
  { topic: 'Zionisme', location: 'Trending in Netherlands', posts: null },
  { topic: 'Wolven', location: 'Trending in Netherlands', posts: '1,849 posts' },
  { topic: '#EpsteinTrumpFiles', category: 'Politics', posts: '20.5K posts' },
  { topic: '#azlives', location: 'Trending in Netherlands', posts: null },
  { topic: 'DRILL THE TORIC', category: 'Trending', posts: null }
];

const Explore = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex max-w-7xl mx-auto">
        {/* Left Sidebar */}
        <div className="hidden lg:block">
          <Sidebar activeTab="explore" />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 min-w-0 border-r border-border">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4 flex-1 max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input 
                    placeholder="Search" 
                    className="pl-10 bg-muted border-none rounded-full"
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
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                >
                  For You
                </TabsTrigger>
                <TabsTrigger 
                  value="trending" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                >
                  Trending
                </TabsTrigger>
                <TabsTrigger 
                  value="news" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                >
                  News
                </TabsTrigger>
                <TabsTrigger 
                  value="sports" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
                >
                  Sports
                </TabsTrigger>
                <TabsTrigger 
                  value="entertainment" 
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent py-4"
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
                      <div key={news.id} className="p-4 hover:bg-hover cursor-pointer transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="flex -space-x-1">
                                {news.images.map((img, idx) => (
                                  <img 
                                    key={idx} 
                                    src={img} 
                                    alt="" 
                                    className="w-5 h-5 rounded-full border border-background"
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">{news.time} • {news.category} • {news.posts}</span>
                            </div>
                            <h3 className="font-bold text-foreground mb-1">{news.title}</h3>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Trending Section */}
                  <div className="mt-8">
                    <h3 className="font-bold text-muted-foreground mb-4">Trending in Netherlands</h3>
                    <div className="space-y-3">
                      {trendingTopics.map((trend, idx) => (
                        <div key={idx} className="p-3 hover:bg-hover cursor-pointer transition-colors">
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
                            <Button variant="ghost" size="sm" className="text-muted-foreground">
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
                      <div key={idx} className="p-4 hover:bg-hover cursor-pointer transition-colors rounded-lg">
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
        </div>
        
        {/* Right Sidebar */}
        <div className="hidden xl:block">
          <RightSidebar 
            trendingTopics={mockTrendingTopics}
            campusHighlights={mockCampusHighlights}
          />
        </div>
      </div>
    </div>
  );
};

export default Explore;
