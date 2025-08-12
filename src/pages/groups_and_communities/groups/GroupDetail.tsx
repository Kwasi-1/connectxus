
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Lock, Calendar, Settings, MessageCircle, Share, UserMinus, Files, Copy, ExternalLink } from 'lucide-react';
import { mockGroups, mockUsers } from '@/data/mockCommunitiesData';
import { Group } from '@/types/communities';
import { User } from '@/types/global';

type GroupTab = 'members' | 'resources' | 'settings';

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GroupTab>('members');
  const [isLoading, setIsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  const currentUserId = 'user-1'; // Mock current user ID

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      try {
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

  useEffect(() => {
    if (activeTab === 'members' && group) {
      fetchMembers();
    } else if (activeTab === 'resources' && group) {
      fetchResources();
    }
  }, [activeTab, group]);

  const fetchMembers = async () => {
    setMembersLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      // Mock members - in real app, this would be an API call
      setMembers(mockUsers.slice(0, 3));
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setMembersLoading(false);
    }
  };

  const fetchResources = async () => {
    setResourcesLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      // Mock resources
      setResources([
        { id: '1', name: 'Study Guide - Data Structures', type: 'PDF', uploadedBy: 'John Doe', uploadedAt: new Date() },
        { id: '2', name: 'Algorithms Cheat Sheet', type: 'PDF', uploadedBy: 'Sarah Johnson', uploadedAt: new Date() },
        { id: '3', name: 'Practice Problems', type: 'Link', uploadedBy: 'Mike Wilson', uploadedAt: new Date() }
      ]);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleJoinGroup = () => {
    if (group) {
      const isJoining = !group.isJoined;
      setGroup({
        ...group,
        isJoined: isJoining,
        memberCount: isJoining ? group.memberCount + 1 : group.memberCount - 1
      });
      
      toast({
        title: isJoining ? "Joined group!" : "Left group",
        description: isJoining 
          ? `You've successfully joined ${group.name}` 
          : `You've left ${group.name}`,
      });
    }
  };

  const handleChatClick = () => {
    if (group && group.isJoined) {
      // Navigate to messages page with the group chat selected
      navigate('/messages', { 
        state: { 
          selectedGroupId: id,
          selectedGroupName: group.name,
          selectedGroupAvatar: group.avatar 
        } 
      });
    } else {
      toast({
        title: "Join group first",
        description: "You need to join the group to access the chat",
        variant: "destructive"
      });
    }
  };

  const handleShareGroup = async () => {
    const groupUrl = `${window.location.origin}/groups/${id}`;
    
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({
          title: group?.name,
          text: `Check out this group: ${group?.description}`,
          url: groupUrl,
        });
        toast({
          title: "Shared successfully!",
          description: "Group link has been shared"
        });
      } catch (error) {
        // If sharing fails, fall back to copying
        await copyToClipboard(groupUrl);
      }
    } else {
      // Fall back to copying to clipboard
      await copyToClipboard(groupUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Link copied!",
        description: "Group link has been copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive"
      });
    }
  };

  const isAdmin = group?.admins.includes(currentUserId);
  const isModerator = group?.moderators.includes(currentUserId);
  const canManage = isAdmin || isModerator;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (!group) {
    return (
      <AppLayout>
        <div className="border-r border-border p-8 text-center h-full">
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
    <AppLayout>
      <div className="border-r border-border h-full">
        {/* Header */}
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-b border-border">
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
              <div className="flex items-center gap-2">
                {group.isJoined && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleChatClick}
                    className="hover:bg-primary/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleShareGroup}
                  className="hover:bg-primary/10"
                >
                  <Share className="h-4 w-4" />
                </Button>
                {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )}
              </div>
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
              <div className="flex gap-2">
                {!canManage && (
                  <Button
                    onClick={handleJoinGroup}
                    variant={group.isJoined ? 'outline' : 'default'}
                  >
                    {group.isJoined ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Leave Group
                      </>
                    ) : (
                      group.isPrivate ? 'Request Access' : 'Join Group'
                    )}
                  </Button>
                )}
                {canManage && (
                  <Button variant="outline" onClick={() => setActiveTab('settings')}>
                    Manage Group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as GroupTab)}>
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
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
            {canManage && (
              <TabsTrigger 
                value="settings" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Settings
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="members" className="mt-0">
            {membersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {members.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No members to display</p>
                  </div>
                ) : (
                  members.map((member) => (
                    <div key={member.id} className="p-4 hover:bg-muted/5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar} alt={member.displayName} />
                          <AvatarFallback>
                            {member.displayName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{member.displayName}</h3>
                            {member.verified && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <span className="text-primary-foreground text-xs">✓</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">@{member.username}</p>
                        </div>
                        {group.admins.includes(member.id) && (
                          <Badge variant="secondary" className="text-xs">Admin</Badge>
                        )}
                        {group.moderators.includes(member.id) && (
                          <Badge variant="outline" className="text-xs">Moderator</Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="mt-0">
            {resourcesLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {resources.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No resources shared yet</p>
                  </div>
                ) : (
                  resources.map((resource) => (
                    <div key={resource.id} className="p-4 hover:bg-muted/5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Files className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{resource.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {resource.type} • Shared by {resource.uploadedBy} • {resource.uploadedAt.toLocaleDateString()}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </TabsContent>

          {canManage && (
            <TabsContent value="settings" className="mt-0">
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Group Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Group Description</label>
                      <p className="text-sm text-muted-foreground mt-1">Update your group description</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Privacy Settings</label>
                      <p className="text-sm text-muted-foreground mt-1">Change group visibility and access</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Member Management</label>
                      <p className="text-sm text-muted-foreground mt-1">Manage member roles and permissions</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Group Tags</label>
                      <p className="text-sm text-muted-foreground mt-1">Edit tags to help others discover your group</p>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h4>
                  <Button variant="destructive" size="sm">
                    Delete Group
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default GroupDetail;
