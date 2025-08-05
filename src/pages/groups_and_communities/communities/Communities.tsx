
import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Search, Users, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCommunities } from '@/data/mockCommunitiesData';
import { Community, CommunityCategory, HubTab } from '@/types/communities';

const categoryFilters: CommunityCategory[] = [
  'Academic', 'Level', 'Hostel', 'Department', 'Faculty'
];

const Communities = () => {
  const [activeTab, setActiveTab] = useState<HubTab>('my');
  const [isLoading, setIsLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommunityCategory | 'All'>('All');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCommunities(mockCommunities);
      } catch (error) {
        console.error('Error fetching communities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const filteredCommunities = (communitiesList: Community[]) => {
    return communitiesList.filter(community => {
      const matchesSearch = community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           community.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || community.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const myCommunities = communities.filter(c => c.isJoined);
  const exploreCommunities = communities.filter(c => !c.isJoined);

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(communities.map(community =>
      community.id === communityId
        ? { 
            ...community, 
            isJoined: !community.isJoined, 
            memberCount: community.isJoined ? community.memberCount - 1 : community.memberCount + 1 
          }
        : community
    ));
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/hub')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">Communities</h1>
              </div>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const CommunityCard = ({ community, showJoinButton = false }: { community: Community; showJoinButton?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div 
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => navigate(`/communities/${community.id}`)}
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={community.coverImage} alt={community.name} />
              <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg">{community.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{community.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {community.memberCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          {showJoinButton && (
            <Button
              onClick={() => handleJoinCommunity(community.id)}
              variant={community.isJoined ? 'outline' : 'default'}
              size="sm"
            >
              {community.isJoined ? 'Leave' : 'Join'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">{community.description}</p>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-border">
          <div className="px-4 py-3">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/hub')}
                className="p-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-xl font-bold text-foreground">Communities</h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HubTab)}>
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
              <TabsTrigger 
                value="my" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                My Communities
              </TabsTrigger>
              <TabsTrigger 
                value="explore" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Explore
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my" className="mt-0">
              <div className="p-4 space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search your communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 rounded-full"
                  />
                </div>

                {/* Communities Grid */}
                <div className="space-y-3">
                  {filteredCommunities(myCommunities).length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No communities found</h3>
                      <p className="text-muted-foreground">
                        {myCommunities.length === 0 ? "You haven't joined any communities yet" : "Try adjusting your search"}
                      </p>
                    </div>
                  ) : (
                    filteredCommunities(myCommunities).map((community) => (
                      <CommunityCard key={community.id} community={community} />
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="explore" className="mt-0">
              <div className="p-4 space-y-4">
                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-full"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedCategory === 'All' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCategory('All')}
                      className="rounded-full px-5"
                    >
                      All
                    </Button>
                    {categoryFilters.map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="rounded-full"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Communities Grid */}
                <div className="space-y-3">
                  {filteredCommunities(exploreCommunities).length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No communities found</h3>
                      <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    filteredCommunities(exploreCommunities).map((community) => (
                      <CommunityCard key={community.id} community={community} showJoinButton={true} />
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
      </div>
    </AppLayout>
  );
};

export default Communities;
