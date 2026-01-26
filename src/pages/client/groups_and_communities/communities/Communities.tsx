import { useState, useRef, useCallback, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Search, Users, ArrowLeft, Filter, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getCommunities,
  getUserCommunities,
  getRecommendedCommunities,
  joinCommunity,
  leaveCommunity,
  createCommunity,
  CreateCommunityRequest,
} from "@/api/communities.api";
import { searchCommunities } from "@/api/search.api";
import { getDepartmentsPaginated, Department } from "@/api/departments.api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useDebounce } from "@/hooks/useDebounce";
import { DepartmentSelect } from "@/components/shared/DepartmentSelect";

type CommunityCategory =
  | "Academic"
  | "Level"
  | "Hostel"
  | "Department"
  | "Faculty";
type HubTab = "my" | "explore";

const categoryFilters: CommunityCategory[] = [
  "Academic",
  "Level",
  "Hostel",
  "Department",
  "Faculty",
];

const LEVEL_OPTIONS = [
  { value: 100, label: "100 Level" },
  { value: 200, label: "200 Level" },
  { value: 300, label: "300 Level" },
  { value: 400, label: "400 Level" },
  { value: 500, label: "500 Level" },
  { value: 600, label: "600 Level" },
  { value: 700, label: "700 Level" },
  { value: 800, label: "800 Level" },
];

interface CommunityFilters {
  category?: string;
  level?: number;
  levelAndBelow?: boolean;
  department?: string;
}

