import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  MoreHorizontal,
  Users,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  Flag,
  Calendar,
  Crown,
  Lock,
  Globe,
  Briefcase,
  Ban,
  Activity,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Community, Group } from "@/types/communities";
import { User } from "@/types/global";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import {
  mockCommunitiesApi,
  mockGroupsApi,
  mockUsersApi,
  type AdminGroup,
} from "@/data/mockAdminCommunitiesData";
import {
  CreateCommunityModal,
  GroupDetailsModal,
  SuspendGroupDialog,
} from "@/components/admin/communities";

export function CommunitiesGroups() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("communities");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupTypeFilter, setGroupTypeFilter] = useState("all");

  // Communities state
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunities, setSelectedCommunities] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAssignModeratorModal, setShowAssignModeratorModal] =
    useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(
    null
  );

  // Groups state
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [showSuspendGroupDialog, setShowSuspendGroupDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null);

  // Common state
  const [loading, setLoading] = useState(true);
  const [searchUsers, setSearchUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchLoading, setUserSearchLoading] = useState(false);

  const fetchCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockCommunitiesApi.getCommunities();
      setCommunities(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch communities.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await mockGroupsApi.getGroups();
      setGroups(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch groups.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const searchUsersForModerator = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchUsers([]);
      return;
    }

    try {
      setUserSearchLoading(true);
      const users = await mockUsersApi.searchUsers(query);
      setSearchUsers(users);
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
        await mockCommunitiesApi.createCommunity({
          name: communityData.name || "",
          description: communityData.description || "",
          category: communityData.category || "Academic",
          memberCount: 0,
          isJoined: false,
          createdAt: new Date(),
          admins: ["current-admin-id"], // Replace with actual admin ID
          moderators: [],
        });
        toast({
          title: "Success",
          description: "Community created successfully.",
        });
        setShowCreateModal(false);
        fetchCommunities();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create community.",
          variant: "destructive",
        });
      }
    },
    [toast, fetchCommunities]
  );

  const handleEditCommunity = useCallback(async () => {
    if (!selectedCommunity) return;

    try {
      await mockCommunitiesApi.updateCommunity(
        selectedCommunity.id,
        selectedCommunity
      );
      toast({
        title: "Success",
        description: "Community updated successfully.",
      });
      setShowEditModal(false);
      setSelectedCommunity(null);
      fetchCommunities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update community.",
        variant: "destructive",
      });
    }
  }, [selectedCommunity, toast, fetchCommunities]);

  const handleDeleteCommunity = useCallback(async () => {
    if (!selectedCommunity) return;

    try {
      await mockCommunitiesApi.deleteCommunity(selectedCommunity.id);
      toast({
        title: "Success",
        description: "Community deleted successfully.",
      });
      setShowDeleteDialog(false);
      setSelectedCommunity(null);
      fetchCommunities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete community.",
        variant: "destructive",
      });
    }
  }, [selectedCommunity, toast, fetchCommunities]);

  const handleAssignModerator = useCallback(
    async (communityId: string, userId: string) => {
      try {
        await mockCommunitiesApi.assignModerator(communityId, userId);
        toast({
          title: "Success",
          description: "Moderator assigned successfully.",
        });
        setShowAssignModeratorModal(false);
        setSelectedCommunity(null);
        setUserSearchQuery("");
        setSearchUsers([]);
        fetchCommunities();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to assign moderator.",
          variant: "destructive",
        });
      }
    },
    [toast, fetchCommunities]
  );

  const handleExport = useCallback(async () => {
    try {
      if (activeTab === "communities") {
        await mockCommunitiesApi.exportCommunities();
        toast({
          title: "Success",
          description: "Communities data exported successfully.",
        });
      } else {
        await mockGroupsApi.exportGroups();
        toast({
          title: "Success",
          description: "Groups data exported successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data.",
        variant: "destructive",
      });
    }
  }, [activeTab, toast]);

  // Groups handlers
  const handleSuspendGroup = useCallback(async () => {
    if (!selectedGroup) return;

    try {
      await mockGroupsApi.suspendGroup(selectedGroup.id);
      toast({
        title: "Success",
        description: `Group "${selectedGroup.name}" has been suspended.`,
      });
      setShowSuspendGroupDialog(false);
      setSelectedGroup(null);
      fetchGroups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to suspend group.",
        variant: "destructive",
      });
    }
  }, [selectedGroup, toast, fetchGroups]);

  const handleReactivateGroup = useCallback(
    async (group: AdminGroup) => {
      try {
        await mockGroupsApi.reactivateGroup(group.id);
        toast({
          title: "Success",
          description: `Group "${group.name}" has been reactivated.`,
        });
        fetchGroups();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reactivate group.",
          variant: "destructive",
        });
      }
    },
    [toast, fetchGroups]
  );

  // Selection handlers

  const filteredCommunities = communities.filter((community) => {
    const matchesSearch =
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      statusFilter === "all" ||
      (statusFilter === "academic" && community.category === "Academic") ||
      (statusFilter === "department" && community.category === "Department") ||
      (statusFilter === "level" && community.category === "Level") ||
      (statusFilter === "hostel" && community.category === "Hostel") ||
      (statusFilter === "faculty" && community.category === "Faculty");

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
        filteredCommunities.map((community) => community.id)
      );
    }
  }, [selectedCommunities, filteredCommunities]);

  const handleSelectCommunity = useCallback((communityId: string) => {
    setSelectedCommunities((prev) =>
      prev.includes(communityId)
        ? prev.filter((id) => id !== communityId)
        : [...prev, communityId]
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
        : [...prev, groupId]
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

  const handleSelectAll = () => {
    if (selectedCommunities.length === filteredCommunities.length) {
      setSelectedCommunities([]);
    } else {
      setSelectedCommunities(
        filteredCommunities.map((community) => community.id)
      );
    }
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      Academic: "bg-blue-100 text-blue-800",
      Department: "bg-green-100 text-green-800",
      Level: "bg-purple-100 text-purple-800",
      Hostel: "bg-orange-100 text-orange-800",
      Faculty: "bg-indigo-100 text-indigo-800",
    };
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category}
      </Badge>
    );
  };

  // Calculate statistics based on active tab
  const communityStats = {
    total: communities.length,
    academic: communities.filter((c) => c.category === "Academic").length,
    departments: communities.filter((c) => c.category === "Department").length,
    totalMembers: communities.reduce(
      (acc, community) => acc + community.memberCount,
      0
    ),
  };

  const groupStats = {
    total: groups.length,
    active: groups.filter((g) => g.status === "active").length,
    projects: groups.filter((g) => g.groupType === "project").length,
    totalMembers: groups.reduce((acc, group) => acc + group.memberCount, 0),
  };

  // Create stats cards data based on active tab
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

  // Create action buttons
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
      : []),
  ];

  // Create filter options
  const filterOptions =
    activeTab === "communities"
      ? [
          { value: "all", label: "All Categories" },
          { value: "academic", label: "Academic" },
          { value: "department", label: "Department" },
          { value: "level", label: "Level" },
          { value: "hostel", label: "Hostel" },
          { value: "faculty", label: "Faculty" },
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

  // Create communities table content
  const communitiesTableContent = (
    <div className="space-y-4">
      {/* Communities Table with header */}
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
                Loading communities...
              </TableCell>
            </TableRow>
          ) : filteredCommunities.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8">
                No communities found.
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
                      <AvatarImage src={community.coverImage} />
                      <AvatarFallback>
                        {community.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{community.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {community.description}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{community.category}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                    {community.memberCount}
                  </div>
                </TableCell>
                <TableCell>
                  {community.createdAt.toLocaleDateString()}
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

  // Create groups table content
  const groupsTableContent = (
    <div className="space-y-4">
      {/* Additional filter for groups */}
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
                Loading groups...
              </TableCell>
            </TableRow>
          ) : filteredGroups.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No groups found.
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
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{getGroupTypeBadge(group.groupType)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={group.creatorInfo.avatar} />
                      <AvatarFallback className="text-xs">
                        {group.creatorInfo.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">
                        {group.creatorInfo.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {group.creatorInfo.email}
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
                    <div>{group.createdAt.toLocaleDateString()}</div>
                    <div className="text-xs text-muted-foreground">
                      Last active: {group.lastActivity.toLocaleDateString()}
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

  // Create tabs configuration
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
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
        filterOptions={filterOptions}
        filterPlaceholder={activeTab === "communities" ? "Category" : "Status"}
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isLoading={loading}
        loadingCardCount={4}
      />

      {/* Modular Components */}
      <CreateCommunityModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCreateCommunity={handleCreateCommunity}
      />

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
    </>
  );
}

export default CommunitiesGroups;
