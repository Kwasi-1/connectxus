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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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

// Admin Group interface for admin management
interface AdminGroup extends Group {
  status: "active" | "inactive" | "suspended";
  flags: number;
  lastActivity: Date;
  creatorInfo: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

// Mock API - replace with real API calls
const mockCommunitiesApi = {
  getCommunities: async (): Promise<Community[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: "1",
        name: "Computer Science Department",
        description:
          "Connect with fellow CS students, share projects, and collaborate on assignments.",
        category: "Academic",
        memberCount: 1247,
        coverImage: "/placeholder.svg",
        isJoined: false,
        createdAt: new Date("2024-01-15"),
        admins: ["admin-1"],
        moderators: ["mod-1", "mod-2"],
      },
      // Add more mock communities
    ];
  },
  createCommunity: async (
    community: Partial<Community>
  ): Promise<Community> => {
    // Mock implementation
    return { ...community, id: Date.now().toString() } as Community;
  },
  updateCommunity: async (
    id: string,
    community: Partial<Community>
  ): Promise<Community> => {
    // Mock implementation
    return community as Community;
  },
  deleteCommunity: async (id: string): Promise<void> => {
    // Mock implementation
  },
  assignModerator: async (
    communityId: string,
    userId: string
  ): Promise<void> => {
    // Mock implementation
  },
  exportCommunities: async (): Promise<void> => {
    // Mock implementation
  },
};

