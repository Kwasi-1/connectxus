
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Users, Lock, Calendar, Settings, MessageCircle, Share, UserMinus, Files, Briefcase, UserPlus, CheckCircle } from 'lucide-react';
import { mockGroups, mockUsers } from '@/data/mockCommunitiesData';
import { Group, ProjectRole, RoleApplication } from '@/types/communities';
import { User } from '@/types/global';
import { ProjectRoleApplicationsModal } from '@/components/groups/ProjectRoleApplicationsModal';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type GroupTab = 'members' | 'resources' | 'roles' | 'settings';

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
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupTags, setGroupTags] = useState('');
  
  const currentUserId = 'user-1'; // Mock current user ID

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const foundGroup = mockGroups.find(g => g.id === id);
        if (foundGroup) {
          setGroup(foundGroup);
          setGroupName(foundGroup.name);
          setGroupDescription(foundGroup.description);
          setGroupTags(foundGroup.tags.join(', '));
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

  const isOwner = group?.createdBy === currentUserId;
  const isAdmin = group?.admins.includes(currentUserId) || isOwner;
  const isModerator = group?.moderators.includes(currentUserId);
  const canManage = isAdmin || isModerator;

  const handleViewApplications = (role: ProjectRole) => {
    setSelectedRole(role);
    setIsApplicationsModalOpen(true);
  };

  const handleAcceptApplication = (applicationId: string) => {
    if (!group || !selectedRole) return;
    
    setGroup({
      ...group,
      projectRoles: group.projectRoles?.map(role =>
        role.id === selectedRole.id
          ? {
              ...role,
              slotsFilled: role.slotsFilled + 1,
              applications: role.applications.map(app =>
                app.id === applicationId ? { ...app, status: 'accepted' as const } : app
              ),
            }
          : role
      ),
    });
  };

  const handleRejectApplication = (applicationId: string) => {
    if (!group || !selectedRole) return;
    
    setGroup({
      ...group,
      projectRoles: group.projectRoles?.map(role =>
        role.id === selectedRole.id
          ? {
              ...role,
              applications: role.applications.map(app =>
                app.id === applicationId ? { ...app, status: 'rejected' as const } : app
              ),
            }
          : role
      ),
    });
  };

  const handleAddMember = () => {
    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${searchEmail}`,
    });
    setSearchEmail('');
    setIsAddMemberModalOpen(false);
  };

  const handleRemoveMember = (userId: string) => {
    setMembers(members.filter(m => m.id !== userId));
    setRemovingMemberId(null);
    toast({
      title: "Member removed",
      description: "The member has been removed from the group",
    });
  };

  const handleToggleAdmin = (userId: string) => {
    if (!group) return;
    
    const isCurrentlyAdmin = group.admins.includes(userId);
    const updatedAdmins = isCurrentlyAdmin
      ? group.admins.filter(id => id !== userId)
      : [...group.admins, userId];
    
    setGroup({ ...group, admins: updatedAdmins });
    toast({
      title: isCurrentlyAdmin ? "Admin removed" : "Admin added",
      description: isCurrentlyAdmin
        ? "User is no longer an admin"
        : "User is now an admin",
    });
  };

  const getMemberRole = (memberId: string): string | null => {
    if (!group || group.groupType !== 'project') return null;
    
    for (const role of group.projectRoles || []) {
      const acceptedApp = role.applications.find(
        app => app.userId === memberId && app.status === 'accepted'
      );
      if (acceptedApp) return role.name;
    }
    return null;
  };

  const handleSaveSettings = () => {
    if (!group) return;
    
    setGroup({
      ...group,
      name: groupName,
      description: groupDescription,
      tags: groupTags.split(',').map(tag => tag.trim()).filter(Boolean),
    });
    
    toast({
      title: "Settings saved",
      description: "Group settings have been updated successfully",
    });
  };

  const handleDeleteGroup = () => {
    toast({
      title: "Group deleted",
      description: "The group has been permanently deleted",
      variant: "destructive",
    });
    navigate('/groups');
  };

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
                    {group.groupType === 'private' && <Lock className="h-4 w-4 text-muted-foreground" />}
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
                {group.groupType === 'private' && (
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
                      group.groupType === 'private' ? 'Request Access' : 'Join Group'
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
            {group.groupType === 'project' && (
              <TabsTrigger 
                value="roles" 
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Roles
              </TabsTrigger>
            )}
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
            {canManage && (
              <div className="p-4 border-b border-border">
                <Button onClick={() => setIsAddMemberModalOpen(true)} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Member
                </Button>
              </div>
            )}
            {membersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {members.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No members to display</p>
                  </div>
                ) : (
                  members.map((member) => {
                    const memberRole = getMemberRole(member.id);
                    const isMemberAdmin = group.admins.includes(member.id) || member.id === group.createdBy;
                    
                    return (
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
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">@{member.username}</p>
                              {memberRole && (
                                <Badge variant="outline" className="text-xs">
                                  <Briefcase className="h-3 w-3 mr-1" />
                                  {memberRole}
                                </Badge>
                              )}
                            </div>
                          </div>
                          {member.id === group.createdBy && (
                            <Badge variant="default" className="text-xs">Owner</Badge>
                          )}
                          {isMemberAdmin && member.id !== group.createdBy && (
                            <Badge variant="secondary" className="text-xs">Admin</Badge>
                          )}
                          {group.moderators.includes(member.id) && (
                            <Badge variant="outline" className="text-xs">Moderator</Badge>
                          )}
                          {isOwner && member.id !== currentUserId && (
                            <div className="flex gap-2">
                              {member.id !== group.createdBy && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleToggleAdmin(member.id)}
                                >
                                  {isMemberAdmin ? 'Remove Admin' : 'Make Admin'}
                                </Button>
                              )}
                              {!isMemberAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRemovingMemberId(member.id)}
                                >
                                  Remove
                                </Button>
                              )}
                            </div>
                          )}
                          {isAdmin && !isOwner && member.id !== currentUserId && !isMemberAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRemovingMemberId(member.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          {group.groupType === 'project' && (
            <TabsContent value="roles" className="mt-0">
              <div className="p-4 space-y-4">
                {group.projectRoles?.map((role) => {
                  const pendingCount = role.applications.filter(app => app.status === 'pending').length;
                  const isFilled = role.slotsFilled >= role.slotsTotal;
                  
                  return (
                    <div key={role.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{role.name}</h3>
                            {isFilled && (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Filled
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{role.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              {role.slotsFilled} / {role.slotsTotal} filled
                            </span>
                            {pendingCount > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {pendingCount} pending
                              </Badge>
                            )}
                          </div>
                        </div>
                        {canManage && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewApplications(role)}
                          >
                            {pendingCount > 0 ? `Review (${pendingCount})` : 'View'}
                          </Button>
                        )}
                      </div>
                      
                      {/* Show accepted members for this role */}
                      {role.applications.filter(app => app.status === 'accepted').length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Team Members:</p>
                          <div className="flex flex-wrap gap-2">
                            {role.applications
                              .filter(app => app.status === 'accepted')
                              .map(app => (
                                <div key={app.id} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={app.userAvatar} />
                                    <AvatarFallback className="text-xs">
                                      {app.userName.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{app.userName}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {(!group.projectRoles || group.projectRoles.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    No roles defined yet
                  </div>
                )}
              </div>
            </TabsContent>
          )}

          
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
                    <div className="space-y-2">
                      <Label htmlFor="group-name">Group Name</Label>
                      <Input
                        id="group-name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        placeholder="Enter group name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="group-description">Group Description</Label>
                      <Textarea
                        id="group-description"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        placeholder="Describe your group"
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="group-tags">Group Tags</Label>
                      <Input
                        id="group-tags"
                        value={groupTags}
                        onChange={(e) => setGroupTags(e.target.value)}
                        placeholder="Enter tags separated by commas"
                      />
                      <p className="text-xs text-muted-foreground">
                        Separate tags with commas (e.g., python, web development, beginner)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Group Type</Label>
                      <Select value={group?.groupType} disabled>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="project">Project-Based</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Group type cannot be changed after creation
                      </p>
                    </div>

                    <Button onClick={handleSaveSettings}>
                      Save Changes
                    </Button>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium text-destructive mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete this group, there is no going back. Please be certain.
                  </p>
                  <AlertDialog>
                    <Button variant="destructive" size="sm" onClick={() => {}}>
                      Delete Group
                    </Button>
                  </AlertDialog>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Modals */}
      {selectedRole && (
        <ProjectRoleApplicationsModal
          open={isApplicationsModalOpen}
          onOpenChange={setIsApplicationsModalOpen}
          role={selectedRole}
          onAcceptApplication={handleAcceptApplication}
          onRejectApplication={handleRejectApplication}
        />
      )}

      <Dialog open={isAddMemberModalOpen} onOpenChange={setIsAddMemberModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Group</DialogTitle>
            <DialogDescription>
              {group.groupType === 'private' 
                ? 'Invite someone to this private group by their email'
                : 'Add a new member to the group'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="student@university.edu"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddMemberModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMember} disabled={!searchEmail}>
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removingMemberId} onOpenChange={() => setRemovingMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member from the group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => removingMemberId && handleRemoveMember(removingMemberId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default GroupDetail;
