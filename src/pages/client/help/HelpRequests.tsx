import { useState, useMemo, useCallback } from "react";
import { Plus, Search, HelpCircle, List, Filter, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { HelpRequestCard } from "@/components/help_requests/HelpRequestCard";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useHelpRequests } from "@/hooks/useHelpRequests";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { toast } from "sonner";
import { getOrCreateDirectConversation } from "@/api/messaging.api";

interface HelpRequestFilters {
  type: string;
  level: string;
  levelAndBelow: boolean;
}

export default function HelpRequests() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"available" | "my-requests">(
    "available"
  );

  const [pendingFilters, setPendingFilters] = useState<HelpRequestFilters>({
    type: "all",
    level: "all",
    levelAndBelow: false,
  });

  const [appliedFilters, setAppliedFilters] = useState<HelpRequestFilters>({
    type: "all",
    level: "all",
    levelAndBelow: false,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const {
    requests: availableRequests,
    isLoading: loadingAvailable,
    isFetchingNextPage: fetchingNextAvailable,
    hasNextPage: hasNextAvailable,
    fetchNextPage: fetchNextAvailable,
    toggleVisibility,
    deleteRequest,
  } = useHelpRequests({
    tab: "available",
    filters: appliedFilters,
    enabled: !!user && activeTab === "available",
  });

  const {
    requests: myRequests,
    isLoading: loadingMy,
    isFetchingNextPage: fetchingNextMy,
    hasNextPage: hasNextMy,
    fetchNextPage: fetchNextMy,
    toggleVisibility: toggleMyVisibility,
    deleteRequest: deleteMyRequest,
  } = useHelpRequests({
    tab: "my-requests",
    enabled: !!user && activeTab === "my-requests",
  });

  const loading = loadingAvailable || loadingMy;
  const isFetchingNextPage =
    activeTab === "available" ? fetchingNextAvailable : fetchingNextMy;
  const hasNextPage = activeTab === "available" ? hasNextAvailable : hasNextMy;
  const fetchNextPage =
    activeTab === "available" ? fetchNextAvailable : fetchNextMy;

  const { loadMoreRef } = useInfiniteScroll({
    loading: isFetchingNextPage,
    hasMore: hasNextPage,
    onLoadMore: fetchNextPage,
  });

  const filteredAvailableRequests = useMemo(() => {
    if (!availableRequests) return [];
    if (!debouncedSearchQuery) return availableRequests;

    const searchLower = debouncedSearchQuery.toLowerCase();
    return availableRequests.filter(
      (request) =>
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.subject?.toLowerCase().includes(searchLower) ||
        request.owner_name?.toLowerCase().includes(searchLower)
    );
  }, [availableRequests, debouncedSearchQuery]);

  const filteredMyRequests = useMemo(() => {
    if (!myRequests) return [];
    if (!debouncedSearchQuery) return myRequests;

    const searchLower = debouncedSearchQuery.toLowerCase();
    return myRequests.filter(
      (request) =>
        request.title.toLowerCase().includes(searchLower) ||
        request.description.toLowerCase().includes(searchLower) ||
        request.subject?.toLowerCase().includes(searchLower) ||
        request.owner_name?.toLowerCase().includes(searchLower)
    );
  }, [myRequests, debouncedSearchQuery]);

  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setShowFilters(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      type: "all",
      level: "all",
      levelAndBelow: false,
    };
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
  };

  const hasActiveFilters =
    appliedFilters.type !== "all" ||
    appliedFilters.level !== "all" ||
    searchQuery !== "";

  const handleViewDetails = (id: string) => {
    navigate(`/help/${id}`);
  };

  const handleRequestHelp = () => {
    navigate("/help/new");
  };

  const handleOfferHelp = async (id: string) => {
    const request = availableRequests.find((r) => r.id === id);
    if (!request || !request.owner_id) {
      toast.error("Could not find help request owner");
      return;
    }

    try {
      const response = await getOrCreateDirectConversation(request.owner_id);
      navigate(`/messages/${response.conversation_id}`);
    } catch (error: any) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation");
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/help/edit/${id}`);
  };

  const handleToggleVisibility = (id: string) => {
    toggleMyVisibility(id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this help request?")) {
      deleteMyRequest(id);
    }
  };

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 max-w-7xl mx-auto custom-fonts">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">Help Requests</h1>
              <p className="text-muted-foreground mt-1">
                Connect with peers who can help or request help from others
              </p>
            </div>
            <Button variant="outline" onClick={handleRequestHelp}>
              <Plus className="h-4 w-4" />
              <span className="hidden md:block ml-2">Request Help</span>
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search help requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Button
              variant="outline"
              className="relative"
              onClick={() => setShowFilters(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                  !
                </span>
              )}
            </Button>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => setSearchQuery("")}
                  />
                </Badge>
              )}
              {appliedFilters.type !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Type: {appliedFilters.type}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAppliedFilters((prev) => ({ ...prev, type: "all" }))
                    }
                  />
                </Badge>
              )}
              {appliedFilters.level !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Level: {appliedFilters.level}
                  {appliedFilters.levelAndBelow ? " and below" : ""}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() =>
                      setAppliedFilters((prev) => ({
                        ...prev,
                        level: "all",
                        levelAndBelow: false,
                      }))
                    }
                  />
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <Tabs
          defaultValue="available"
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "available" | "my-requests")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available">
              Available Help
            </TabsTrigger>
            <TabsTrigger value="my-requests">
              My Requests
            </TabsTrigger>
          </TabsList>

          {/* Available Help Tab */}
          <TabsContent value="available" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredAvailableRequests.length === 0 ? (
              <div className="text-center py-12">
                <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No help requests found
                </h3>
                <p className="text-muted-foreground">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Be the first to request help!"}
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAvailableRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      helpRequest={request}
                      onViewDetails={handleViewDetails}
                      onHelp={handleOfferHelp}
                      showActions="help"
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasNextAvailable && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {fetchingNextAvailable && <LoadingSpinner size="md" />}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="mt-6">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredMyRequests.length === 0 ? (
              <div className="text-center py-12">
                <List className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't requested any help yet
                </p>
                <Button onClick={handleRequestHelp}>
                  <Plus className="h-4 w-4 mr-2" />
                  Request Help
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredMyRequests.map((request) => (
                    <HelpRequestCard
                      key={request.id}
                      helpRequest={request}
                      onViewDetails={handleViewDetails}
                      onEdit={handleEdit}
                      onToggleVisibility={handleToggleVisibility}
                      onDelete={handleDelete}
                      showActions="owner"
                    />
                  ))}
                </div>

                {/* Infinite Scroll Trigger */}
                {hasNextMy && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {fetchingNextMy && <LoadingSpinner size="md" />}
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Filter Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Filter Help Requests</SheetTitle>
            <SheetDescription>
              Refine your search with these filters
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select
                value={pendingFilters.type}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="course">Course Work</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Level Filter */}
            <div className="space-y-2">
              <Label>Level</Label>
              <Select
                value={pendingFilters.level}
                onValueChange={(value) =>
                  setPendingFilters((prev) => ({ ...prev, level: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="My Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">My Level (default)</SelectItem>
                  <SelectItem value="100">Level 100</SelectItem>
                  <SelectItem value="200">Level 200</SelectItem>
                  <SelectItem value="300">Level 300</SelectItem>
                  <SelectItem value="400">Level 400</SelectItem>
                  <SelectItem value="500">Level 500</SelectItem>
                  <SelectItem value="600">Level 600</SelectItem>
                  <SelectItem value="700">Level 700</SelectItem>
                  <SelectItem value="800">Level 800</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* And Below Toggle */}
            {pendingFilters.level !== "all" && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="levelAndBelow"
                  checked={pendingFilters.levelAndBelow}
                  onChange={(e) =>
                    setPendingFilters((prev) => ({
                      ...prev,
                      levelAndBelow: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="levelAndBelow" className="cursor-pointer">
                  And Below
                </Label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="flex-1"
              >
                Reset
              </Button>
              <Button onClick={applyFilters} className="flex-1">
                Apply
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </AppLayout>
  );
}
