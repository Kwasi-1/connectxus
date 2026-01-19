import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Switch } from "@/components/ui/switch";
import {
  Search,
  MoreHorizontal,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Download,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Flag,
  Lock,
  Globe,
  Briefcase,
  Ban,
  Activity,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Community } from "@/types/communities";
import { User } from "@/types/global";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import { groupsApi } from "@/api/groups.api";
import { type AdminGroup } from "@/data/mockAdminCommunitiesData";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";
import { uploadFile } from "@/api/files.api";

interface CreateCommunityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCommunity: (communityData: Partial<Community>) => Promise<void>;
}

function CreateCommunityModal({
  open,
  onOpenChange,
  onCreateCommunity,
}: CreateCommunityModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "Academic",
    coverImage: "",
    isPublic: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const settings = {
        theme: {
          accent_color: "#3B82F6",
          primary_color: "#1F2937",
          dark_mode_enabled: false,
        },
        branding: {
          favicon: "",
          tagline: formData.description || "",
          short_name: formData.name.substring(0, 3).toUpperCase(),
        },
        features: {
          enable_events: true,
          enable_marketplace: false,
          enable_social_feed: true,
          enable_learning_portal: false,
        },
        access_policies: {
          moderation_level: "moderate",
          allow_guest_users: false,
          require_verified_email: true,
        },
      };

      const settingsJson = JSON.stringify(settings);
      const settingsBytes = new TextEncoder().encode(settingsJson);

      await onCreateCommunity({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        coverImage: formData.coverImage,
        isPublic: formData.isPublic,
      });

      setFormData({
        name: "",
        description: "",
        category: "Academic",
        coverImage: "",
        isPublic: true,
      });
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        category: "Academic",
        coverImage: "",
        isPublic: true,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Community</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new community. All fields
            marked with * are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Community Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Computer Science Students"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={loading}
                minLength={3}
                maxLength={100}
              />
              <p className="text-xs text-muted-foreground">
                Must be between 3 and 100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose and goals of this community..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                disabled={loading}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Level">Level</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.coverImage}
                onChange={(e) =>
                  setFormData({ ...formData, coverImage: e.target.value })
                }
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Provide a URL for the community cover image
              </p>
            </div>

            <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="text-base">
                  Public Community
                </Label>
                <p className="text-sm text-muted-foreground">
                  {formData.isPublic
                    ? "Anyone can discover and join this community"
                    : "Only invited members can join this community"}
                </p>
              </div>
              <Switch
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
                disabled={loading}
              />
            </div>

            {formData.name && (
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <Label className="text-sm font-medium">Preview</Label>
                <div className="space-y-1">
                  <p className="font-medium">{formData.name}</p>
                  {formData.description && (
                    <p className="text-sm text-muted-foreground">
                      {formData.description}
                    </p>
                  )}
                  <div className="flex gap-2 pt-2">
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      {formData.category}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        formData.isPublic
                          ? "bg-green-50 text-green-700 ring-green-600/20"
                          : "bg-orange-50 text-orange-700 ring-orange-600/20"
                      }`}
                    >
                      {formData.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.name || formData.name.length < 3}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Community"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface GroupDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
}

function GroupDetailsModal({
  open,
  onOpenChange,
  group,
}: GroupDetailsModalProps) {
  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Group Details</DialogTitle>
          <DialogDescription>
            Detailed information about {group.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={group.avatar} />
              <AvatarFallback>
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{group.name}</h3>
              <p className="text-sm text-muted-foreground">
                {group.description}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Type</Label>
              <p className="text-sm font-medium capitalize">
                {group.group_type}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Status</Label>
              <p className="text-sm font-medium capitalize">{group.status}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Members</Label>
              <p className="text-sm font-medium">{group.memberCount}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Flags</Label>
              <p className="text-sm font-medium">{group.flags}</p>
            </div>
          </div>

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Creator
            </Label>
            <div className="flex items-center space-x-3 p-3 rounded-lg border">
              <Avatar className="h-10 w-10">
                <AvatarImage src={group.creatorInfo.avatar} />
                <AvatarFallback>
                  {group.creatorInfo.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{group.creatorInfo.name}</p>
                <p className="text-xs text-muted-foreground">
                  {group.creatorInfo.email}
                </p>
              </div>
            </div>
          </div>

          {group.tags.length > 0 && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Tags
              </Label>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Created</Label>
              <p className="text-sm font-medium">
                {new Date(group.created_at).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">
                Last Activity
              </Label>
              <p className="text-sm font-medium">
                {new Date(group.lastActivity).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface SuspendGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group: AdminGroup | null;
  onConfirm: () => void;
}

function SuspendGroupDialog({
  open,
  onOpenChange,
  group,
  onConfirm,
}: SuspendGroupDialogProps) {
  if (!group) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Suspend Group</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to suspend "{group.name}"? This will prevent
            members from accessing the group until it is reactivated.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Suspend Group
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CommunitiesGroups() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { selectedSpaceId } = useAdminSpace();
  const [activeTab, setActiveTab] = useState("communities");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupTypeFilter, setGroupTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignModeratorModal, setShowAssignModeratorModal] =
    useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null,
  );

  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showSuspendGroupDialog, setShowSuspendGroupDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null);

  const [loading, setLoading] = useState(true);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [totalGroups, setTotalGroups] = useState(0);
  const [totalCommunities, setTotalCommunities] = useState(0);

  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    category: "",
    coverImage: "",
    avatar: "",
    isPublic: true,
  });

  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(
    null,
  );
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string | null>(null);
  const [isUploadingEdit, setIsUploadingEdit] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);

      const categoryParam =
        categoryFilter === "all" ? undefined : categoryFilter;
      const statusParam = statusFilter === "all" ? undefined : statusFilter;

      const response = await adminApi.getCommunities(
        categoryParam,
        statusParam,
        currentPage,
        pageSize,
        selectedSpaceId,
      );

      setCommunities(response.communities || []);
      setTotalCommunities(response.communities?.length || 0);
    } catch (error) {
      console.error("Failed to fetch communities:", error);
      toast({
        title: "Error",
        description: "Failed to fetch communities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    toast,
    categoryFilter,
    statusFilter,
    currentPage,
    pageSize,
    selectedSpaceId,
  ]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);

      const status = statusFilter === "all" ? undefined : statusFilter;
      const response = await adminApi.getGroups(
        status,
        currentPage,
        pageSize,
        selectedSpaceId,
      );
      setGroups(response.groups as AdminGroup[]);
      setTotalGroups(response.total);
    } catch (error) {
      console.error("Error fetching groups:", error);
      toast({
        title: "Error",
        description: "Failed to fetch groups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, statusFilter, currentPage, pageSize, selectedSpaceId]);

  const searchUsersForModerator = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    try {
      setUserSearchLoading(true);

      const response = await adminApi.getUsers(1, 50);
      const filteredUsers = response.users.filter(
        (user: any) =>
          user.full_name?.toLowerCase().includes(query.toLowerCase()) ||
          user.username?.toLowerCase().includes(query.toLowerCase()) ||
          user.email?.toLowerCase().includes(query.toLowerCase()),
      );
      setSearchUsers(filteredUsers as User[]);
    } catch (error) {
      console.error("Failed to search users:", error);
      setSearchUsers([]);
    } finally {
      setUserSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "communities") {
      fetchCommunities();
    } else if (activeTab === "groups") {
      fetchGroups();
    }
  }, [activeTab, fetchCommunities, fetchGroups]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchUsersForModerator(userSearchQuery);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [userSearchQuery, searchUsersForModerator]);

  const handleCreateCommunity = useCallback(
    async (communityData: Partial<Community>) => {
      try {
        const payload = {
          name: communityData.name || "",
          description: communityData.description || "",
          category: communityData.category || "Academic",
          cover_image: communityData.coverImage || "",
          is_public: communityData.isPublic ?? true,
          settings: communityData.settings || [],
        };

        await adminApi.createCommunity(payload);

        toast({
          title: "Success",
          description: "Community created successfully.",
        });
        setShowCreateModal(false);
        fetchCommunities();
      } catch (error: any) {
        console.error("Failed to create community:", error);
        const errorCode = error?.response?.data?.error?.code;
        let errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Failed to create community.";

        if (errorCode === "space_not_found") {
          errorMessage = `${errorMessage}\n\nTo fix this:\n1. Run: psql -d connect_db -f backend/scripts/create-default-space.sql\n2. Ensure your user account is associated with a valid space`;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, fetchCommunities],
  );

  const handleEditAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setEditAvatarPreview(previewUrl);
    setEditAvatarFile(file);
  };

  const handleEditCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Cover image must be less than 10MB",
        variant: "destructive",
      });
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setEditCoverPreview(previewUrl);
    setEditCoverFile(file);
  };

  const handleRemoveEditAvatar = () => {
    if (editAvatarPreview) {
      URL.revokeObjectURL(editAvatarPreview);
    }
    setEditAvatarPreview(null);
    setEditAvatarFile(null);
  };

  const handleRemoveEditCover = () => {
    if (editCoverPreview) {
      URL.revokeObjectURL(editCoverPreview);
    }
    setEditCoverPreview(null);
    setEditCoverFile(null);
  };

  const handleEditCommunity = useCallback(async () => {
    if (!selectedCommunity) return;

    try {
      setIsUploadingEdit(true);
      let avatarUrl = editFormData.avatar;
      let coverImageUrl = editFormData.coverImage;

      if (editAvatarFile) {
        const uploaded = await uploadFile({
          file: editAvatarFile,
          moduleType: "communities",
          accessLevel: "public",
        });
        avatarUrl = uploaded.url;
      }

      if (editCoverFile) {
        const uploaded = await uploadFile({
          file: editCoverFile,
          moduleType: "communities",
          accessLevel: "public",
        });
        coverImageUrl = uploaded.url;
      }
      const settings = {
        theme: {
          accent_color: "#3B82F6",
          primary_color: "#1F2937",
          dark_mode_enabled: false,
        },
        branding: {
          favicon: "",
          tagline: editFormData.description || "",
          short_name: editFormData.name.substring(0, 3).toUpperCase(),
        },
        features: {
          enable_events: true,
          enable_marketplace: false,
          enable_social_feed: true,
          enable_learning_portal: false,
        },
        access_policies: {
          moderation_level: "moderate",
          allow_guest_users: false,
          require_verified_email: true,
        },
      };

      const settingsJson = JSON.stringify(settings);
      const settingsBytes = new TextEncoder().encode(settingsJson);

      const payload = {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        avatar: avatarUrl,
        cover_image: coverImageUrl,
        is_public: editFormData.isPublic,
        settings: Array.from(settingsBytes),
      };

      await adminApi.updateCommunity(selectedCommunity.id, payload);

      if (editAvatarPreview) {
        URL.revokeObjectURL(editAvatarPreview);
      }
      if (editCoverPreview) {
        URL.revokeObjectURL(editCoverPreview);
      }
      setEditAvatarFile(null);
      setEditAvatarPreview(null);
      setEditCoverFile(null);
      setEditCoverPreview(null);

      toast({
        title: "Success",
        description: "Community updated successfully.",
      });
      setShowEditModal(false);
      setSelectedCommunity(null);
      fetchCommunities();
    } catch (error: any) {
      console.error("Failed to update community:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to update community.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingEdit(false);
    }
  }, [
    selectedCommunity,
    editFormData,
    editAvatarFile,
    editCoverFile,
    editAvatarPreview,
    editCoverPreview,
    toast,
    fetchCommunities,
  ]);

  const handleDeleteCommunity = useCallback(async () => {
    if (!selectedCommunity) return;

    try {
      await adminApi.deleteCommunity(selectedCommunity.id);
      toast({
        title: "Success",
        description: "Community deleted successfully.",
      });
      setShowDeleteDialog(false);
      setSelectedCommunity(null);
      fetchCommunities();
    } catch (error: any) {
      console.error("Failed to delete community:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to delete community.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [selectedCommunity, toast, fetchCommunities]);

  const handleAssignModerator = useCallback(
    async (communityId: string, userId: string) => {
      try {
        await adminApi.assignCommunityModerator(communityId, userId, [
          "moderate_posts",
          "manage_members",
        ]);
        toast({
          title: "Success",
          description: "Moderator assigned successfully.",
        });
        setShowAssignModeratorModal(false);
        setSelectedCommunity(null);
        setUserSearchQuery("");
        setSearchUsers([]);
        fetchCommunities();
      } catch (error: any) {
        console.error("Failed to assign moderator:", error);
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Failed to assign moderator.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, fetchCommunities],
  );

  const handleExport = useCallback(async () => {
    try {
      const dataType = activeTab === "communities" ? "communities" : "groups";
      const blob = await adminApi.exportData("csv", dataType);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${dataType}-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: `${
          activeTab === "communities" ? "Communities" : "Groups"
        } data exported successfully.`,
      });
    } catch (error: any) {
      console.error("Failed to export data:", error);
      const errorMessage =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        "Failed to export data.";

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [activeTab, toast]);

  const handleApproveGroup = useCallback(
    async (groupId: string) => {
      try {
        await adminApi.approveGroup(groupId);
        toast({
          title: "Success",
          description: "Group has been approved.",
        });
        fetchGroups();
      } catch (error: any) {
        console.error("Error approving group:", error);
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Failed to approve group.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, fetchGroups],
  );

  const handleRejectGroup = useCallback(
    async (groupId: string, reason: string) => {
      try {
        await adminApi.rejectGroup(groupId, reason);
        toast({
          title: "Success",
          description: "Group has been rejected.",
          variant: "destructive",
        });
        fetchGroups();
      } catch (error: any) {
        console.error("Error rejecting group:", error);
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Failed to reject group.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, fetchGroups],
  );

  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      try {
        await adminApi.deleteGroup(groupId);
        toast({
          title: "Success",
          description: "Group has been deleted.",
        });
        fetchGroups();
      } catch (error: any) {
        console.error("Error deleting group:", error);
        const errorMessage =
          error?.response?.data?.error?.message ||
          error?.response?.data?.message ||
          "Failed to delete group.";

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    },
    [toast, fetchGroups],
  );

  const handleSuspendGroup = useCallback(async () => {
    if (!selectedGroup) return;
    toast({
      title: "Feature Not Available",
      description: "Group suspension feature is not yet implemented.",
      variant: "destructive",
    });
    setShowSuspendGroupDialog(false);
    setSelectedGroup(null);
  }, [selectedGroup, toast]);

  const handleReactivateGroup = useCallback(
    async (group: AdminGroup) => {
      toast({
        title: "Feature Not Available",
        description: "Group reactivation feature is not yet implemented.",
        variant: "destructive",
      });
    },
    [toast],
  );

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || community.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.creatorInfo.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || group.status === statusFilter;
    const matchesType =
      groupTypeFilter === "all" || group.groupType === groupTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAllCommunities = useCallback(() => {
    if (selectedCommunities.length === filteredCommunities.length) {
      setSelectedCommunities([]);
    } else {
      setSelectedCommunities(
        filteredCommunities.map((community) => community.id),
      );
    }
  }, [selectedCommunities, filteredCommunities]);

  const handleSelectCommunity = useCallback((communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId],
    );
  }, []);

  const handleSelectAllGroups = useCallback(() => {
    if (selectedGroups.length === filteredGroups.length) {
      setSelectedGroups([]);
    } else {
      setSelectedGroups(filteredGroups.map((group) => group.id));
    }
  }, [selectedGroups, filteredGroups]);

  const handleSelectGroup = useCallback((groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  }, []);

  const getGroupTypeIcon = (groupType: string) => {
    switch (groupType) {
      case "project":
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case "private":
        return <Lock className="h-4 w-4 text-orange-600" />;
      case "public":
        return <Globe className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  const getGroupTypeBadge = (groupType: string) => {
    switch (groupType) {
      case "project":
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            Project
          </Badge>
        );
      case "private":
        return (
          <Badge variant="secondary" className="bg-orange-50 text-orange-700">
            Private
          </Badge>
        );
      case "public":
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            Public
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            <Activity className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary" className="bg-gray-50 text-gray-700">
            Inactive
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="destructive">
            <Ban className="h-3 w-3 mr-1" />
            Suspended
          </Badge>
        );
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-blue-100 text-blue-800",
      Department: "bg-green-100 text-green-800",
      Level: "bg-purple-100 text-purple-800",
      Hostel: "bg-orange-100 text-orange-800",
      Faculty: "bg-indigo-100 text-indigo-800",
      Sports: "bg-red-100 text-red-800",
      Arts: "bg-pink-100 text-pink-800",
      Technology: "bg-cyan-100 text-cyan-800",
      Social: "bg-yellow-100 text-yellow-800",
    };
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    );
  };

  const communityStats = {
    total: communities.length,
    academic: communities.filter((c) => c.category === "Academic").length,
    departments: communities.filter((c) => c.category === "Department").length,
    totalMembers: communities.reduce(
      (acc, community) => acc + community.memberCount,
      0,
    ),
  };

  const groupStats = {
    total: groups.length,
    active: groups.filter((g) => g.status === "active").length,
    projects: groups.filter((g) => g.groupType === "project").length,
    totalMembers: groups.reduce((acc, group) => acc + group.memberCount, 0),
  };

  const statsCards =
    activeTab === "communities"
      ? [
          {
            title: "Total Communities",
            value: communityStats.total,
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            description: "Active communities",
          },
          {
            title: "Academic",
            value: communityStats.academic,
            icon: <AlertTriangle className="h-4 w-4 text-blue-600" />,
            description: "Academic communities",
          },
          {
            title: "Departments",
            value: communityStats.departments,
            icon: <Flag className="h-4 w-4 text-green-600" />,
            description: "Department communities",
          },
          {
            title: "Total Members",
            value: communityStats.totalMembers,
            icon: <UserPlus className="h-4 w-4 text-purple-600" />,
            description: "Across all communities",
          },
        ]
      : [
          {
            title: "Total Groups",
            value: groupStats.total,
            icon: <Users className="h-4 w-4 text-muted-foreground" />,
            description: "All groups",
          },
          {
            title: "Active Groups",
            value: groupStats.active,
            icon: <Activity className="h-4 w-4 text-green-600" />,
            description: "Currently active",
          },
          {
            title: "Project Groups",
            value: groupStats.projects,
            icon: <Briefcase className="h-4 w-4 text-blue-600" />,
            description: "Project-based groups",
          },
          {
            title: "Total Members",
            value: groupStats.totalMembers,
            icon: <UserPlus className="h-4 w-4 text-purple-600" />,
            description: "Across all groups",
          },
        ];

  const actionButtons = [
    {
      label: `Export ${activeTab === "communities" ? "Communities" : "Groups"}`,
      icon: <Download className="h-4 w-4 mr-2" />,
      variant: "outline" as const,
      onClick: handleExport,
    },
    ...(activeTab === "communities"
      ? [
          {
            label: "Create Community",
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: "default" as const,
            onClick: () => setShowCreateModal(true),
          },
        ]
      : [
          {
            label: "Create Group",
            icon: <Plus className="h-4 w-4 mr-2" />,
            variant: "default" as const,
            onClick: () => setShowCreateGroupModal(true),
          },
        ]),
  ];

  const filterOptions =
    activeTab === "communities"
      ? [
          { value: "all", label: "All Categories" },
          { value: "Academic", label: "Academic" },
          { value: "Department", label: "Department" },
          { value: "Level", label: "Level" },
          { value: "Hostel", label: "Hostel" },
          { value: "Faculty", label: "Faculty" },
          { value: "Sports", label: "Sports" },
          { value: "Arts", label: "Arts" },
          { value: "Technology", label: "Technology" },
          { value: "Social", label: "Social" },
        ]
      : [
          { value: "all", label: "All Status" },
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
          { value: "suspended", label: "Suspended" },
        ];

  const groupTypeFilterOptions = [
    { value: "all", label: "All Types" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "project", label: "Project" },
  ];

  const communitiesTableContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Communities ({filteredCommunities.length})
        </h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedCommunities.length === filteredCommunities.length &&
              filteredCommunities.length > 0
            }
            onCheckedChange={handleSelectAllCommunities}
          />
          <span className="text-sm text-muted-foreground">
            {selectedCommunities.length} selected
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  selectedCommunities.length === filteredCommunities.length &&
                  filteredCommunities.length > 0
                }
                onCheckedChange={handleSelectAllCommunities}
              />
            </TableHead>
            <TableHead>Community</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading communities...
                </p>
              </TableCell>
            </TableRow>
          ) : filteredCommunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No communities found.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            filteredCommunities.map((community) => (
              <TableRow key={community.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedCommunities.includes(community.id)}
                    onCheckedChange={() => handleSelectCommunity(community.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={community.avatar} />
                      <AvatarFallback>
                        {community.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {community.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getCategoryBadge(community.category)}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {community.memberCount}
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(community.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCommunity(community);
                          setEditFormData({
                            name: community.name,
                            description: community.description,
                            category: community.category,
                            avatar: community.avatar || "",
                            coverImage: community.coverImage || "",
                            isPublic: community.isPublic ?? true,
                          });
                          setEditAvatarFile(null);
                          setEditAvatarPreview(null);
                          setEditCoverFile(null);
                          setEditCoverPreview(null);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCommunity(community);
                          setShowAssignModeratorModal(true);
                        }}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Assign Moderator
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedCommunity(community);
                          setShowDeleteDialog(true);
                        }}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const groupsTableContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium">
            Groups ({filteredGroups.length})
          </h3>
          <Select value={groupTypeFilter} onValueChange={setGroupTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              {groupTypeFilterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={
              selectedGroups.length === filteredGroups.length &&
              filteredGroups.length > 0
            }
            onCheckedChange={handleSelectAllGroups}
          />
          <span className="text-sm text-muted-foreground">
            {selectedGroups.length} selected
          </span>
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={
                  selectedGroups.length === filteredGroups.length &&
                  filteredGroups.length > 0
                }
                onCheckedChange={handleSelectAllGroups}
              />
            </TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Members</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Loading groups...
                </p>
              </TableCell>
            </TableRow>
          ) : filteredGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                <Users className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No groups found.
                </p>
              </TableCell>
            </TableRow>
          ) : (
            filteredGroups.map((group) => (
              <TableRow key={group.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedGroups.includes(group.id)}
                    onCheckedChange={() => handleSelectGroup(group.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={group.avatar} />
                      <AvatarFallback>
                        {group.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{group.name}</span>
                        {getGroupTypeIcon(group.groupType)}
                      </div>
                      <div className="text-sm text-muted-foreground line-clamp-1">
                        {group.description}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {group.tags && (
                          <>
                            {group.tags.slice(0, 2).map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {group.tags.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{group.tags.length - 2}
                              </Badge>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getGroupTypeBadge(group.groupType)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {group.creator_name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {group.creator_name}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {group.memberCount}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(group.status)}
                  {group.flags > 0 && (
                    <Badge variant="destructive" className="ml-1">
                      {group.flags} flags
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{new Date(group.createdAt).toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Last active:{" "}
                      {new Date(group.lastActivity).toLocaleDateString()}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowGroupDetailsModal(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {group.status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleApproveGroup(group.id)}
                            className="text-green-600"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve Group
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              handleRejectGroup(group.id, "Rejected by admin")
                            }
                            className="text-red-600"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject Group
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {group.status === "active" ? (
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedGroup(group);
                            setShowSuspendGroupDialog(true);
                          }}
                          className="text-red-600"
                        >
                          <Ban className="h-4 w-4 mr-2" />
                          Suspend Group
                        </DropdownMenuItem>
                      ) : group.status === "suspended" ? (
                        <DropdownMenuItem
                          onClick={() => handleReactivateGroup(group)}
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reactivate Group
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuItem
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Group
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  const tabs = [
    {
      value: "communities",
      label: "Communities Management",
      content: communitiesTableContent,
    },
    {
      value: "groups",
      label: "Groups Management",
      content: groupsTableContent,
    },
  ];

  return (
    <>
      <AdminPageLayout
        title="Communities & Groups Management"
        actionButtons={actionButtons}
        statsCards={statsCards}
        contentTitle="Management"
        showSearch={true}
        searchPlaceholder={`Search ${activeTab}...`}
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        showFilter={true}
        filterValue={
          activeTab === "communities" ? categoryFilter : statusFilter
        }
        onFilterChange={
          activeTab === "communities" ? setCategoryFilter : setStatusFilter
        }
        filterOptions={filterOptions}
        filterPlaceholder={activeTab === "communities" ? "Category" : "Status"}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={loading}
        loadingCardCount={4}
      />

      <CreateCommunityModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateCommunity={handleCreateCommunity}
      />

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Community</DialogTitle>
            <DialogDescription>
              Update the community information below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">
                Community Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={editFormData.category}
                onValueChange={(value) =>
                  setEditFormData({ ...editFormData, category: value })
                }
              >
                <SelectTrigger id="edit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Department">Department</SelectItem>
                  <SelectItem value="Level">Level</SelectItem>
                  <SelectItem value="Hostel">Hostel</SelectItem>
                  <SelectItem value="Faculty">Faculty</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Arts">Arts</SelectItem>
                  <SelectItem value="Technology">Technology</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-avatar">Avatar (Optional)</Label>
              <div className="space-y-2">
                {(editAvatarPreview || editFormData.avatar) && (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <img
                      src={editAvatarPreview || editFormData.avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditAvatarSelect}
                    className="hidden"
                    id="edit-avatar-upload"
                    aria-label="Upload avatar"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("edit-avatar-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {editAvatarFile || editFormData.avatar
                        ? "Change Avatar"
                        : "Upload Avatar"}
                    </Button>
                    {(editAvatarFile || editFormData.avatar) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveEditAvatar}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB. JPG, PNG, or GIF. Recommended: 400x400px (square)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-coverImage">Cover Image (Optional)</Label>
              <div className="space-y-2">
                {(editCoverPreview || editFormData.coverImage) && (
                  <div className="relative w-full h-32 rounded-lg overflow-hidden">
                    <img
                      src={editCoverPreview || editFormData.coverImage}
                      alt="Cover preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditCoverSelect}
                    className="hidden"
                    id="edit-cover-upload"
                    aria-label="Upload cover image"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        document.getElementById("edit-cover-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {editCoverFile || editFormData.coverImage
                        ? "Change Cover"
                        : "Upload Cover"}
                    </Button>
                    {(editCoverFile || editFormData.coverImage) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveEditCover}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 10MB. JPG, PNG, or GIF. Recommended: 1200x400px
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={isUploadingEdit}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditCommunity}
              disabled={!editFormData.name || isUploadingEdit}
            >
              {isUploadingEdit ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              community "{selectedCommunity?.name}" and remove all associated
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCommunity}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={showAssignModeratorModal}
        onOpenChange={setShowAssignModeratorModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Moderator</DialogTitle>
            <DialogDescription>
              Search and select a user to assign as moderator for "
              {selectedCommunity?.name}".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user-search">Search Users</Label>
              <Input
                id="user-search"
                placeholder="Search by name, username, or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>

            {userSearchLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : searchUsers.length > 0 ? (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {searchUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted cursor-pointer"
                    onClick={() => {
                      if (selectedCommunity) {
                        handleAssignModerator(selectedCommunity.id, user.id);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.fullName?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {user.fullName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Assign
                    </Button>
                  </div>
                ))}
              </div>
            ) : userSearchQuery ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No users found.
              </p>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-8">
                Start typing to search for users.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAssignModeratorModal(false);
                setUserSearchQuery("");
                setSearchUsers([]);
              }}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GroupDetailsModal
        open={showGroupDetailsModal}
        onOpenChange={setShowGroupDetailsModal}
        group={selectedGroup}
      />

      <SuspendGroupDialog
        open={showSuspendGroupDialog}
        onOpenChange={setShowSuspendGroupDialog}
        group={selectedGroup}
        onConfirm={handleSuspendGroup}
      />

      <CreateGroupModal
        open={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onCreateGroup={async (groupData) => {
          try {
            const payload: any = {
              name: groupData.name,
              description: groupData.description,
              category: groupData.category,
              group_type: groupData.groupType,
              avatar: groupData.avatar || undefined,
              banner: groupData.banner || undefined,
              tags: groupData.tags,
            };

            if (
              groupData.groupType === "project" &&
              groupData.projectRoles &&
              groupData.projectRoles.length > 0
            ) {
              payload.roles = groupData.projectRoles.map((role: any) => ({
                name: role.name,
                description: role.description,
                slots_total: role.slots,
                skills_required: [],
              }));
            }

            await groupsApi.createGroup(payload);
            toast({
              title: "Success",
              description: "Group created successfully!",
            });
            setShowCreateGroupModal(false);
            fetchGroups();
          } catch (error) {
            console.error("Failed to create group:", error);
            toast({
              title: "Error",
              description: "Failed to create group.",
              variant: "destructive",
            });
          }
        }}
      />
    </>
  );
}

export default CommunitiesGroups;
