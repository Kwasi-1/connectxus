import { useState, useRef, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, Lock, Plus, ArrowLeft, Filter, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GroupCategory } from "@/types/communities";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getUserGroups,
  getRecommendedGroups,
  joinGroup,
  leaveGroup,
  createJoinRequest,
  createGroup,
  Group as ApiGroup,
} from "@/api/groups.api";
import { searchGroups } from "@/api/search.api";
import { toast } from "sonner";
import { CreateGroupModal } from "@/components/groups/CreateGroupModal";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { getDepartmentsPaginated, Department } from "@/api/departments.api";
import { useAuth } from "@/contexts/AuthContext";
import { useDebounce } from "@/hooks/useDebounce";

const categoryFilters: GroupCategory[] = [
  "Study Group",
  "Sports",
  "Arts",
  "Professional",
  "Academic",
  "Social",
  "Other",
];

const levelOptions = [
  { value: "100", label: "100 Level" },
  { value: "200", label: "200 Level" },
  { value: "300", label: "300 Level" },
  { value: "400", label: "400 Level" },
  { value: "500", label: "500 Level" },
  { value: "600", label: "600 Level" },
  { value: "700", label: "700 Level" },
  { value: "800", label: "800 Level" },
];

const groupTypeOptions = [
  { value: "project", label: "Project" },
  { value: "study", label: "Study" },
  { value: "social", label: "Social" },
];

type HubTab = "my-groups" | "explore-groups";

interface FilterState {
  category?: string;
  level?: number;
  levelIncludeBelow?: boolean;
  department?: string;
  groupType?: string;
}

