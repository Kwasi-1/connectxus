import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Lock,
  Calendar,
  Settings,
  MessageCircle,
  Share,
  UserMinus,
  Files,
  Briefcase,
  UserPlus,
  CheckCircle,
  Crown,
  Shield,
  AlertTriangle,
  Save,
  X,
} from "lucide-react";
import { mockGroups, mockUsers } from "@/data/mockCommunitiesData";
import {
  Group,
  ProjectRole,
  RoleApplication,
  MemberWithRole,
} from "@/types/communities";
import { User } from "@/types/global";
import { ProjectRoleApplicationsModal } from "@/components/groups/ProjectRoleApplicationsModal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type GroupTab = "members" | "resources" | "roles" | "settings";

interface Resource {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<GroupTab>("members");
  const [isLoading, setIsLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<MemberWithRole[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");

  // New state for confirmations and settings
  const [memberToRemove, setMemberToRemove] = useState<MemberWithRole | null>(
    null
  );
  const [memberToPromote, setMemberToPromote] = useState<MemberWithRole | null>(
    null
  );
  const [memberToDemote, setMemberToDemote] = useState<MemberWithRole | null>(
    null
  );
  const [isSettingsEditing, setIsSettingsEditing] = useState(false);
  const [editedGroup, setEditedGroup] = useState<Partial<Group>>({});

  // Settings state
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groupType, setGroupType] = useState<"public" | "private" | "project">(
    "public"
  );
  const [requireApproval, setRequireApproval] = useState(false);
  const [allowMemberInvites, setAllowMemberInvites] = useState(true);
  const [groupTags, setGroupTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Update settings state when group data is loaded
  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
      setGroupType(group.groupType);
      setGroupTags(group.tags || []);
    }
  }, [group]);

  // Settings handlers
  const handleUpdateGroupInfo = useCallback(() => {
    if (!group) return;

    // Update group name and description in the group state
    setGroup({
      ...group,
      name: groupName,
      description: groupDescription,
    });

    toast({
      title: "Group updated",
      description: "Group information has been successfully updated",
    });
  }, [group, groupName, groupDescription, toast]);

  const handleUpdatePrivacySettings = useCallback(() => {
    if (!group) return;

    // Update privacy settings in the group state
    setGroup({
      ...group,
      groupType: groupType,
    });

    toast({
      title: "Privacy settings updated",
      description: "Group privacy settings have been successfully updated",
    });
  }, [group, groupType, toast]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !groupTags.includes(newTag.trim()) && group) {
      const updatedTags = [...groupTags, newTag.trim()];
      setGroupTags(updatedTags);

      // Update the group state with new tags
      setGroup({
        ...group,
        tags: updatedTags,
      });

      setNewTag("");

      toast({
        title: "Tag added",
        description: `"${newTag.trim()}" has been added to group tags`,
      });
    }
  }, [newTag, groupTags, group, toast]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = groupTags.filter((tag) => tag !== tagToRemove);
      setGroupTags(updatedTags);

      if (group) {
        // Update the group state with new tags
        setGroup({
          ...group,
          tags: updatedTags,
        });

        toast({
          title: "Tag removed",
          description: `"${tagToRemove}" has been removed from group tags`,
        });
      }
    },
    [groupTags, group, toast]
  );

  const handleDeleteGroup = useCallback(() => {
    // Delete group logic
    console.log("Deleting group:", group?.id);
    setShowDeleteConfirm(false);
    // Navigate back to groups list
    navigate("/groups");
  }, [group?.id, navigate]);

  const currentUserId = "user-1"; // Mock current user ID

  useEffect(() => {
    const fetchGroup = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const foundGroup = mockGroups.find((g) => g.id === id);
        if (foundGroup) {
          setGroup(foundGroup);
        }
      } catch (error) {
        console.error("Error fetching group:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchGroup();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "members" && group) {
      fetchMembers();
    } else if (activeTab === "resources" && group) {
      fetchResources();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, group]);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Mock members - in real app, this would be an API call
      const baseMembers = mockUsers.slice(0, 3);

      // Add roles for project-based groups
      const membersWithRoles: MemberWithRole[] = baseMembers.map(
        (member, index) => {
          if (group?.groupType === "project") {
            const projectRoles = [
              "Frontend Developer",
              "Backend Developer",
              "UI/UX Designer",
            ];
            return {
              ...member,
              role: projectRoles[index % projectRoles.length],
            };
          }
          return member;
        }
      );

      setMembers(membersWithRoles);
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setMembersLoading(false);
    }
  }, [group?.groupType]);

  const fetchResources = useCallback(async () => {
    setResourcesLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      // Mock resources
      setResources([
        {
          id: "1",
          name: "Study Guide - Data Structures",
          type: "PDF",
          uploadedBy: "John Doe",
          uploadedAt: new Date(),
        },
        {
          id: "2",
          name: "Algorithms Cheat Sheet",
          type: "PDF",
          uploadedBy: "Sarah Johnson",
          uploadedAt: new Date(),
        },
        {
          id: "3",
          name: "Practice Problems",
          type: "Link",
          uploadedBy: "Mike Wilson",
          uploadedAt: new Date(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setResourcesLoading(false);
    }
  }, []);

  const handleJoinGroup = () => {
    if (group) {
      const isJoining = !group.isJoined;
      setGroup({
        ...group,
        isJoined: isJoining,
        memberCount: isJoining ? group.memberCount + 1 : group.memberCount - 1,
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
      navigate("/messages", {
        state: {
          selectedGroupId: id,
          selectedGroupName: group.name,
          selectedGroupAvatar: group.avatar,
        },
      });
    } else {
      toast({
        title: "Join group first",
        description: "You need to join the group to access the chat",
        variant: "destructive",
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
          description: "Group link has been shared",
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
        description: "Group link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  const isAdmin = group?.admins.includes(currentUserId);
  const isModerator = group?.moderators.includes(currentUserId);
  const canManage = isAdmin || isModerator;
  const isOwner = group?.createdBy === currentUserId;

  // Admin management functions
  const handlePromoteToAdmin = useCallback(
    (userId: string) => {
      if (!group || !isOwner) return;

      setGroup({
        ...group,
        admins: [...group.admins, userId],
        moderators: group.moderators.filter((id) => id !== userId), // Remove from moderators if present
      });

      toast({
        title: "Member promoted",
        description: "Member has been promoted to admin",
      });
      setMemberToPromote(null);
    },
    [group, isOwner, toast]
  );

  const handleDemoteFromAdmin = useCallback(
    (userId: string) => {
      if (!group || !isOwner || userId === currentUserId) return;

      setGroup({
        ...group,
        admins: group.admins.filter((id) => id !== userId),
      });

      toast({
        title: "Admin demoted",
        description: "Admin has been demoted to regular member",
      });
      setMemberToDemote(null);
    },
    [group, isOwner, currentUserId, toast]
  );

  const handlePromoteToModerator = (userId: string) => {
    if (!group || !canManage) return;

    setGroup({
      ...group,
      moderators: [...group.moderators, userId],
    });

    toast({
      title: "Member promoted",
      description: "Member has been promoted to moderator",
    });
  };

  const handleDemoteFromModerator = (userId: string) => {
    if (!group || !canManage) return;

    setGroup({
      ...group,
      moderators: group.moderators.filter((id) => id !== userId),
    });

    toast({
      title: "Moderator demoted",
      description: "Moderator has been demoted to regular member",
    });
  };

  const handleViewApplications = (role: ProjectRole) => {
    setSelectedRole(role);
    setIsApplicationsModalOpen(true);
  };

  const handleAcceptApplication = (applicationId: string) => {
    if (!group || !selectedRole) return;

    setGroup({
      ...group,
      projectRoles: group.projectRoles?.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              slotsFilled: role.slotsFilled + 1,
              applications: role.applications.map((app) =>
                app.id === applicationId
                  ? { ...app, status: "accepted" as const }
                  : app
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
      projectRoles: group.projectRoles?.map((role) =>
        role.id === selectedRole.id
          ? {
              ...role,
              applications: role.applications.map((app) =>
                app.id === applicationId
                  ? { ...app, status: "rejected" as const }
                  : app
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
    setSearchEmail("");
    setIsAddMemberModalOpen(false);
  };

  const handleRemoveMember = useCallback((member: MemberWithRole) => {
    setMemberToRemove(member);
  }, []);

  // Confirmation handlers
  const confirmRemoveMember = useCallback(() => {
    if (memberToRemove && group) {
      // Actually remove the member from the members state and update group member count
      setMembers((prevMembers) =>
        prevMembers.filter((m) => m.id !== memberToRemove.id)
      );
      setGroup({
        ...group,
        memberCount: group.memberCount - 1,
      });

      toast({
        title: "Member removed",
        description: `${memberToRemove.displayName} has been removed from the group`,
      });

      setMemberToRemove(null);
    }
  }, [memberToRemove, group, toast]);

  const confirmPromoteToAdmin = useCallback(() => {
    if (memberToPromote) {
      handlePromoteToAdmin(memberToPromote.id);
      setMemberToPromote(null);
    }
  }, [memberToPromote, handlePromoteToAdmin]);

  const confirmDemoteFromAdmin = useCallback(() => {
    if (memberToDemote) {
      handleDemoteFromAdmin(memberToDemote.id);
      setMemberToDemote(null);
    }
  }, [memberToDemote, handleDemoteFromAdmin]);

  const handleEditSettings = () => {
    setIsSettingsEditing(true);
    setEditedGroup({
      name: group?.name,
      description: group?.description,
      groupType: group?.groupType,
      tags: group?.tags,
    });
  };

  const handleSaveSettings = () => {
    if (!group) return;

    setGroup({
      ...group,
      ...editedGroup,
    });

    setIsSettingsEditing(false);
    toast({
      title: "Settings updated",
      description: "Group settings have been saved successfully",
    });
  };

  const handleCancelSettings = () => {
    setIsSettingsEditing(false);
    setEditedGroup({});
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
          <p className="text-muted-foreground mb-4">
            The group you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/groups")}>Back to Groups</Button>
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
                  onClick={() => navigate("/groups")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-foreground">
                      {group.name}
                    </h1>
                    {group.groupType === "private" && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.memberCount} members
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2">
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
                {/* {canManage && (
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('settings')}>
                    <Settings className="h-4 w-4" />
                  </Button>
                )} */}
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
                {group.groupType === "private" && (
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
                    variant={group.isJoined ? "outline" : "default"}
                  >
                    {group.isJoined ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Leave Group
                      </>
                    ) : group.groupType === "private" ? (
                      "Request Access"
                    ) : (
                      "Join Group"
                    )}
                  </Button>
                )}
                {canManage && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("settings")}
                    >
                      Manage Group
                    </Button>

                    <Button onClick={() => setIsAddMemberModalOpen(true)}>
                      <UserPlus className="h-4 w-4" />
                      <span className="hidden md:block ml-2">Add Member</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as GroupTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="members"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Members
            </TabsTrigger>
            {group.groupType === "project" && (
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
            {membersLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="divide-y divide-border">
                {members.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No members to display
                    </p>
                  </div>
                ) : (
                  members.map((member) => {
                    const isCurrentUser = member.id === currentUserId;
                    const isMemberAdmin = group?.admins.includes(member.id);
                    const isMemberModerator = group?.moderators.includes(
                      member.id
                    );
                    const isGroupOwner = group?.createdBy === member.id;

                    return (
                      <div key={member.id} className="p-4 hover:bg-muted/5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={member.avatar}
                              alt={member.displayName}
                            />
                            <AvatarFallback>
                              {member.displayName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">
                                {member.displayName}
                              </h3>
                              {member.verified && (
                                <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                  <span className="text-primary-foreground text-xs">
                                    ✓
                                  </span>
                                </div>
                              )}
                              {isGroupOwner && (
                                <Badge
                                  variant="default"
                                  className="text-xs gap-1"
                                >
                                  <Crown className="h-3 w-3" />
                                  Owner
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              @{member.username}
                            </p>
                            {member.role && group?.groupType === "project" && (
                              <p className="text-xs text-primary font-medium">
                                {member.role}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {isMemberAdmin && !isGroupOwner && (
                              <Badge
                                variant="secondary"
                                className="text-xs gap-1"
                              >
                                <Shield className="h-3 w-3" />
                                Admin
                              </Badge>
                            )}
                            {isMemberModerator && !isMemberAdmin && (
                              <Badge variant="outline" className="text-xs">
                                Moderator
                              </Badge>
                            )}

                            {canManage && !isCurrentUser && !isGroupOwner && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    •••
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  {isOwner && !isMemberAdmin && (
                                    <DropdownMenuItem
                                      onClick={() => setMemberToPromote(member)}
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      Promote to Admin
                                    </DropdownMenuItem>
                                  )}
                                  {isOwner && isMemberAdmin && (
                                    <DropdownMenuItem
                                      onClick={() => setMemberToDemote(member)}
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      Demote from Admin
                                    </DropdownMenuItem>
                                  )}
                                  {canManage &&
                                    !isMemberModerator &&
                                    !isMemberAdmin && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handlePromoteToModerator(member.id)
                                        }
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Make Moderator
                                      </DropdownMenuItem>
                                    )}
                                  {canManage &&
                                    isMemberModerator &&
                                    !isMemberAdmin && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          handleDemoteFromModerator(member.id)
                                        }
                                      >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Remove Moderator
                                      </DropdownMenuItem>
                                    )}
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleRemoveMember(member)}
                                    className="text-red-600"
                                  >
                                    <UserMinus className="h-4 w-4 mr-2" />
                                    Remove Member
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </TabsContent>

          {group.groupType === "project" && (
            <TabsContent value="roles" className="mt-0">
              <div className="p-4 space-y-4">
                {group.projectRoles?.map((role) => {
                  const pendingCount = role.applications.filter(
                    (app) => app.status === "pending"
                  ).length;
                  const isFilled = role.slotsFilled >= role.slotsTotal;

                  return (
                    <div
                      key={role.id}
                      className="border border-border rounded-lg p-4"
                    >
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
                          <p className="text-sm text-muted-foreground mb-2">
                            {role.description}
                          </p>
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
                            {pendingCount > 0
                              ? `Review (${pendingCount})`
                              : "View"}
                          </Button>
                        )}
                      </div>

                      {/* Show accepted members for this role */}
                      {role.applications.filter(
                        (app) => app.status === "accepted"
                      ).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Team Members:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {role.applications
                              .filter((app) => app.status === "accepted")
                              .map((app) => (
                                <div
                                  key={app.id}
                                  className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1"
                                >
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={app.userAvatar} />
                                    <AvatarFallback className="text-xs">
                                      {app.userName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">
                                    {app.userName}
                                  </span>
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
                    <p className="text-muted-foreground">
                      No resources shared yet
                    </p>
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
                            {resource.type} • Shared by {resource.uploadedBy} •{" "}
                            {resource.uploadedAt.toLocaleDateString()}
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

                  {/* Group Information */}
                  <div className="space-y-4 mb-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="group-name"
                        className="text-sm font-medium"
                      >
                        Group Name
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="group-name"
                          type="text"
                          value={groupName}
                          onChange={(e) => setGroupName(e.target.value)}
                          className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                          placeholder="Enter group name"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateGroupInfo()}
                          disabled={groupName === group?.name}
                        >
                          Save
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Group Description
                      </label>
                      <div className="space-y-2">
                        <textarea
                          value={groupDescription}
                          onChange={(e) => setGroupDescription(e.target.value)}
                          className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none"
                          rows={3}
                          placeholder="Enter group description"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleUpdateGroupInfo()}
                          disabled={groupDescription === group?.description}
                        >
                          Update Description
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="space-y-4 mb-6 p-4 border rounded-lg">
                    <h4 className="font-medium">Privacy Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">
                            Group Type
                          </label>
                          <p className="text-sm text-muted-foreground">
                            {group?.groupType === "project"
                              ? "Project groups cannot change visibility"
                              : "Change group visibility"}
                          </p>
                        </div>
                        <select
                          value={groupType}
                          onChange={(e) =>
                            setGroupType(
                              e.target.value as "public" | "private" | "project"
                            )
                          }
                          className="px-3 py-1 border border-border rounded text-sm"
                          aria-label="Group type selection"
                          disabled={group?.groupType === "project"}
                        >
                          <option value="public">Public</option>
                          <option value="private">Private</option>
                          <option value="project">Project</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">
                            Require Approval
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Members need approval to join
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={requireApproval}
                          onChange={(e) => setRequireApproval(e.target.checked)}
                          className="h-4 w-4"
                          aria-label="Require approval to join"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium">
                            Allow Member Invites
                          </label>
                          <p className="text-sm text-muted-foreground">
                            Let members invite others
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={allowMemberInvites}
                          onChange={(e) =>
                            setAllowMemberInvites(e.target.checked)
                          }
                          className="h-4 w-4"
                          aria-label="Allow member invites"
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleUpdatePrivacySettings()}
                    >
                      Save Privacy Settings
                    </Button>
                  </div>

                  {/* Group Tags */}
                  <div className="space-y-4 mb-6 p-4 border rounded-lg">
                    <h4 className="font-medium">Group Tags</h4>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {groupTags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="gap-1"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addTag()}
                          className="flex-1 px-3 py-2 border border-border rounded-md text-sm"
                          placeholder="Add a tag"
                        />
                        <Button size="sm" onClick={addTag}>
                          Add Tag
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Admin Management */}
                  {isOwner && (
                    <div className="space-y-4 mb-6 p-4 border rounded-lg">
                      <h4 className="font-medium">Admin Management</h4>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Current Admins:
                        </p>
                        <div className="space-y-2">
                          {group?.admins.map((adminId) => {
                            const admin = members.find((m) => m.id === adminId);
                            if (!admin) return null;
                            return (
                              <div
                                key={adminId}
                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={admin.avatar}
                                      alt={admin.displayName}
                                    />
                                    <AvatarFallback className="text-xs">
                                      {admin.displayName
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm font-medium">
                                    {admin.displayName}
                                  </span>
                                  {group.createdBy === adminId && (
                                    <Badge
                                      variant="default"
                                      className="text-xs"
                                    >
                                      Owner
                                    </Badge>
                                  )}
                                </div>
                                {group.createdBy !== adminId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setMemberToDemote(admin)}
                                  >
                                    Remove Admin
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Danger Zone */}
                <div className="pt-4 border-t border-red-200">
                  <h4 className="text-sm font-medium text-red-600 mb-4">
                    Danger Zone
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                      <div>
                        <h5 className="text-sm font-medium text-red-600">
                          Delete Group
                        </h5>
                        <p className="text-xs text-red-500">
                          Permanently delete this group and all its data
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Group
                      </Button>
                    </div>
                  </div>
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

      <Dialog
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Member to Group</DialogTitle>
            <DialogDescription>
              {group.groupType === "private"
                ? "Invite someone to this private group by their email"
                : "Add a new member to the group"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="student@university.edu"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddMemberModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddMember} disabled={!searchEmail}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <AlertDialog
        open={!!memberToRemove}
        onOpenChange={() => setMemberToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.displayName} from
              this group? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmRemoveMember()}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!memberToPromote}
        onOpenChange={() => setMemberToPromote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Promote to Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to promote {memberToPromote?.displayName} to
              admin? They will have the ability to manage group members and
              settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmPromoteToAdmin()}>
              Promote to Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!memberToDemote}
        onOpenChange={() => setMemberToDemote(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Demote from Admin</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to demote {memberToDemote?.displayName} from
              admin? They will lose admin privileges for this group.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDemoteFromAdmin()}>
              Demote from Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete "{group?.name}"? This
              action cannot be undone. All group data, messages, and files will
              be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteGroup()}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default GroupDetail;