// Mock Groups API
const mockGroupsApi = {
  getGroups: async (): Promise<AdminGroup[]> => {
    // Mock data - replace with actual API call
    return [
      {
        id: "g1",
        name: "Study Squad - Data Structures",
        description:
          "Weekly study sessions for Data Structures and Algorithms course.",
        category: "Study Group",
        memberCount: 23,
        groupType: "public",
        isJoined: false,
        tags: ["Study", "CS", "Algorithms"],
        createdAt: new Date("2024-03-01"),
        createdBy: "user-1",
        avatar: "/placeholder.svg",
        admins: ["user-1"],
        moderators: ["user-2"],
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-15"),
        creatorInfo: {
          id: "user-1",
          name: "John Doe",
          email: "john@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g2",
        name: "AI Research Group",
        description:
          "Collaborative research on machine learning and artificial intelligence.",
        category: "Academic",
        memberCount: 15,
        groupType: "private",
        isJoined: false,
        tags: ["AI", "Research", "Machine Learning"],
        createdAt: new Date("2024-02-15"),
        createdBy: "user-3",
        avatar: "/placeholder.svg",
        admins: ["user-3"],
        moderators: [],
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-14"),
        creatorInfo: {
          id: "user-3",
          name: "Dr. Sarah Wilson",
          email: "sarah.wilson@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g3",
        name: "Campus Mobile App Project",
        description: "Building a comprehensive mobile app for campus services.",
        category: "Professional",
        memberCount: 8,
        groupType: "project",
        isJoined: false,
        tags: ["Mobile Dev", "React Native", "Team Project"],
        createdAt: new Date("2024-01-20"),
        createdBy: "user-4",
        avatar: "/placeholder.svg",
        admins: ["user-4"],
        moderators: ["user-5"],
        projectRoles: [
          {
            id: "role-1",
            name: "Frontend Developer",
            description: "React Native mobile app development",
            slotsTotal: 2,
            slotsFilled: 1,
            applications: [],
          },
          {
            id: "role-2",
            name: "Backend Developer",
            description: "Node.js API development",
            slotsTotal: 2,
            slotsFilled: 2,
            applications: [],
          },
        ],
        projectDeadline: new Date("2024-12-01"),
        isAcceptingApplications: true,
        status: "active",
        flags: 0,
        lastActivity: new Date("2024-03-13"),
        creatorInfo: {
          id: "user-4",
          name: "Mike Chen",
          email: "mike.chen@university.edu",
          avatar: "/placeholder.svg",
        },
      },
      {
        id: "g4",
        name: "Gaming Club",
        description: "Weekly gaming sessions and esports tournaments.",
        category: "Social",
        memberCount: 45,
        groupType: "public",
        isJoined: false,
        tags: ["Gaming", "Esports", "Social"],
        createdAt: new Date("2024-02-28"),
        createdBy: "user-6",
        avatar: "/placeholder.svg",
        admins: ["user-6"],
        moderators: ["user-7"],
        status: "inactive",
        flags: 2,
        lastActivity: new Date("2024-02-28"),
        creatorInfo: {
          id: "user-6",
          name: "Alex Turner",
          email: "alex.turner@university.edu",
        },
      },
    ];
  },
  suspendGroup: async (groupId: string): Promise<void> => {
    // Mock implementation
    console.log(`Suspending group ${groupId}`);
  },
  reactivateGroup: async (groupId: string): Promise<void> => {
    // Mock implementation
    console.log(`Reactivating group ${groupId}`);
  },
  exportGroups: async (): Promise<void> => {
    // Mock implementation
    console.log("Exporting groups data");
  },
};

const mockUsersApi = {
  searchUsers: async (query: string): Promise<User[]> => {
    // Mock implementation - replace with real API
    return [
      {
        id: "user-1",
        username: "john_doe",
        displayName: "John Doe",
        email: "john@university.edu",
        avatar: "/placeholder.svg",
        verified: false,
        followers: 234,
        following: 180,
        createdAt: new Date("2024-01-01"),
        roles: ["student" as const],
      },
      {
        id: "user-2",
        username: "sarah_admin",
        displayName: "Sarah Johnson",
        email: "sarah@university.edu",
        avatar: "/placeholder.svg",
        verified: true,
        followers: 567,
        following: 234,
        createdAt: new Date("2024-01-05"),
        roles: ["admin" as const],
      },
    ].filter(
      (user) =>
        user.displayName.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );
  },
};

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
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    description: "",
    category: "Academic" as Community["category"],
    coverImage: null as File | null,
  });

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

  const handleCreateCommunity = useCallback(async () => {
    try {
      await mockCommunitiesApi.createCommunity({
        name: newCommunity.name,
        description: newCommunity.description,
        category: newCommunity.category,
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
      setNewCommunity({
        name: "",
        description: "",
        category: "Academic",
        coverImage: null,
      });
      fetchCommunities();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create community.",
        variant: "destructive",
      });
    }
  }, [newCommunity, toast, fetchCommunities]);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">
          Communities & Groups Management
        </h1>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export {activeTab === "communities" ? "Communities" : "Groups"}
          </Button>
          {activeTab === "communities" && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Community
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Community</DialogTitle>
                  <DialogDescription>
                    Create a new community for campus activities and
                    departments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Community Name</Label>
                    <Input
                      id="name"
                      value={newCommunity.name}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      placeholder="Enter community name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newCommunity.description}
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe the community's purpose"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newCommunity.category}
                      onValueChange={(value) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          category: value as Community["category"],
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Academic">Academic</SelectItem>
                        <SelectItem value="Department">Department</SelectItem>
                        <SelectItem value="Level">Level</SelectItem>
                        <SelectItem value="Hostel">Hostel</SelectItem>
                        <SelectItem value="Faculty">Faculty</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="coverImage">Cover Image</Label>
                    <Input
                      id="coverImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setNewCommunity((prev) => ({
                          ...prev,
                          coverImage: e.target.files?.[0] || null,
                        }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCommunity}>
                    Create Community
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="communities" className="space-y-6">
          {/* Communities Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Communities
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{communities.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active communities
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Academic</CardTitle>
                <AlertTriangle className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {communities.filter((c) => c.category === "Academic").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Academic communities
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Departments
                </CardTitle>
                <Flag className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    communities.filter((c) => c.category === "Department")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  Department communities
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <UserPlus className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {communities.reduce(
                    (acc, community) => acc + community.memberCount,
                    0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all communities
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Communities Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search communities..."
                  className="pl-9 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="level">Level</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                  <SelectItem value="faculty">Faculty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Communities Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  Communities ({filteredCommunities.length})
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={
                      selectedCommunities.length ===
                        filteredCommunities.length &&
                      filteredCommunities.length > 0
                    }
                    onCheckedChange={handleSelectAllCommunities}
                  />
                  <span className="text-sm text-muted-foreground">
                    {selectedCommunities.length} selected
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedCommunities.length ===
                            filteredCommunities.length &&
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
                            onCheckedChange={() =>
                              handleSelectCommunity(community.id)
                            }
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
                              <div className="font-medium">
                                {community.name}
                              </div>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-6">
          {/* Groups Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Groups
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{groups.length}</div>
                <p className="text-xs text-muted-foreground">All groups</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Groups
                </CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {groups.filter((g) => g.status === "active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Project Groups
                </CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {groups.filter((g) => g.groupType === "project").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Project-based groups
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Members
                </CardTitle>
                <UserPlus className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {groups.reduce((acc, group) => acc + group.memberCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all groups
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Groups Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search groups..."
                  className="pl-9 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={groupTypeFilter}
                onValueChange={setGroupTypeFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Groups Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Groups ({filteredGroups.length})</CardTitle>
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
            </CardHeader>
            <CardContent>
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
                                <span className="font-medium">
                                  {group.name}
                                </span>
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
                        <TableCell>
                          {getGroupTypeBadge(group.groupType)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={group.creatorInfo.avatar} />
                              <AvatarFallback className="text-xs">
                                {group.creatorInfo.name
                                  .substring(0, 2)
                                  .toUpperCase()}
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
                              Last active:{" "}
                              {group.lastActivity.toLocaleDateString()}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Group Details Modal */}
      <Dialog
        open={showGroupDetailsModal}
        onOpenChange={setShowGroupDetailsModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedGroup?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedGroup.avatar} />
                  <AvatarFallback>
                    {selectedGroup.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {selectedGroup.name}
                    {getGroupTypeIcon(selectedGroup.groupType)}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedGroup.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {getGroupTypeBadge(selectedGroup.groupType)}
                    {getStatusBadge(selectedGroup.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Group Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Category:
                      </span>
                      <span className="ml-2">{selectedGroup.category}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Members:
                      </span>
                      <span className="ml-2">{selectedGroup.memberCount}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Created:
                      </span>
                      <span className="ml-2">
                        {selectedGroup.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Last Activity:
                      </span>
                      <span className="ml-2">
                        {selectedGroup.lastActivity.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Creator Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedGroup.creatorInfo.avatar} />
                        <AvatarFallback className="text-xs">
                          {selectedGroup.creatorInfo.name
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {selectedGroup.creatorInfo.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedGroup.creatorInfo.email}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedGroup.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedGroup.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedGroup.groupType === "project" &&
                selectedGroup.projectRoles && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Project Roles</h4>
                    <div className="space-y-2">
                      {selectedGroup.projectRoles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{role.name}</h5>
                            <Badge variant="outline">
                              {role.slotsFilled}/{role.slotsTotal}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedGroup.projectDeadline && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            Project Deadline:{" "}
                            {selectedGroup.projectDeadline.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {selectedGroup.flags > 0 && (
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      This group has {selectedGroup.flags} flag
                      {selectedGroup.flags !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGroupDetailsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Group Dialog */}
      <AlertDialog
        open={showSuspendGroupDialog}
        onOpenChange={setShowSuspendGroupDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{selectedGroup?.name}"? This
              action will make the group inactive and prevent new members from
              joining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendGroup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Suspend Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Group Details Modal */}
      <Dialog
        open={showGroupDetailsModal}
        onOpenChange={setShowGroupDetailsModal}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Group Details</DialogTitle>
            <DialogDescription>
              View detailed information about {selectedGroup?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedGroup && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedGroup.avatar} />
                  <AvatarFallback>
                    {selectedGroup.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    {selectedGroup.name}
                    {getGroupTypeIcon(selectedGroup.groupType)}
                  </h3>
                  <p className="text-muted-foreground">
                    {selectedGroup.description}
                  </p>
                  <div className="flex gap-2 mt-2">
                    {getGroupTypeBadge(selectedGroup.groupType)}
                    {getStatusBadge(selectedGroup.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Group Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Category:
                      </span>
                      <span className="ml-2">{selectedGroup.category}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Members:
                      </span>
                      <span className="ml-2">{selectedGroup.memberCount}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Created:
                      </span>
                      <span className="ml-2">
                        {selectedGroup.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Last Activity:
                      </span>
                      <span className="ml-2">
                        {selectedGroup.lastActivity.toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Creator Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedGroup.creatorInfo.avatar} />
                        <AvatarFallback className="text-xs">
                          {selectedGroup.creatorInfo.name
                            .substring(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">
                          {selectedGroup.creatorInfo.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedGroup.creatorInfo.email}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedGroup.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedGroup.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedGroup.groupType === "project" &&
                selectedGroup.projectRoles && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Project Roles</h4>
                    <div className="space-y-2">
                      {selectedGroup.projectRoles.map((role) => (
                        <div key={role.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{role.name}</h5>
                            <Badge variant="outline">
                              {role.slotsFilled}/{role.slotsTotal}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {role.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    {selectedGroup.projectDeadline && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            Project Deadline:{" "}
                            {selectedGroup.projectDeadline.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              {selectedGroup.flags > 0 && (
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      This group has {selectedGroup.flags} flag
                      {selectedGroup.flags !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowGroupDetailsModal(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Group Dialog */}
      <AlertDialog
        open={showSuspendGroupDialog}
        onOpenChange={setShowSuspendGroupDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend "{selectedGroup?.name}"? This
              action will make the group inactive and prevent new members from
              joining.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSuspendGroup}
              className="bg-destructive hover:bg-destructive/90"
            >
              Suspend Group
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