const GroupsNew = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("my-groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [pendingFilters, setPendingFilters] = useState<FilterState>({});
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({});

  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [departmentsPage, setDepartmentsPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const debouncedDepartmentSearch = useDebounce(departmentSearchQuery, 400);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userGroups = [], isLoading: loadingUserGroups } = useQuery({
    queryKey: ["user-groups"],
    queryFn: () => getUserGroups({ page: 1, limit: 100 }),
    staleTime: 60000,
  });

  const { data: departmentsData, isLoading: loadingDepartments } = useQuery({
    queryKey: [
      "departments-filter",
      debouncedDepartmentSearch,
      departmentsPage,
    ],
    queryFn: () =>
      getDepartmentsPaginated({
        query: debouncedDepartmentSearch,
        page: departmentsPage,
        limit: departmentsPage === 1 && !debouncedDepartmentSearch ? 3 : 10,
      }),
    enabled: filterSheetOpen,
    staleTime: 300000,
  });

  const {
    data: recommendedGroupsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingRecommendedGroups,
  } = useInfiniteQuery({
    queryKey: ["recommended-groups", appliedFilters],
    queryFn: ({ pageParam = 1 }) => {
      const params: any = {
        page: pageParam,
        limit: 20,
      };

      if (appliedFilters.category) {
        params.category = appliedFilters.category;
      }
      if (appliedFilters.level) {
        params.filter_level = appliedFilters.level;
        params.level_exact_match = !appliedFilters.levelIncludeBelow;
      }
      if (appliedFilters.department) {
        params.filter_department = appliedFilters.department;
      }
      if (appliedFilters.groupType) {
        params.filter_group_type = appliedFilters.groupType;
      }

      return getRecommendedGroups(params);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 60000,
    initialPageParam: 1,
    retry: 2,
  });

  const recommendedGroups =
    recommendedGroupsData?.pages.flatMap((page) => page) ?? [];

  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ["search-groups", debouncedSearchQuery],
    queryFn: () =>
      searchGroups({ query: debouncedSearchQuery, page: 1, limit: 50 }),
    enabled: debouncedSearchQuery.length > 0,
    staleTime: 30000,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastGroupRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage],
  );

  const isLoading =
    loadingUserGroups || loadingRecommendedGroups || loadingSearch;

  const joinGroupMutation = useMutation({
    mutationFn: (groupId: string) => joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-groups"] });
      toast.success("Successfully joined the group!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to join group");
    },
  });

  const leaveGroupMutation = useMutation({
    mutationFn: (groupId: string) => leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-groups"] });
      toast.success("Successfully left the group!");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to leave group");
    },
  });

  const joinRequestMutation = useMutation({
    mutationFn: (groupId: string) => createJoinRequest(groupId, {}),
    onSuccess: () => {
      toast.success("Join request sent successfully!");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error || "Failed to send join request",
      );
    },
  });

  const createGroupMutation = useMutation({
    mutationFn: (data: any) => createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-groups"] });
      queryClient.invalidateQueries({ queryKey: ["recommended-groups"] });
      toast.success("Group created successfully!");
      setIsCreateModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to create group");
    },
  });

  const getDisplayList = () => {
    if (activeTab === "my-groups") {
      return debouncedSearchQuery.length > 0 ? searchResults : userGroups;
    } else {
      return debouncedSearchQuery.length > 0
        ? searchResults
        : recommendedGroups;
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
    }
  };

  const myGroupsIds = new Set(userGroups.map((g) => g.id));
  const displayList = getDisplayList();

  const myGroups = activeTab === "my-groups" ? displayList : userGroups;
  const exploreGroups =
    activeTab === "explore"
      ? displayList.filter((g) => !myGroupsIds.has(g.id))
      : recommendedGroups.filter((g) => !myGroupsIds.has(g.id));

  const handleApplyFilters = () => {
    setAppliedFilters({ ...pendingFilters });
    setFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setPendingFilters({});
    setSelectedDepartment(null);
    setDepartmentSearchQuery("");
    setDepartmentsPage(1);
  };

  const handleClearAllFilters = () => {
    setPendingFilters({});
    setAppliedFilters({});
    setSelectedDepartment(null);
    setDepartmentSearchQuery("");
    setDepartmentsPage(1);
  };

  const handleRemoveFilter = (filterKey: keyof FilterState) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    if (filterKey === "levelIncludeBelow") {
      delete newFilters.levelIncludeBelow;
    }
    if (filterKey === "department") {
      setSelectedDepartment(null);
    }
    setAppliedFilters(newFilters);
    setPendingFilters(newFilters);
  };

  const handleDepartmentSelect = (department: Department) => {
    setSelectedDepartment(department);
    setPendingFilters((prev) => ({
      ...prev,
      department: department.id,
    }));
    setDepartmentSearchQuery("");
    setDepartmentsPage(1);
  };

  const handleLoadMoreDepartments = () => {
    setDepartmentsPage((prev) => prev + 1);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (appliedFilters.category) count++;
    if (appliedFilters.level) count++;
    if (appliedFilters.department) count++;
    if (appliedFilters.groupType) count++;
    return count;
  };

  const handleJoinGroup = (groupId: string, groupType: string) => {
    if (groupType === "private") {
      joinRequestMutation.mutate(groupId);
    } else {
      joinGroupMutation.mutate(groupId);
    }
  };

  const handleLeaveGroup = (groupId: string) => {
    leaveGroupMutation.mutate(groupId);
  };

  const handleCreateGroup = (groupData: any) => {
    const apiData = {
      name: groupData.name,
      description: groupData.description,
      category: groupData.category,
      group_type: groupData.groupType,
      avatar_file_id: groupData.avatar_file_id,
      tags: groupData.tags,
      level: groupData.level,
      allow_invites: groupData.groupType !== "private",
      allow_member_posts: true,
      department_id: groupData.department_id || undefined,
      ...(groupData.groupType === "project" &&
        groupData.projectRoles && {
          roles: groupData.projectRoles.map((role: any) => ({
            name: role.name,
            description: role.description,
            slots_total: role.slots,
          })),
        }),
    };

    createGroupMutation.mutate(apiData);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-16 lg:top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/hub")}
                    className="p-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h1 className="text-xl font-bold text-foreground">Groups</h1>
                </div>
              </div>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  const GroupCard = ({
    group,
    showJoinButton = false,
  }: {
    group: ApiGroup;
    showJoinButton?: boolean;
  }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer flex-1"
            onClick={() => navigate(`/groups/${group.id}`)}
          >
            <Avatar className="h-14 w-14 rounded-sm">
              <AvatarImage src={group.avatar || undefined} alt={group.name} />
              <AvatarFallback className="h-14 w-14 rounded-sm">
                {group.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {group.name}
                {group.group_type === "private" && (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">{group.category}</Badge>
                <span className="text-sm text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {group.member_count}
                </span>
              </div>
            </div>
          </div>
          {showJoinButton && (
            <>
              {(group.group_type === "public" || group.is_member) && (
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (group.is_member) {
                      handleLeaveGroup(group.id);
                    } else {
                      handleJoinGroup(group.id, group.group_type);
                    }
                  }}
                  variant={group.is_member ? "outline" : "default"}
                  size="sm"
                  disabled={
                    joinGroupMutation.isPending ||
                    leaveGroupMutation.isPending ||
                    joinRequestMutation.isPending
                  }
                >
                  {group.is_member ? "Leave" : "Join"}
                </Button>
              )}
              {!group.is_member &&
                (group.group_type === "private" ||
                  group.group_type === "project") && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/groups/${group.id}`);
                    }}
                    variant="default"
                    size="sm"
                  >
                    View Details
                  </Button>
                )}
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm line-clamp-2">
          {group.description || "No description available"}
        </p>
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {group.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <div className="border-r border-border h-full">
        <div className="sticky top-16 lg:top-0 z-10 bg-background/90 backdrop-blur-md border-border">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">Groups</h1>
              </div>
              <Button
                className="bg-foreground hover:bg-foreground/90 text-background"
                onClick={() => setIsCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden mdblock ml-2">Create Group</span>
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as HubTab)}
        >
          <TabsList className="w-full justify-start rounded-none h-auto bg-transparent border-b pb-0">
            <TabsTrigger
              value="my-groups"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              My Groups
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-groups" className="mt-0">
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your groups..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10 rounded-full"
                />
              </div>

              <div className="space-y-3">
                {myGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No groups found
                    </h3>
                    <p className="text-muted-foreground">
                      {userGroups.length === 0
                        ? "You haven't joined any groups yet"
                        : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  myGroups.map((group) => (
                    <GroupCard key={group.id} group={group} />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search groups..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 rounded-full"
                  />
                </div>

                <Button
                  variant="outline"
                  className="hover:bg-app-hover px-3.5 text-app-text-main transition-colors border border-app-border rounded-full relative"
                  onClick={() => setFilterSheetOpen(true)}
                  title="Filter groups"
                >
                  <Filter className="h-5 w-5" />
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </Button>
              </div>

              {getActiveFilterCount() > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">
                    Filters:
                  </span>
                  {appliedFilters.category && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveFilter("category")}
                    >
                      {appliedFilters.category}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {appliedFilters.level && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveFilter("level")}
                    >
                      {appliedFilters.level} Level
                      {appliedFilters.levelIncludeBelow ? " & Below" : ""}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {appliedFilters.groupType && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveFilter("groupType")}
                    >
                      {
                        groupTypeOptions.find(
                          (opt) => opt.value === appliedFilters.groupType,
                        )?.label
                      }
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  {appliedFilters.department && selectedDepartment && (
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => handleRemoveFilter("department")}
                    >
                      {selectedDepartment.name}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="h-6 text-xs"
                  >
                    Clear all
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {exploreGroups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No groups found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search or filters
                    </p>
                  </div>
                ) : (
                  <>
                    {exploreGroups.map((group, index) => {
                      const isLastItem = index === exploreGroups.length - 1;
                      return (
                        <div
                          key={group.id}
                          ref={isLastItem ? lastGroupRef : null}
                        >
                          <GroupCard group={group} showJoinButton={true} />
                        </div>
                      );
                    })}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Filter Groups</SheetTitle>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label>Category</Label>
              <Select
                value={pendingFilters.category || "all"}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    category: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categoryFilters.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Level</Label>
              <Select
                value={pendingFilters.level?.toString() || "all"}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    level: value === "all" ? undefined : parseInt(value),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  {levelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {pendingFilters.level && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="level-below"
                    checked={pendingFilters.levelIncludeBelow || false}
                    onCheckedChange={(checked) =>
                      setPendingFilters((prev) => ({
                        ...prev,
                        levelIncludeBelow: checked === true,
                      }))
                    }
                  />
                  <label
                    htmlFor="level-below"
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Include {pendingFilters.level} and below
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Label>Group Type</Label>
              <Select
                value={pendingFilters.groupType || "all"}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({
                    ...prev,
                    groupType: value === "all" ? undefined : value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {groupTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Department</Label>

              {selectedDepartment ? (
                <div className="flex items-center justify-between p-3 border rounded-md bg-muted/50">
                  <span className="text-sm font-medium">
                    {selectedDepartment.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartment(null);
                      setPendingFilters((prev) => {
                        const newFilters = { ...prev };
                        delete newFilters.department;
                        return newFilters;
                      });
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search departments..."
                      value={departmentSearchQuery}
                      onChange={(e) => {
                        setDepartmentSearchQuery(e.target.value);
                        setDepartmentsPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>

                  <div className="border rounded-md max-h-[200px] overflow-y-auto">
                    {loadingDepartments ? (
                      <div className="flex items-center justify-center p-4">
                        <LoadingSpinner />
                      </div>
                    ) : departmentsData && departmentsData.length > 0 ? (
                      <>
                        {departmentsData.map((dept) => (
                          <div
                            key={dept.id}
                            className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                            onClick={() => handleDepartmentSelect(dept)}
                          >
                            <div className="font-medium text-sm">
                              {dept.name}
                            </div>
                            {dept.code && (
                              <div className="text-xs text-muted-foreground">
                                {dept.code}
                              </div>
                            )}
                          </div>
                        ))}

                        {departmentsData.length >=
                          (departmentsPage === 1 && !debouncedDepartmentSearch
                            ? 3
                            : 10) && (
                          <Button
                            variant="ghost"
                            className="w-full text-sm text-primary"
                            onClick={handleLoadMoreDepartments}
                            disabled={loadingDepartments}
                          >
                            See more
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {departmentSearchQuery
                          ? "No departments found"
                          : "Start typing to search"}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <SheetFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleResetFilters}
              className="flex-1"
            >
              Reset
            </Button>
            <Button onClick={handleApplyFilters} className="flex-1">
              Apply Filters
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <CreateGroupModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateGroup={handleCreateGroup}
      />
    </AppLayout>
  );
};

export default GroupsNew;
