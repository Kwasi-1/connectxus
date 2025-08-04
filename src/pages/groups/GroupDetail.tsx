
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, Lock, ArrowLeft, Crown, Settings } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { mockGroups } from '@/data/mockCommunitiesData';
import { Group } from '@/types/communities';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGroup = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      const foundGroup = mockGroups.find(g => g.id === id);
      setGroup(foundGroup || null);
      setIsLoading(false);
    };

    loadGroup();
  }, [id]);

  const handleJoinGroup = () => {
    if (group) {
      setGroup({
        ...group,
        isJoined: !group.isJoined,
        memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1
      });
    }
  };

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <LoadingSpinner size="lg" />
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h1 className="text-2xl font-bold mb-2">Group Not Found</h1>
          <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/groups')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  const getJoinButtonText = () => {
    if (group.isJoined) return 'Leave Group';
    if (group.isPrivate) return 'Request Access';
    return 'Join Group';
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate('/groups')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Groups
        </Button>

        {/* Group Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback className="text-lg">{group.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {group.name}
                      {group.isPrivate && <Lock className="h-5 w-5 text-muted-foreground" />}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge variant="secondary">{group.category}</Badge>
                      <span className="text-muted-foreground flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {group.memberCount}{group.maxMembers ? `/${group.maxMembers}` : ''} members
                      </span>
                      {group.isPrivate && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Lock className="h-3 w-3" />
                          Private
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Crown className="h-4 w-4" />
                      Created by {group.creator.name}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {group.isCreator && (
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Manage
                      </Button>
                    )}
                    <Button
                      onClick={handleJoinGroup}
                      variant={group.isJoined ? 'outline' : 'default'}
                    >
                      {getJoinButtonText()}
                    </Button>
                  </div>
                </div>
                <p className="text-muted-foreground mt-3">{group.description}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {group.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Group Content Tabs */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList>
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Chat functionality coming soon!</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="members">
            <Card>
              <CardContent className="py-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={group.creator.avatar} alt={group.creator.name} />
                      <AvatarFallback>{group.creator.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{group.creator.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Creator
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    +{group.memberCount - 1} other members
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="resources">
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">No resources shared yet.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GroupDetail;