const Communities = () => {
  const [activeTab, setActiveTab] = useState<HubTab>("my");
  const [searchQuery, setSearchQuery] = useState("");

  const [pendingFilters, setPendingFilters] = useState<CommunityFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<CommunityFilters>({});
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const [departmentSearchQuery, setDepartmentSearchQuery] = useState("");
  const [departmentsPage, setDepartmentsPage] = useState(1);
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const debouncedDepartmentSearch = useDebounce(departmentSearchQuery, 400);
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newCommunity, setNewCommunity] = useState<CreateCommunityRequest>({
    name: "",
    description: "",
    category: "",
    is_public: true,
    cover_image: null,
    level: 0,
    department_id: "",
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const hasActiveFilters =
    !!appliedFilters.category ||
    !!appliedFilters.level ||
    !!appliedFilters.department ||
    !!searchQuery;

  const {
    data: departmentsData,
    isLoading: loadingDepartments,
    refetch: refetchDepartments,
  } = useQuery({
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

  const departments = departmentsData || [];

  const {
    data: myCommunities = [],
    isLoading: loadingMy,
    error: errorMy,
    isError: isErrorMy,
  } = useQuery({
    queryKey: ["my-communities"],
    queryFn: () => getUserCommunities({ page: 1, limit: 100 }),
    staleTime: 60000,
    retry: 2,
  });

  const {
    data: recommendedCommunitiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingRecommended,
    error: errorRecommended,
    isError: isErrorRecommended,
  } = useInfiniteQuery({
    queryKey: ["recommended-communities", appliedFilters],
    queryFn: ({ pageParam = 1 }) => {
      const params: any = { page: pageParam, limit: 20 };

      if (appliedFilters.level) {
        params.filter_level = appliedFilters.level;
        params.level_exact_match = !appliedFilters.levelAndBelow;
      }
      if (appliedFilters.department) {
        params.filter_department = appliedFilters.department;
      }
      if (appliedFilters.category) {
        params.category = appliedFilters.category;
      }

      return getRecommendedCommunities(params);
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 60000,
    initialPageParam: 1,
    retry: 2,
  });

  const recommendedCommunities =
    recommendedCommunitiesData?.pages.flatMap((page) => page) ?? [];

  const { data: searchResults = [], isLoading: loadingSearch } = useQuery({
    queryKey: ["search-communities", debouncedSearchQuery],
    queryFn: () =>
      searchCommunities({ query: debouncedSearchQuery, page: 1, limit: 50 }),
    enabled: debouncedSearchQuery.length > 0,
    staleTime: 30000,
  });

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastCommunityRef = useCallback(
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

  const isLoading = loadingRecommended || loadingMy || loadingSearch;

  const joinMutation = useMutation({
    mutationFn: (communityId: string) => joinCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Joined community successfully!");
    },
    onError: () => {
      toast.error("Failed to join community");
    },
  });

  const leaveMutation = useMutation({
    mutationFn: (communityId: string) => leaveCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Left community successfully!");
    },
    onError: () => {
      toast.error("Failed to leave community");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCommunityRequest) => createCommunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["my-communities"] });
      toast.success("Community created successfully!");
      setCreateModalOpen(false);
      setNewCommunity({
        name: "",
        description: "",
        category: "",
        is_public: true,
        cover_image: null,
      });
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.error?.message || "Failed to create community",
      );
    },
  });

  const getDisplayList = () => {
    if (activeTab === "my") {
      return debouncedSearchQuery.length > 0 ? searchResults : myCommunities;
    } else {
      return debouncedSearchQuery.length > 0
        ? searchResults
        : recommendedCommunities;
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
    }
  };

  const myCommunitiesIds = new Set(myCommunities.map((c) => c.id));

  const displayList = getDisplayList();

  const myCommunitiesList = activeTab === "my" ? displayList : myCommunities;

  const exploreCommunitiesList =
    activeTab === "explore"
      ? displayList.filter((c) => !myCommunitiesIds.has(c.id))
      : recommendedCommunities.filter((c) => !myCommunitiesIds.has(c.id));

  const handleJoinCommunity = (communityId: string, isJoined: boolean) => {
    if (isJoined) {
      leaveMutation.mutate(communityId);
    } else {
      joinMutation.mutate(communityId);
    }
  };

  const handleCreateCommunity = () => {
    if (!newCommunity.name.trim()) {
      toast.error("Community name is required");
      return;
    }
    if (!newCommunity.category) {
      toast.error("Category is required");
      return;
    }
    createMutation.mutate(newCommunity);
  };

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters);
    setFilterSheetOpen(false);
  };

  const handleResetFilters = () => {
    setPendingFilters({});
    setAppliedFilters({});
    setSearchQuery("");
    setSelectedDepartment(null);
    setDepartmentSearchQuery("");
    setDepartmentsPage(1);
    setFilterSheetOpen(false);
  };

  const removeFilter = (filterKey: keyof CommunityFilters) => {
    const newFilters = { ...appliedFilters };
    delete newFilters[filterKey];
    if (filterKey === "level") {
      delete newFilters.levelAndBelow;
    }
    if (filterKey === "department") {
      setSelectedDepartment(null);
    }
    setAppliedFilters(newFilters);
    setPendingFilters(newFilters);
  };

  const handleSelectDepartment = (dept: Department) => {
    setSelectedDepartment(dept);
    setPendingFilters((prev) => ({
      ...prev,
      department: dept.id,
    }));
    setDepartmentSearchQuery("");
    setDepartmentsPage(1);
  };

  const handleLoadMoreDepartments = () => {
    setDepartmentsPage((prev) => prev + 1);
  };

  useEffect(() => {
    setDepartmentsPage(1);
  }, [debouncedDepartmentSearch]);

  useEffect(() => {
    if (filterSheetOpen && pendingFilters.department && !selectedDepartment) {
      const dept = departments.find((d) => d.id === pendingFilters.department);
      if (dept) {
        setSelectedDepartment(dept);
      }
    }
  }, [
    filterSheetOpen,
    pendingFilters.department,
    selectedDepartment,
    departments,
  ]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
            </div>
          </div>
          <LoadingSpinner />
        </div>
      </AppLayout>
    );
  }

  if (isErrorRecommended || isErrorMy) {
    return (
      <AppLayout>
        <div className="border-r border-border h-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/hub")}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
            </div>
          </div>
          <div className="p-4 text-center">
            <p className="text-destructive mb-2">Error loading communities</p>
            <p className="text-sm text-muted-foreground">
              {(errorRecommended as any)?.message ||
                (errorMy as any)?.message ||
                "Failed to fetch communities"}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const CommunityCard = ({
    community,
    showJoinButton = false,
  }: {
    community: any;
    showJoinButton?: boolean;
  }) => {
    const isJoined = myCommunitiesIds.has(community.id);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className="flex items-center space-x-3 cursor-pointer flex-1"
              onClick={() => navigate(`/communities/${community.id}`)}
            >
              <Avatar className="h-14 w-14 rounded-sm">
                <AvatarImage src={community.avatar} alt={community.name} />
                <AvatarFallback className="h-14 w-14 rounded-sm">
                  {community.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">{community.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge variant="secondary">{community.category}</Badge>
                  {community.level && (
                    <Badge variant="outline" className="text-xs">
                      {community.level} Level
                    </Badge>
                  )}
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Users className="h-3 w-3 mr-1" />
                    {community.member_count?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            </div>
            {showJoinButton && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleJoinCommunity(community.id, isJoined);
                }}
                variant={isJoined ? "outline" : "default"}
                size="sm"
                disabled={joinMutation.isPending || leaveMutation.isPending}
              >
                {isJoined ? "Leave" : "Join"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {community.description || "No description available"}
          </p>
        </CardContent>
      </Card>
    );
  };

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
                <h1 className="text-xl font-bold text-foreground">
                  Communities
                </h1>
              </div>
              <Button
                onClick={() => setCreateModalOpen(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Create
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
              value="my"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              My Communities
            </TabsTrigger>
            <TabsTrigger
              value="explore"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent bg-transparent font-medium py-4"
            >
              Explore
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my" className="mt-0">
            <div className="p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search your communities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10 rounded-full"
                />
              </div>

              <div className="space-y-3">
                {myCommunitiesList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No communities found
                    </h3>
                    <p className="text-muted-foreground">
                      {myCommunities.length === 0
                        ? "You haven't joined any communities yet"
                        : "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  myCommunitiesList.map((community) => (
                    <CommunityCard
                      key={community.id}
                      community={community}
                      showJoinButton={false}
                    />
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="explore" className="mt-0">
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2 ">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search communities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleSearchKeyPress}
                    className="pl-10 rounded-full"
                  />
                </div>

                <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="outline"
                      className="hover:bg-app-hover px-3.5 text-app-text-main transition-colors border border-app-border rounded-full"
                      title="Filter communities"
                    >
                      <Filter className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    className="w-full sm:max-w-md overflow-y-auto"
                  >
                    <SheetHeader>
                      <SheetTitle>Filter Communities</SheetTitle>
                      <SheetDescription>
                        Refine your search with advanced filters
                      </SheetDescription>
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
                          value={pendingFilters.level?.toString() || ""}
                          onValueChange={(value) =>
                            setPendingFilters((prev) => ({
                              ...prev,
                              level: value ? parseInt(value) : undefined,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEVEL_OPTIONS.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value.toString()}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {pendingFilters.level && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="levelAndBelow"
                              checked={pendingFilters.levelAndBelow || false}
                              onCheckedChange={(checked) =>
                                setPendingFilters((prev) => ({
                                  ...prev,
                                  levelAndBelow: checked === true,
                                }))
                              }
                            />
                            <label
                              htmlFor="levelAndBelow"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              And below
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label>Department</Label>

                        {selectedDepartment && (
                          <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/50">
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {selectedDepartment.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {selectedDepartment.code}
                              </p>
                            </div>
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
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        )}

                        {!selectedDepartment && (
                          <>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                              <Input
                                placeholder="Search departments..."
                                value={departmentSearchQuery}
                                onChange={(e) =>
                                  setDepartmentSearchQuery(e.target.value)
                                }
                                className="pl-10"
                              />
                            </div>

                            <div className="border rounded-md max-h-[200px] overflow-y-auto">
                              {loadingDepartments ? (
                                <div className="flex justify-center p-4">
                                  <LoadingSpinner />
                                </div>
                              ) : departments.length === 0 ? (
                                <div className="p-4 text-center text-sm text-muted-foreground">
                                  {departmentSearchQuery
                                    ? "No departments found"
                                    : "No departments available"}
                                </div>
                              ) : (
                                <>
                                  {departments.map((dept) => (
                                    <button
                                      key={dept.id}
                                      onClick={() =>
                                        handleSelectDepartment(dept)
                                      }
                                      className="w-full text-left p-3 hover:bg-secondary transition-colors border-b last:border-b-0"
                                    >
                                      <p className="font-medium text-sm">
                                        {dept.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {dept.code}
                                      </p>
                                    </button>
                                  ))}

                                  {departments.length >=
                                    (departmentsPage === 1 &&
                                    !debouncedDepartmentSearch
                                      ? 3
                                      : 10) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="w-full"
                                      onClick={handleLoadMoreDepartments}
                                    >
                                      See more
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <SheetFooter className="gap-2 sm:gap-0">
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
              </div>

              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => setSearchQuery("")}
                      />
                    </Badge>
                  )}
                  {appliedFilters.category && (
                    <Badge variant="secondary" className="gap-1">
                      {appliedFilters.category}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFilter("category")}
                      />
                    </Badge>
                  )}
                  {appliedFilters.level && (
                    <Badge variant="secondary" className="gap-1">
                      {appliedFilters.level} Level
                      {appliedFilters.levelAndBelow && " & below"}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFilter("level")}
                      />
                    </Badge>
                  )}
                  {appliedFilters.department && selectedDepartment && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedDepartment.name}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFilter("department")}
                      />
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-3">
                {exploreCommunitiesList.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      No communities found
                    </h3>
                    <p className="text-muted-foreground">
                      {recommendedCommunities.length === 0
                        ? "No communities available to explore"
                        : "Try adjusting your search or filters"}
                    </p>
                  </div>
                ) : (
                  <>
                    {exploreCommunitiesList.map((community, index) => {
                      const isLastItem =
                        index === exploreCommunitiesList.length - 1;
                      return (
                        <div
                          key={community.id}
                          ref={isLastItem ? lastCommunityRef : null}
                        >
                          <CommunityCard
                            community={community}
                            showJoinButton={true}
                          />
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

        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Community</DialogTitle>
              <DialogDescription>
                Create a new community for campus activities and departments.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Community Name *</Label>
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
                <DepartmentSelect
                  value={newCommunity.department_id || ""}
                  onChange={(val) =>
                    setNewCommunity((prev) => ({ ...prev, department_id: val }))
                  }
                  label="Department (Optional)"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCommunity.description || ""}
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
                <Label htmlFor="category">Category *</Label>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={newCommunity.category}
                  onValueChange={(value) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      category: value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="level">Level</SelectItem>
                    <SelectItem value="hostel">Hostel</SelectItem>
                    <SelectItem value="faculty">Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              

              <div>
                <Label htmlFor="level">Level *</Label>
                <Select
                  value={newCommunity.level?.toString() || "0"}
                  onValueChange={(value) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      level: parseInt(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All Levels</SelectItem>
                    {[100, 200, 300, 400].map((lvl) => {
                      const userLevelNum = user?.level
                        ? parseInt(user.level)
                        : 0;
                      if (userLevelNum === 0 || lvl <= userLevelNum) {
                        return (
                          <SelectItem key={lvl} value={lvl.toString()}>
                            Level {lvl}
                          </SelectItem>
                        );
                      }
                      return null;
                    })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the minimum level required to join this community
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="is_public">Public Community</Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can join a public community
                  </p>
                </div>
                <Switch
                  id="is_public"
                  checked={newCommunity.is_public}
                  onCheckedChange={(checked) =>
                    setNewCommunity((prev) => ({
                      ...prev,
                      is_public: checked,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCommunity}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Community"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Communities;
