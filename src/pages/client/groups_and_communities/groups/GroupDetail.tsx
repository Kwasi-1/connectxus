import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
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
  Clock,
  Camera,
  Upload,
  Megaphone,
  Pin,
  Trash2,
  MoreVertical,
  MapPin,
  Plus,
} from "lucide-react";
import {
  ProjectRole,
  RoleApplication,
  MemberWithRole,
} from "@/types/communities";
import { User } from "@/types/global";
import { ProjectRoleApplicationsModal } from "@/components/groups/ProjectRoleApplicationsModal";
import { AddMemberModal } from "@/components/groups/AddMemberModal";
import { uploadFile } from "@/api/files.api";
import { toast as sonnerToast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGroupById,
  getGroupMembers,
  getGroupRoles,
  joinGroup,
  leaveGroup,
  Group,
  GroupMember,
  getJoinRequests,
  approveJoinRequest,
  rejectJoinRequest,
  createJoinRequest,
  JoinRequest,
  getGroupAnnouncements,
  createGroupAnnouncement,
  updateGroupAnnouncement,
  deleteGroupAnnouncement,
  pinGroupAnnouncement,
  Announcement,
  removeGroupMember,
  updateApplicationStatus,
  updateGroup,
  addGroupAdmin,
  removeGroupAdmin,
  addGroupModerator,
  removeGroupModerator,
  applyForRole,
  getGroupResources,
  GroupResource,
  getGroupApplications,
  createGroupResource,
  deleteGroupResource,
} from "@/api/groups.api";
import { getPostsByGroup } from "@/api/posts.api";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getGroupEvents,
  getGroupUpcomingEvents,
  createGroupEvent,
  updateEvent,
  Event,
  CreateEventRequest,
} from "@/api/events.api";
import moment from "moment";
import { EventCard } from "@/components/events/EventCard";
import { EventForm } from "@/components/events/EventForm";
import { EventDetailModal } from "@/components/events/EventDetailModal";

type GroupTab =
  | "members"
  | "resources"
  | "roles"
  | "settings"
  | "requests"
  | "announcements"
  | "events";

const GroupDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const currentUserId = user?.id || "";

  const queryClient = useQueryClient();

  const initialTab = (searchParams.get("tab") as GroupTab) || "members";
  const [activeTab, setActiveTab] = useState<GroupTab>(initialTab);
  const [selectedRole, setSelectedRole] = useState<ProjectRole | null>(null);
  const [isApplicationsModalOpen, setIsApplicationsModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceName, setResourceName] = useState("");
  const [resourceDescription, setResourceDescription] = useState("");
  const [resourceFile, setResourceFile] = useState<File | null>(null);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);

  const { data: group, isLoading } = useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupById(id || ""),
    enabled: !!id,
  });

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["group-members", id],
    queryFn: () => getGroupMembers(id || "", { page: 1, limit: 100 }),
    enabled:
      !!id &&
      activeTab === "members" &&
      (group?.is_member || group?.group_type === "public"),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["group-roles", id],
    queryFn: () => getGroupRoles(id || ""),
    enabled: !!id && activeTab === "roles",
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["group-applications", id],
    queryFn: () => getGroupApplications(id || ""),
    enabled: !!id && activeTab === "roles",
  });

  const { data: resources = [], isLoading: resourcesLoading } = useQuery({
    queryKey: ["group-resources", id],
    queryFn: () => getGroupResources(id || "", { page: 1, limit: 100 }),
    enabled:
      !!id &&
      activeTab === "resources" &&
      (group?.is_member || group?.group_type === "public"),
  });

  const joinMutation = useMutation({
    mutationFn: () => joinGroup(id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Joined group",
        description: `You've successfully joined ${group?.name}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveGroup(id || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({ title: "Left group", description: `You've left ${group?.name}` });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    },
  });

  const joinRequestMutation = useMutation({
    mutationFn: (message: string) => createJoinRequest(id || "", { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-join-requests", id] });
      setIsJoinRequestModalOpen(false);
      setJoinRequestMessage("");
      toast({
        title: "Request sent",
        description: "Your join request has been sent to the group admins",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send join request",
        variant: "destructive",
      });
    },
  });

  const isAdmin = group?.role === "admin" || group?.role === "owner";
  const isModerator = group?.role === "moderator";
  const canManage = isAdmin || isModerator;
  const isOwner = group?.role === "owner";

  const approveJoinRequestMutation = useMutation({
    mutationFn: (requestId: string) => approveJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-join-requests", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Request approved",
        description: "User has been added to the group",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive",
      });
    },
  });

  const rejectJoinRequestMutation = useMutation({
    mutationFn: (requestId: string) => rejectJoinRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-join-requests", id] });
      toast({
        title: "Request rejected",
        description: "Join request has been rejected",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive",
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ groupId, userId }: { groupId: string; userId: string }) =>
      removeGroupMember(groupId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Member removed",
        description: "Member has been removed from the group",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    },
  });

  const updateApplicationMutation = useMutation({
    mutationFn: ({
      applicationId,
      status,
    }: {
      applicationId: string;
      status: "approved" | "rejected";
    }) => updateApplicationStatus(applicationId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["group-roles", id] });
      queryClient.invalidateQueries({ queryKey: ["group-applications", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      queryClient.invalidateQueries({ queryKey: ["group", id] });

      const statusText =
        variables.status === "approved" ? "approved" : "rejected";
      toast({
        title: `Application ${statusText}`,
        description: `The application has been ${statusText}`,
      });

      setIsApplicationsModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      is_pinned?: boolean;
    }) => createGroupAnnouncement(id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-announcements", id] });
      toast({
        title: "Announcement created",
        description: "Announcement has been posted",
      });
      setIsAnnouncementDialogOpen(false);
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setAnnouncementToPinned(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
    },
  });

  const updateAnnouncementMutation = useMutation({
    mutationFn: ({
      announcementId,
      data,
    }: {
      announcementId: string;
      data: { title: string; content: string; is_pinned?: boolean };
    }) => updateGroupAnnouncement(announcementId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-announcements", id] });
      toast({
        title: "Announcement updated",
        description: "Announcement has been updated",
      });
      setEditingAnnouncement(null);
      setIsAnnouncementDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: (announcementId: string) =>
      deleteGroupAnnouncement(announcementId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-announcements", id] });
      toast({
        title: "Announcement deleted",
        description: "Announcement has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    },
  });

  const pinAnnouncementMutation = useMutation({
    mutationFn: ({
      announcementId,
      pinned,
    }: {
      announcementId: string;
      pinned: boolean;
    }) => pinGroupAnnouncement(announcementId, pinned),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-announcements", id] });
      toast({
        title: "Announcement updated",
        description: "Announcement pin status updated",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update announcement",
        variant: "destructive",
      });
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: (data: any) => {
      const updateData = {
        name: group?.name || "",
        category: group?.category || "",
        ...data,
      };
      return updateGroup(id || "", updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      toast({
        title: "Group updated",
        description: "Group has been updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update group",
        variant: "destructive",
      });
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: (userId: string) => addGroupAdmin(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Admin added",
        description: "User has been promoted to admin",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add admin",
        variant: "destructive",
      });
    },
  });

  const removeAdminMutation = useMutation({
    mutationFn: (userId: string) => removeGroupAdmin(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Admin removed",
        description: "User has been demoted from admin",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove admin",
        variant: "destructive",
      });
    },
  });

  const addModeratorMutation = useMutation({
    mutationFn: (userId: string) => addGroupModerator(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Moderator added",
        description: "User has been promoted to moderator",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add moderator",
        variant: "destructive",
      });
    },
  });

  const removeModeratorMutation = useMutation({
    mutationFn: (userId: string) => removeGroupModerator(id || "", userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group", id] });
      queryClient.invalidateQueries({ queryKey: ["group-members", id] });
      toast({
        title: "Moderator removed",
        description: "User has been demoted from moderator",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove moderator",
        variant: "destructive",
      });
    },
  });

  const applyForRoleMutation = useMutation({
    mutationFn: ({ roleId, message }: { roleId: string; message?: string }) =>
      applyForRole(roleId, { message }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-roles", id] });
      queryClient.invalidateQueries({ queryKey: ["group-applications", id] });
      toast({
        title: "Application submitted!",
        description: "Your application has been submitted for review.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application",
        variant: "destructive",
      });
    },
  });

  const createResourceMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      file_url: string;
      file_type?: string;
      file_size?: number;
    }) => createGroupResource(id || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-resources", id] });
      setIsResourceModalOpen(false);
      setResourceName("");
      setResourceDescription("");
      setResourceFile(null);
      toast({
        title: "Resource uploaded",
        description: "Resource has been added to the group",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to upload resource",
        variant: "destructive",
      });
    },
  });

  const deleteResourceMutation = useMutation({
    mutationFn: (resourceId: string) => deleteGroupResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-resources", id] });
      setResourceToDelete(null);
      toast({
        title: "Resource deleted",
        description: "The resource has been removed from the group",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      });
      setResourceToDelete(null);
    },
  });

  const { data: joinRequests = [] } = useQuery({
    queryKey: ["group-join-requests", id],
    queryFn: () => getJoinRequests(id || ""),
    enabled: !!id && canManage && activeTab === "requests",
  });

  const { data: announcements = [] } = useQuery({
    queryKey: ["group-announcements", id],
    queryFn: () => getGroupAnnouncements(id || ""),
    enabled:
      !!id &&
      activeTab === "announcements" &&
      (group?.is_member || group?.group_type === "public"),
  });

  const userApplications = group?.user_role_applications || [];
  const hasPendingApplications = userApplications.some(
    (app) => app.status === "pending"
  );
  const hasRejectedApplications = userApplications.some(
    (app) => app.status === "rejected"
  );
  const hasApprovedApplications = userApplications.some(
    (app) => app.status === "approved"
  );
  const hasAnyApplications = userApplications.length > 0;

  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [showFollowedUsers, setShowFollowedUsers] = useState(false);
  const [isAnnouncementDialogOpen, setIsAnnouncementDialogOpen] =
    useState(false);
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementContent, setAnnouncementContent] = useState("");
  const [announcementToPinned, setAnnouncementToPinned] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);

  const [
    isProjectRoleApplicationModalOpen,
    setIsProjectRoleApplicationModalOpen,
  ] = useState(false);
  const [selectedRoleForApplication, setSelectedRoleForApplication] =
    useState<ProjectRole | null>(null);
  const [isJoinRequestModalOpen, setIsJoinRequestModalOpen] = useState(false);
  const [joinRequestMessage, setJoinRequestMessage] = useState("");

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
  const [showPrivacyChangeConfirm, setShowPrivacyChangeConfirm] =
    useState(false);

  const [editedProfileImageFileId, setEditedProfileImageFileId] = useState<
    string | null
  >(null);
  const [editedProfileImagePreview, setEditedProfileImagePreview] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (group) {
      setGroupName(group.name);
      setGroupDescription(group.description);
      setGroupType(group.group_type);
      setGroupTags(group.tags || []);
      setRequireApproval(
        group.requireApproval ?? group.group_type === "private"
      );
      setAllowMemberInvites(group.allowMemberInvites ?? true);
    }
  }, [group]);

  useEffect(() => {
    if (group && !group.is_member && group.group_type === "project") {
      const userApplications = group.user_role_applications || [];
      const hasApprovedApplication = userApplications.some(
        (app) => app.status === "approved"
      );

      if (userApplications.length === 0 || !hasApprovedApplication) {
        setActiveTab("roles");
      }
    }
  }, [
    group?.id,
    group?.is_member,
    group?.group_type,
    group?.user_role_applications,
  ]);
  const handleUpdateGroupInfo = useCallback(() => {
    updateGroupMutation.mutate({
      name: groupName,
      description: groupDescription,
    });
  }, [groupName, groupDescription, updateGroupMutation]);

  const handleUpdatePrivacySettings = useCallback(() => {
    updateGroupMutation.mutate({
      group_type: groupType as any,
      settings: {
        requireApproval,
        allowMemberInvites,
      },
    });
  }, [groupType, requireApproval, allowMemberInvites, updateGroupMutation]);

  const addTag = useCallback(() => {
    if (newTag.trim() && !groupTags.includes(newTag.trim())) {
      const updatedTags = [...groupTags, newTag.trim()];
      setGroupTags(updatedTags);
      setNewTag("");

      updateGroupMutation.mutate({ tags: updatedTags });
    }
  }, [newTag, groupTags, updateGroupMutation]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      const updatedTags = groupTags.filter((tag) => tag !== tagToRemove);
      setGroupTags(updatedTags);

      updateGroupMutation.mutate({ tags: updatedTags });
    },
    [groupTags, updateGroupMutation]
  );

  const handleDeleteGroup = useCallback(() => {
    const isUserAdmin = group?.role === "admin" || group?.role === "owner";
    const isUserOwner = group?.role === "owner";

    if (isUserAdmin || isUserOwner) {
    } else {
      leaveMutation.mutate();
    }
    setShowDeleteConfirm(false);
    navigate("/groups");
  }, [group, leaveMutation, navigate]);

  const handlePrivacyChangeConfirm = useCallback(() => {
    setRequireApproval(false);
    setGroupType("public");
    setShowPrivacyChangeConfirm(false);
    toast({
      title: "Privacy settings updated",
      description: "Group is now public and approval is no longer required",
    });
  }, [toast]);

  const handleProfileImageEdit = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Profile image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      sonnerToast.error("Please select an image file");
      return;
    }

    try {
      const uploaded = await uploadFile({
        file,
        moduleType: "groups",
        moduleId: id,
        accessLevel: "public",
      });
      setEditedProfileImageFileId(uploaded.file_id);
      setEditedProfileImagePreview(uploaded.url);
      sonnerToast.success("Profile image uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      sonnerToast.error("Failed to upload profile image");
    }
  };

  const saveImageChanges = useCallback(() => {
    const updates: any = {};
    if (editedProfileImageFileId !== null) {
      updates.avatar_file_id = editedProfileImageFileId;
    }

    if (Object.keys(updates).length > 0) {
      updateGroupMutation.mutate(updates);
      setEditedProfileImageFileId(null);
      setEditedProfileImagePreview(null);
    }
  }, [editedProfileImageFileId, updateGroupMutation]);

  const cancelImageChanges = useCallback(() => {
    setEditedProfileImageFileId(null);
    setEditedProfileImagePreview(null);
  }, []);

  const removeGroupProfileImage = useCallback(() => {
    setEditedProfileImageFileId("");
    setEditedProfileImagePreview("");
  }, []);

  const handleJoinGroup = () => {
    if (!group || !id) return;

    if (group.is_member) {
      leaveMutation.mutate();
      return;
    }

    if (group.group_type === "project") {
      if (roles && roles.length > 0) {
        toast({
          title: "Choose a role",
          description: "Select a role to apply for in this project group.",
        });
        setActiveTab("roles");
      } else {
        toast({
          title: "No roles available",
          description:
            "This project group is not currently accepting applications.",
          variant: "destructive",
        });
      }
    } else if (group.group_type === "private") {
      setIsJoinRequestModalOpen(true);
    } else {
      joinMutation.mutate();
    }
  };

  const handleChatClick = async () => {
    if (!group || !group.is_member) {
      toast({
        title: "Join group first",
        description: "You need to join the group to access the chat",
        variant: "destructive",
      });
      return;
    }

    try {
      const { getOrCreateGroupConversation } = await import(
        "@/api/messaging.api"
      );

      const response = await getOrCreateGroupConversation(
        id!,
        group.name,
        group.avatar || undefined
      );

      navigate(`/messages/${response.conversation_id}`);
    } catch (error: any) {
      console.error("Failed to open group chat:", error);

      const isForbidden = error?.response?.status === 403;

      toast({
        title: "Error",
        description: isForbidden
          ? "You must be a member of this group to access the group chat."
          : "Failed to open group chat. Please try again.",
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
        await copyToClipboard(groupUrl);
      }
    } else {
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

  const handlePromoteToAdmin = useCallback(
    (userId: string) => {
      addAdminMutation.mutate(userId);
      setMemberToPromote(null);
    },
    [addAdminMutation]
  );

  const handleDemoteFromAdmin = useCallback(
    (userId: string) => {
      removeAdminMutation.mutate(userId);
      setMemberToDemote(null);
    },
    [removeAdminMutation]
  );

  const handlePromoteToModerator = (userId: string) => {
    addModeratorMutation.mutate(userId);
  };

  const handleDemoteFromModerator = (userId: string) => {
    removeModeratorMutation.mutate(userId);
  };

  const handleViewApplications = (role: ProjectRole) => {
    const roleApplications = applications.filter(
      (app) => app.role_id === role.id
    );
    const roleWithApplications = {
      ...role,
      applications: roleApplications,
    };
    setSelectedRole(roleWithApplications as any);
    setIsApplicationsModalOpen(true);
  };

  const handleAcceptApplication = (applicationId: string) => {
    updateApplicationMutation.mutate({ applicationId, status: "approved" });
  };

  const handleRejectApplication = (applicationId: string) => {
    updateApplicationMutation.mutate({ applicationId, status: "rejected" });
  };

  const handleApplyForRole = useCallback(
    (role: ProjectRole, message: string) => {
      applyForRoleMutation.mutate({ roleId: role.id, message });
    },
    [applyForRoleMutation]
  );

  const handleUploadResource = () => {
    if (!resourceName.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a resource name",
        variant: "destructive",
      });
      return;
    }

    if (!resourceFile) {
      toast({
        title: "Missing file",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    const fileUrl = URL.createObjectURL(resourceFile);

    createResourceMutation.mutate({
      name: resourceName,
      description: resourceDescription || undefined,
      file_url: fileUrl,
      file_type: resourceFile.type,
      file_size: resourceFile.size,
    });
  };

  const handleOpenRoleApplication = (role: ProjectRole) => {
    setSelectedRoleForApplication(role);
    setIsProjectRoleApplicationModalOpen(true);
  };

  const handleAddMemberFromModal = useCallback(
    (user: User, role?: string) => {
      if (role === "admin") {
        addAdminMutation.mutate(user.id);
      } else if (role === "moderator") {
        addModeratorMutation.mutate(user.id);
      } else {
        toast({
          title: "Feature not available",
          description:
            "Direct member addition requires admin/moderator role selection",
          variant: "destructive",
        });
      }
    },
    [addAdminMutation, addModeratorMutation, toast]
  );

  const handleApproveJoinRequest = useCallback(
    (requestId: string) => {
      approveJoinRequestMutation.mutate(requestId);
    },
    [approveJoinRequestMutation]
  );

  const handleRejectJoinRequest = useCallback(
    (requestId: string) => {
      rejectJoinRequestMutation.mutate(requestId);
    },
    [rejectJoinRequestMutation]
  );

  const handleRemoveMember = useCallback((member: MemberWithRole) => {
    setMemberToRemove(member);
  }, []);

  const confirmRemoveMember = useCallback(() => {
    if (memberToRemove && id) {
      removeMemberMutation.mutate({ groupId: id, userId: memberToRemove.id });
      setMemberToRemove(null);
    }
  }, [memberToRemove, id, removeMemberMutation]);

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
      groupType: group?.group_type,
      tags: group?.tags,
    });
  };

  const handleSaveSettings = () => {
    if (editedGroup.name || editedGroup.description || editedGroup.tags) {
      updateGroupMutation.mutate({
        name: editedGroup.name,
        description: editedGroup.description,
        tags: editedGroup.tags,
      });
    }
    setIsSettingsEditing(false);
  };

  const handleCancelSettings = () => {
    setIsSettingsEditing(false);
    setEditedGroup({});
  };

  const handleCreateAnnouncement = () => {
    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast({
        title: "Missing information",
        description:
          "Please provide both title and content for the announcement",
        variant: "destructive",
      });
      return;
    }

    createAnnouncementMutation.mutate({
      title: announcementTitle,
      content: announcementContent,
      is_pinned: announcementToPinned,
    });
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setAnnouncementTitle(announcement.title);
    setAnnouncementContent(announcement.content);
    setAnnouncementToPinned(announcement.is_pinned);
    setIsAnnouncementDialogOpen(true);
  };

  const handleUpdateAnnouncement = () => {
    if (!editingAnnouncement) return;

    if (!announcementTitle.trim() || !announcementContent.trim()) {
      toast({
        title: "Missing information",
        description:
          "Please provide both title and content for the announcement",
        variant: "destructive",
      });
      return;
    }

    updateAnnouncementMutation.mutate({
      announcementId: editingAnnouncement.id,
      data: {
        title: announcementTitle,
        content: announcementContent,
        is_pinned: announcementToPinned,
      },
    });
  };

  const handleDeleteAnnouncement = (announcementId: string) => {
    deleteAnnouncementMutation.mutate(announcementId);
  };

  const handlePinAnnouncement = (announcementId: string, pinned: boolean) => {
    pinAnnouncementMutation.mutate({ announcementId, pinned: !pinned });
  };

  const openNewAnnouncementDialog = () => {
    setEditingAnnouncement(null);
    setAnnouncementTitle("");
    setAnnouncementContent("");
    setAnnouncementToPinned(false);
    setIsAnnouncementDialogOpen(true);
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
      <div className="border-r border-border h-full relative">
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 border-b border-border">
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
                    {group.group_type === "private" && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {group.member_count} members
                  </p>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-2">
                {group.is_member && (
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
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex items-start space-x-4">
            <Avatar className="h-16 w-16 rounded-sm">
              <AvatarImage src={group.avatar} alt={group.name} />
              <AvatarFallback className="text-lg h-16 w-16 rounded-sm">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold">{group.name}</h2>
                {group.group_type === "private" && (
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
                  {group.member_count} members
                </span>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(group.created_at).toLocaleDateString()}
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
                {!canManage && !group.is_member && (
                  <>
                    {group.join_request_status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                        >
                          <Clock className="h-3 w-3 mr-1.5" />
                          Join Request Pending
                        </Badge>
                      </div>
                    ) : group.join_request_status === "rejected" ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="px-3 py-1.5 text-sm"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1.5" />
                          Join Request Rejected
                        </Badge>
                        {group.group_type === "private" && (
                          <Button
                            onClick={handleJoinGroup}
                            variant="default"
                            size="sm"
                          >
                            Request Again
                          </Button>
                        )}
                      </div>
                    ) : group.group_type === "project" &&
                      hasPendingApplications ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-3 py-1.5 text-sm"
                        >
                          <Clock className="h-3 w-3 mr-1.5" />
                          Application Pending (
                          {
                            userApplications.filter(
                              (a) => a.status === "pending"
                            ).length
                          }{" "}
                          role
                          {userApplications.filter(
                            (a) => a.status === "pending"
                          ).length > 1
                            ? "s"
                            : ""}
                          )
                        </Badge>
                      </div>
                    ) : group.group_type === "project" &&
                      hasRejectedApplications &&
                      !hasPendingApplications &&
                      !hasApprovedApplications ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="destructive"
                            className="px-3 py-1.5 text-sm"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1.5" />
                            Application Rejected
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Briefcase className="h-4 w-4" />
                          You can reapply - view roles below
                        </div>
                      </div>
                    ) : group.group_type === "project" &&
                      !hasAnyApplications ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        View roles below to apply
                      </div>
                    ) : (
                      <Button onClick={handleJoinGroup} variant="default">
                        {group.group_type === "private"
                          ? "Request Access"
                          : "Join Group"}
                      </Button>
                    )}
                    <Button onClick={handleShareGroup} variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </>
                )}
                {!canManage && group.is_member && (
                  <>
                    <Button onClick={handleChatClick} variant="default">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                    <Button onClick={handleShareGroup} variant="outline">
                      <Share className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button onClick={handleJoinGroup} variant="outline">
                      <UserMinus className="h-4 w-4 mr-2" />
                      Leave Group
                    </Button>
                  </>
                )}
                {canManage && (
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab("settings")}
                  >
                    Manage Group
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as GroupTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            {(group.is_member || group.group_type === "public") && (
              <TabsTrigger
                value="members"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Members
              </TabsTrigger>
            )}
            {group.group_type === "project" &&
              (!group.is_member || canManage) && (
                <TabsTrigger
                  value="roles"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Roles
                </TabsTrigger>
              )}
            {(group.is_member || group.group_type === "public") && (
              <TabsTrigger
                value="resources"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Resources
              </TabsTrigger>
            )}
            {(group.is_member || group.group_type === "public") && (
              <TabsTrigger
                value="announcements"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Announcements
              </TabsTrigger>
            )}
            {(group.is_member || group.group_type === "public") && (
              <TabsTrigger
                value="events"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Events
              </TabsTrigger>
            )}
            {canManage &&
              (group?.requireApproval ?? group?.group_type === "private") && (
                <TabsTrigger
                  value="requests"
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
                >
                  Requests{" "}
                  {joinRequests.length > 0 && (
                    <Badge
                      variant="destructive"
                      className="ml-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {joinRequests.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            {isAdmin && (
              <TabsTrigger
                value="settings"
                className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
              >
                Settings
              </TabsTrigger>
            )}
          </TabsList>

          <div className="relative">
            <div className="relative">
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
                        const isMemberAdmin = member.role === "admin";
                        const isMemberModerator = member.role === "moderator";
                        const isGroupOwner = group?.created_by === member.id;

                        return (
                          <div key={member.id} className="p-4 hover:bg-muted/5">
                            <div className="flex items-center gap-3">
                              <Avatar
                                className="h-12 w-12 cursor-pointer"
                                onClick={() =>
                                  navigate(`/profile/${member.username}`)
                                }
                              >
                                <AvatarImage
                                  src={member.avatar || undefined}
                                  alt={member.full_name}
                                />
                                <AvatarFallback>
                                  {member.full_name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className="flex-1 cursor-pointer"
                                onClick={() =>
                                  navigate(`/profile/${member.username}`)
                                }
                              >
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold">
                                    {member.full_name}
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
                                {member.department && (
                                  <p className="text-xs text-muted-foreground">
                                    {member.department}
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

                                {member.project_roles &&
                                  member.project_roles.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                      {member.project_roles.map(
                                        (roleName, idx) => (
                                          <Badge
                                            key={idx}
                                            variant="default"
                                            className="text-xs gap-1"
                                          >
                                            <Briefcase className="h-3 w-3" />
                                            {roleName}
                                          </Badge>
                                        )
                                      )}
                                    </div>
                                  )}

                                {canManage &&
                                  !isCurrentUser &&
                                  !isGroupOwner && (
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          •••
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {isOwner && !isMemberAdmin && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              setMemberToPromote(member)
                                            }
                                          >
                                            <Crown className="h-4 w-4 mr-2" />
                                            Promote to Admin
                                          </DropdownMenuItem>
                                        )}
                                        {isOwner && isMemberAdmin && (
                                          <DropdownMenuItem
                                            onClick={() =>
                                              setMemberToDemote(member)
                                            }
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
                                                handlePromoteToModerator(
                                                  member.id
                                                )
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
                                                handleDemoteFromModerator(
                                                  member.id
                                                )
                                              }
                                            >
                                              <Shield className="h-4 w-4 mr-2" />
                                              Remove Moderator
                                            </DropdownMenuItem>
                                          )}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleRemoveMember(member)
                                          }
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

              {group.group_type === "project" && (
                <TabsContent value="roles" className="mt-0">
                  <div className="p-4 space-y-4">
                    {roles?.map((role) => {
                      const roleApplications = applications.filter(
                        (app) => app.role_id === role.id
                      );
                      const pendingCount = roleApplications.filter(
                        (app) => app.status === "pending"
                      ).length;
                      const isFilled = role.slots_filled >= role.slots_total;

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
                                  {role.slots_filled} / {role.slots_total}{" "}
                                  filled
                                </span>
                                {pendingCount > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {pendingCount} pending
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
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
                              {!canManage &&
                                !group?.is_member &&
                                (() => {
                                  const roleApp = userApplications.find(
                                    (app) => app.role_id === role.id
                                  );
                                  const isPending =
                                    roleApp?.status === "pending";
                                  const isRejected =
                                    roleApp?.status === "rejected";
                                  const isApproved =
                                    roleApp?.status === "approved";

                                  if (isPending) {
                                    return (
                                      <Badge
                                        variant="secondary"
                                        className="px-3 py-1.5 text-sm"
                                      >
                                        <Clock className="h-3 w-3 mr-1.5" />
                                        Pending
                                      </Badge>
                                    );
                                  }

                                  if (isRejected) {
                                    return (
                                      <Badge
                                        variant="destructive"
                                        className="px-3 py-1.5 text-sm"
                                      >
                                        <AlertTriangle className="h-3 w-3 mr-1.5" />
                                        Rejected
                                      </Badge>
                                    );
                                  }

                                  return (
                                    <Button
                                      variant="default"
                                      size="sm"
                                      onClick={() =>
                                        handleOpenRoleApplication(role)
                                      }
                                      disabled={isFilled}
                                    >
                                      {isFilled ? "Full" : "Apply"}
                                    </Button>
                                  );
                                })()}
                            </div>
                          </div>

                          {roleApplications.filter(
                            (app) => app.status === "accepted"
                          ).length > 0 && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-medium text-muted-foreground mb-2">
                                Team Members:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {roleApplications
                                  .filter((app) => app.status === "accepted")
                                  .map((app) => (
                                    <div
                                      key={app.id}
                                      className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1"
                                    >
                                      <Avatar className="h-5 w-5">
                                        <AvatarImage
                                          src={app.avatar || undefined}
                                        />
                                        <AvatarFallback className="text-xs">
                                          {app.full_name
                                            .substring(0, 2)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-sm">
                                        {app.full_name}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {(!roles || roles.length === 0) && (
                      <div className="text-center py-8 text-muted-foreground">
                        No roles defined yet
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="resources" className="mt-0">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Resources</h3>
                    {canManage && (
                      <Button onClick={() => setIsResourceModalOpen(true)}>
                        <Upload className="h-4 w-4" />
                        <span className="hidden md:block ml-2">
                          Add Resource
                        </span>
                      </Button>
                    )}
                  </div>
                  {resourcesLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <div className="divide-y divide-border">
                      {resources.length === 0 ? (
                        <div className="p-8 text-center">
                          <Files className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No resources shared yet
                          </p>
                        </div>
                      ) : (
                        resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="p-4 hover:bg-muted/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <Files className="h-5 w-5" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{resource.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {resource.file_type || "File"} • Shared by{" "}
                                  {resource.uploader_full_name} •{" "}
                                  {new Date(
                                    resource.created_at
                                  ).toLocaleDateString()}{" "}
                                  • {resource.download_count} downloads
                                </p>
                                {resource.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {resource.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    window.open(resource.file_url, "_blank")
                                  }
                                >
                                  Download
                                </Button>
                                {canManage && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem
                                        className="text-destructive"
                                        onClick={() =>
                                          setResourceToDelete(resource.id)
                                        }
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="announcements" className="mt-0">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Announcements</h3>
                    {canManage && (
                      <Button onClick={openNewAnnouncementDialog}>
                        <Megaphone className="h-4 w-4" />
                        <span className="hidden md:block ml-2">
                          New Announcement
                        </span>
                      </Button>
                    )}
                  </div>
                  {announcements.length === 0 ? (
                    <div className="text-center py-8">
                      <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No announcements yet
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {announcements
                        .sort((a, b) => {
                          if (a.is_pinned && !b.is_pinned) return -1;
                          if (!a.is_pinned && b.is_pinned) return 1;
                          return (
                            new Date(b.created_at).getTime() -
                            new Date(a.created_at).getTime()
                          );
                        })
                        .map((announcement) => (
                          <div
                            key={announcement.id}
                            className={`p-4 border rounded-lg ${
                              announcement.is_pinned
                                ? "border-primary bg-primary/5"
                                : ""
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {announcement.title}
                                </h4>
                                {announcement.is_pinned && (
                                  <Badge variant="default" className="gap-1">
                                    <Pin className="h-3 w-3" />
                                    Pinned
                                  </Badge>
                                )}
                              </div>
                              {canManage && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      •••
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleEditAnnouncement(announcement)
                                      }
                                    >
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handlePinAnnouncement(
                                          announcement.id,
                                          announcement.is_pinned
                                        )
                                      }
                                    >
                                      {announcement.is_pinned ? "Unpin" : "Pin"}
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleDeleteAnnouncement(
                                          announcement.id
                                        )
                                      }
                                      className="text-red-600"
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                            <p className="text-sm whitespace-pre-wrap mb-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{announcement.author_full_name}</span>
                              <span>•</span>
                              <span>
                                {new Date(
                                  announcement.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {canManage &&
                (group?.requireApproval || group?.group_type === "private") && (
                  <TabsContent value="requests" className="mt-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold mb-4">
                        Join Requests
                      </h3>
                      {joinRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground">
                            No pending requests
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {joinRequests.map((request) => (
                            <div
                              key={request.id}
                              className="p-4 border rounded-lg"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-3">
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={request.avatar || undefined}
                                      alt={request.full_name}
                                    />
                                    <AvatarFallback>
                                      {request.full_name
                                        .substring(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <h4 className="font-medium">
                                      {request.full_name}
                                    </h4>
                                    <p className="text-sm text-muted-foreground">
                                      @{request.username}
                                    </p>
                                    {request.message && (
                                      <p className="text-sm mt-2">
                                        {request.message}
                                      </p>
                                    )}
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Requested{" "}
                                      {new Date(
                                        request.requested_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() =>
                                      handleApproveJoinRequest(request.id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleRejectJoinRequest(request.id)
                                    }
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                )}

              {(group.is_member || group.group_type === "public") && (
                <TabsContent value="events" className="mt-0">
                  <GroupEventsTab groupId={id || ""} canManage={canManage} />
                </TabsContent>
              )}

              {canManage && (
                <TabsContent value="settings" className="mt-0">
                  <div className="p-6 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        Group Settings
                      </h3>

                      <div className="space-y-4 mb-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="group-name"
                            className="text-sm font-medium"
                          >
                            Group Name
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id="group-name"
                              type="text"
                              value={groupName}
                              onChange={(e) => setGroupName(e.target.value)}
                              placeholder="Enter group name"
                              className="flex-1"
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
                          <Label className="text-sm font-medium">
                            Group Description
                          </Label>
                          <div className="space-y-2">
                            <Textarea
                              value={groupDescription}
                              onChange={(e) =>
                                setGroupDescription(e.target.value)
                              }
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

                      <div className="space-y-4 mb-6 p-4 border rounded-lg">
                        <h4 className="font-medium">Group Images</h4>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium">
                            Profile Image
                          </Label>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                              <AvatarImage
                                src={
                                  editedProfileImagePreview !== null
                                    ? editedProfileImagePreview
                                    : group?.avatar
                                }
                                alt={group?.name || "Group"}
                              />
                              <AvatarFallback className="text-lg">
                                {group?.name?.substring(0, 2).toUpperCase() ||
                                  "GR"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleProfileImageEdit}
                                className="hidden"
                                id="profile-image-edit"
                                aria-label="Upload new profile image"
                              />
                              <div className="flex gap-2 mb-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    document
                                      .getElementById("profile-image-edit")
                                      ?.click()
                                  }
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Change Image
                                </Button>
                                {(group?.avatar ||
                                  editedProfileImagePreview) && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={removeGroupProfileImage}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Max 5MB. JPG, PNG, or GIF.
                              </p>
                            </div>
                          </div>
                        </div>

                        {editedProfileImageFileId !== null && (
                          <div className="flex gap-2 pt-2">
                            <Button size="sm" onClick={saveImageChanges}>
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelImageChanges}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>

                      {isAdmin && (
                        <div className="space-y-4 mb-6 p-4 border rounded-lg">
                          <h4 className="font-medium">Privacy Settings</h4>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">
                                  Group Type
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  {group?.group_type === "project"
                                    ? "Project groups cannot change visibility"
                                    : "Change group visibility"}
                                </p>
                              </div>
                              <Select
                                value={groupType}
                                onValueChange={(value) =>
                                  setGroupType(
                                    value as "public" | "private" | "project"
                                  )
                                }
                                disabled={group?.group_type === "project"}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="public">Public</SelectItem>
                                  <SelectItem value="private">
                                    Private
                                  </SelectItem>
                                  <SelectItem value="project">
                                    Project
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">
                                  Require Approval
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Members need approval to join
                                </p>
                              </div>
                              <Switch
                                checked={requireApproval}
                                onCheckedChange={(checked) => {
                                  if (
                                    group?.group_type === "private" &&
                                    !checked
                                  ) {
                                    setShowPrivacyChangeConfirm(true);
                                  } else {
                                    setRequireApproval(checked);
                                  }
                                }}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <div>
                                <Label className="text-sm font-medium">
                                  Allow Member Invites
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                  Let members invite others
                                </p>
                              </div>
                              <Switch
                                checked={allowMemberInvites}
                                onCheckedChange={setAllowMemberInvites}
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
                      )}

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
                            <Input
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && addTag()}
                              placeholder="Add a tag"
                              className="flex-1"
                            />
                            <Button size="sm" onClick={addTag}>
                              Add Tag
                            </Button>
                          </div>
                        </div>
                      </div>

                      {isOwner && (
                        <div className="space-y-4 mb-6 p-4 border rounded-lg">
                          <h4 className="font-medium">Admin Management</h4>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                              Current Admins:
                            </p>
                            <div className="space-y-2">
                              {group?.admins.map((adminId) => {
                                const admin = members.find(
                                  (m) => m.id === adminId
                                );
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

                    <div className="pt-4 border-t border-red-200">
                      <h4 className="text-sm font-medium text-red-600 mb-4">
                        Danger Zone
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border border-red-200 rounded-lg">
                          <div>
                            <h5 className="text-sm font-medium text-red-600">
                              {isAdmin || isOwner
                                ? "Delete Group"
                                : "Leave Group"}
                            </h5>
                            <p className="text-xs text-red-500">
                              {isAdmin || isOwner
                                ? "Permanently delete this group and all its data"
                                : "Leave this group and lose moderator access"}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            {isAdmin || isOwner
                              ? "Delete Group"
                              : "Leave Group"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>

            {!group?.is_member && !canManage && (
              <div className="absolute inset-0 top-[0px] bg-background/60 z-50 flex flex-col items-center justify-center hidden">
                <div className="text-center space-y-6 p-8 max-w-md mx-auto z-50 mt-[120px]">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center border border-blue-200 dark:border-blue-800">
                    <Lock className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-foreground">
                      {group?.group_type === "project"
                        ? "Apply to Join Project"
                        : "Join to View Content"}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {group?.group_type === "private"
                        ? "This is a private group. Request access to view members, resources, and participate in discussions."
                        : group?.group_type === "project"
                        ? "This is a project-based group. Apply for a specific role to join the team and access project resources."
                        : "Join this group to access member lists, shared resources, and participate in group activities."}
                    </p>
                  </div>
                  <div className="pt-2">
                    {group?.join_request_status === "pending" ? (
                      <div className="flex justify-center">
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-base"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Join Request Pending
                        </Badge>
                      </div>
                    ) : group?.join_request_status === "rejected" ? (
                      <div className="flex justify-center">
                        <Badge
                          variant="destructive"
                          className="px-4 py-2 text-base"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Join Request Rejected
                        </Badge>
                      </div>
                    ) : group?.group_type === "project" &&
                      hasPendingApplications ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="px-4 py-2 text-base"
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Application Pending (
                          {
                            userApplications.filter(
                              (a) => a.status === "pending"
                            ).length
                          }{" "}
                          role
                          {userApplications.filter(
                            (a) => a.status === "pending"
                          ).length > 1
                            ? "s"
                            : ""}
                          )
                        </Badge>
                      </div>
                    ) : group?.group_type === "project" &&
                      hasRejectedApplications &&
                      !hasPendingApplications &&
                      !hasApprovedApplications ? (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="destructive"
                          className="px-4 py-2 text-base"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Application Rejected
                        </Badge>
                      </div>
                    ) : group?.group_type === "project" &&
                      !hasAnyApplications ? (
                      <div className="flex items-center gap-2 text-base text-muted-foreground">
                        <Briefcase className="h-4 w-4 mr-2" />
                        Scroll down to view roles and apply
                      </div>
                    ) : (
                      <Button
                        onClick={handleJoinGroup}
                        size="lg"
                        className="px-8 py-3 text-base font-medium"
                      >
                        {group?.group_type === "private" ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Request Access
                          </>
                        ) : (
                          <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Group
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </div>

      {selectedRole && (
        <ProjectRoleApplicationsModal
          open={isApplicationsModalOpen}
          onOpenChange={setIsApplicationsModalOpen}
          role={selectedRole}
          onAcceptApplication={handleAcceptApplication}
          onRejectApplication={handleRejectApplication}
        />
      )}

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        followedUsers={followedUsers}
        groupType={group?.group_type || "public"}
        groupId={group?.id || ""}
        projectRoles={roles}
        onAddMember={handleAddMemberFromModal}
      />

      <Dialog
        open={isProjectRoleApplicationModalOpen}
        onOpenChange={setIsProjectRoleApplicationModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Apply for {selectedRoleForApplication?.name}
            </DialogTitle>
            <DialogDescription>
              Tell us why you're interested in this role and what qualifications
              you have.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Application Message</label>
              <Textarea
                id="application-message"
                placeholder="Describe your experience, skills, and why you're interested in this role..."
                className="mt-1"
                rows={4}
              />
            </div>
            {selectedRoleForApplication && (
              <div className="bg-muted/50 p-3 rounded-lg">
                <h4 className="font-medium text-sm">
                  {selectedRoleForApplication.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedRoleForApplication.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {selectedRoleForApplication.slotsFilled} /{" "}
                  {selectedRoleForApplication.slotsTotal} filled
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsProjectRoleApplicationModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const message =
                  (
                    document.getElementById(
                      "application-message"
                    ) as HTMLTextAreaElement
                  )?.value || "";
                if (selectedRoleForApplication) {
                  handleApplyForRole(selectedRoleForApplication, message);
                  setIsProjectRoleApplicationModalOpen(false);
                  setSelectedRoleForApplication(null);
                }
              }}
            >
              Submit Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
            <AlertDialogTitle>
              {isAdmin || isOwner ? "Delete Group" : "Leave Group"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAdmin || isOwner
                ? `Are you sure you want to permanently delete "${group?.name}"? This action cannot be undone. All group data, messages, and files will be lost.`
                : `Are you sure you want to leave "${group?.name}"? You will lose your moderator access and need to request to rejoin.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteGroup()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isAdmin || isOwner ? "Delete Group" : "Leave Group"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={showPrivacyChangeConfirm}
        onOpenChange={setShowPrivacyChangeConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Make Group Public</AlertDialogTitle>
            <AlertDialogDescription>
              Turning off "Require Approval" for a private group will make it
              public. Anyone will be able to join without approval. Are you sure
              you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePrivacyChangeConfirm}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Make Public
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isAnnouncementDialogOpen}
        onOpenChange={setIsAnnouncementDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              {editingAnnouncement
                ? "Update your announcement details"
                : "Create a new announcement for group members"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="announcement-title">Title</Label>
              <Input
                id="announcement-title"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Enter announcement title"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="announcement-content">Content</Label>
              <Textarea
                id="announcement-content"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Enter announcement content"
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="announcement-pinned"
                checked={announcementToPinned}
                onCheckedChange={setAnnouncementToPinned}
              />
              <Label htmlFor="announcement-pinned">Pin this announcement</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAnnouncementDialogOpen(false);
                setEditingAnnouncement(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingAnnouncement
                  ? handleUpdateAnnouncement
                  : handleCreateAnnouncement
              }
            >
              {editingAnnouncement ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isJoinRequestModalOpen}
        onOpenChange={setIsJoinRequestModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request to Join {group?.name}</DialogTitle>
            <DialogDescription>
              This is a private group. Your request will be reviewed by the
              group admins.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="join-request-message">Message (Optional)</Label>
              <Textarea
                id="join-request-message"
                value={joinRequestMessage}
                onChange={(e) => setJoinRequestMessage(e.target.value)}
                placeholder="Tell the admins why you'd like to join..."
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsJoinRequestModalOpen(false);
                setJoinRequestMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => joinRequestMutation.mutate(joinRequestMessage)}
              disabled={joinRequestMutation.isPending}
            >
              {joinRequestMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isResourceModalOpen} onOpenChange={setIsResourceModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>
              Share a file or document with the group members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="resource-name">Resource Name *</Label>
              <Input
                id="resource-name"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                placeholder="Enter resource name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="resource-description">Description</Label>
              <Textarea
                id="resource-description"
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
                placeholder="Describe this resource (optional)"
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="resource-file">File *</Label>
              <Input
                id="resource-file"
                type="file"
                onChange={(e) => setResourceFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
              {resourceFile && (
                <p className="text-sm text-muted-foreground mt-1">
                  Selected: {resourceFile.name} (
                  {(resourceFile.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResourceModalOpen(false);
                setResourceName("");
                setResourceDescription("");
                setResourceFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadResource}
              disabled={createResourceMutation.isPending}
            >
              {createResourceMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!resourceToDelete}
        onOpenChange={(open) => !open && setResourceToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this resource? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResourceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (resourceToDelete) {
                  deleteResourceMutation.mutate(resourceToDelete);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

const GroupEventsTab = ({
  groupId,
  canManage,
}: {
  groupId: string;
  canManage: boolean;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: upcomingEvents = [], isLoading: upcomingLoading } = useQuery({
    queryKey: ["group-upcoming-events", groupId],
    queryFn: () => getGroupUpcomingEvents(groupId, 10),
    enabled: !!groupId,
  });

  const { data: allEvents = [], isLoading: allLoading } = useQuery({
    queryKey: ["group-events", groupId],
    queryFn: () => getGroupEvents(groupId, { page: 1, limit: 20 }),
    enabled: !!groupId,
  });

  const createEventMutation = useMutation({
    mutationFn: (data: Omit<CreateEventRequest, "space_id">) =>
      createGroupEvent(groupId, data),
    onSuccess: () => {
      toast({ title: "Event created successfully" });
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] });
      queryClient.invalidateQueries({
        queryKey: ["group-upcoming-events", groupId],
      });
      setShowCreateForm(false);
    },
    onError: () => {
      toast({ title: "Failed to create event", variant: "destructive" });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: any }) =>
      updateEvent(eventId, data),
    onSuccess: () => {
      toast({ title: "Event updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["group-events", groupId] });
      queryClient.invalidateQueries({
        queryKey: ["group-upcoming-events", groupId],
      });
      setEditingEvent(null);
    },
    onError: () => {
      toast({ title: "Failed to update event", variant: "destructive" });
    },
  });

  if (upcomingLoading || allLoading) {
    return (
      <div className="p-8 text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (showCreateForm || editingEvent) {
    return (
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editingEvent ? "Edit Event" : "Create New Event"}
        </h3>
        <EventForm
          event={editingEvent || undefined}
          onSubmit={async (data) => {
            if (editingEvent) {
              await updateEventMutation.mutateAsync({
                eventId: editingEvent.id,
                data,
              });
            } else {
              await createEventMutation.mutateAsync(data);
            }
          }}
          onCancel={() => {
            setShowCreateForm(false);
            setEditingEvent(null);
          }}
          isSubmitting={
            createEventMutation.isPending || updateEventMutation.isPending
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Group Events</h3>
        {canManage && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden md:block ml-2">Create Event</span>
          </Button>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-3">Upcoming Events</h4>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onClick={() => setSelectedEvent(event)}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium mb-3">All Events</h4>
          {allEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No events yet. {canManage && "Create one to get started!"}
            </p>
          ) : (
            <div className="space-y-3">
              {allEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer"
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{event.title}</p>
                      {event.is_registered && (
                        <Badge variant="secondary" className="text-xs">
                          Registered
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {moment(event.start_date).format("MMM D, YYYY • h:mm A")}
                    </p>
                  </div>
                  <Badge variant="outline">{event.category}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          open={!!selectedEvent}
          onOpenChange={(open) => !open && setSelectedEvent(null)}
          canManage={canManage}
          onEdit={() => {
            setEditingEvent(selectedEvent);
            setSelectedEvent(null);
          }}
          onDelete={() => {
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
};

export default GroupDetail;
