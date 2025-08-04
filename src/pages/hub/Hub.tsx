
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Lock, ArrowRight } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockCommunities, mockGroups } from '@/data/mockCommunitiesData';
import { Community, Group } from '@/types/communities';

const Hub = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCommunities(mockCommunities.slice(0, 4));
      setGroups(mockGroups.slice(0, 4));
      setIsLoading(false);
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <LoadingSpinner size="lg" />
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Communities & Groups</h1>
          <p className="text-muted-foreground">Discover communities and join groups that match your interests</p>
        </div>

        {/* Top Communities Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Top Communities</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/communities')}
              className="flex items-center gap-2"
            >
              View All Communities <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {communities.map((community) => (
              <Card 
                key={community.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/communities/${community.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={community.avatar} alt={community.name} />
                      <AvatarFallback>{community.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{community.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {community.memberCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">{community.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Top Groups Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Top Groups</h2>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/groups')}
              className="flex items-center gap-2"
            >
              View All Groups <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Card 
                key={group.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={group.avatar} alt={group.name} />
                      <AvatarFallback>{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        {group.name}
                        {group.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{group.category}</Badge>
                        <span className="text-sm text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {group.memberCount}/{group.maxMembers}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{group.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {group.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Hub;
