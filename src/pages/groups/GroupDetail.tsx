
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Users, Lock, Calendar, Settings } from 'lucide-react';
import { mockGroups } from '@/data/mockCommunitiesData';
import { Group } from '@/types/communities';

type GroupTab = 'chat' | 'members' | 'resources';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<GroupTab>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const currentUserId = 'user-1'; // Mock current user ID

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundGroup = mockGroups.find(g => g.id === id);
        if (foundGroup) {
          setGroup(foundGroup);
        }
      } catch (error) {
        console.error('Error fetching group:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGroup();
    }
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

  const isCreator = group?.createdBy === currentUserId;

  if (isLoading) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="border-r border-border">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout showRightSidebar={false}>
        <div className="border-r border-border p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Group not found</h2>
          <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/groups')}>
            Back to Groups
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout showRightSidebar={false}>
      <div className="border-r border-border">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/groups')}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">{group.name}</h1>
                    {group.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.memberCount} members
                  </p>
                </div>
              </div>
              {isCreator && (
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Group Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback className="text-lg">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{group.name}</h2>
                {group.isPrivate && (
                  <Badge variant="secondary" className="gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-3">{group.description}</p>
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary">{group.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {group.memberCount} members
                </span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {group.createdAt.toLocaleDateString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {group.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              {!isCreator && (
                <Button
                  onClick={handleJoinGroup}
                  variant={group.isJoined ? 'outline' : 'default'}
                >
                  {group.isJoined ? 'Leave Group' : (group.isPrivate ? 'Request Access' : 'Join Group')}
                </Button>
              )}
              {isCreator && (
                <Button variant="outline">
                  Manage Group
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GroupTab)}>
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger 
              value="chat" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger 
              value="members" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Members
            </TabsTrigger>
            <TabsTrigger 
              value="resources" 
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="mt-0">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Group chat will be available soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="members" className="mt-0">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Members list will be displayed here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="resources" className="mt-0">
            <div className="p-8 text-center">
              <p className="text-muted-foreground">Shared resources will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GroupDetail;
