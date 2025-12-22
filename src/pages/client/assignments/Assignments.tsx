import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Plus, Briefcase, Inbox, ListChecks, DollarSign, BookOpen, Edit, User, Calendar, Search, Filter, X } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { ApplicationCard } from "@/components/assignments/ApplicationCard";
import { AccountModal } from "@/components/assignments/AccountModal";
import {
  getAvailableAssignments,
  getMyAssignments,
  getMyApplications,
  getUserEarnings,
  getMyAccountDetails,
} from "@/api/assignments.api";
import type {
  Assignment,
  Application,
  Earnings,
  AccountDetail,
} from "@/types/assignments";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";


interface AssignmentFilters {
  subjectType: string;
  minPrice: number;
  maxPrice: number;
  level: string;
}

const ITEMS_PER_PAGE = 20;
const MAX_PRICE = 100000; 

export default function Assignments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  
  const [pendingFilters, setPendingFilters] = useState<AssignmentFilters>({
    subjectType: "all",
    minPrice: 0,
    maxPrice: MAX_PRICE,
    level: "all",
  });

  
  const [appliedFilters, setAppliedFilters] = useState<AssignmentFilters>({
    subjectType: "all",
    minPrice: 0,
    maxPrice: MAX_PRICE,
    level: "all",
  });

  
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  
  const [availableAssignments, setAvailableAssignments] = useState<Assignment[]>([]);
  const [myAssignments, setMyAssignments] = useState<Assignment[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [earnings, setEarnings] = useState<Earnings | null>(null);
  const [accounts, setAccounts] = useState<AccountDetail[]>([]);

  
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<AccountDetail | undefined>();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  
  const filterAssignments = useCallback(
    (assignments: Assignment[]): Assignment[] => {
      return assignments.filter((assignment) => {
        
        const searchLower = debouncedSearchQuery.toLowerCase();
        const matchesSearch =
          !debouncedSearchQuery ||
          assignment.title.toLowerCase().includes(searchLower) ||
          assignment.description.toLowerCase().includes(searchLower) ||
          assignment.subject_type?.toLowerCase().includes(searchLower) ||
          assignment.owner_name?.toLowerCase().includes(searchLower) ||
          assignment.owner_username?.toLowerCase().includes(searchLower);

        
        const matchesSubject =
          appliedFilters.subjectType === "all" ||
          assignment.subject_type === appliedFilters.subjectType;

        
        const price = parseFloat(String(assignment.price || 0));
        const matchesPrice =
          price >= appliedFilters.minPrice &&
          price <= appliedFilters.maxPrice;

        
        const matchesLevel =
          appliedFilters.level === "all" || assignment.level === appliedFilters.level;

        return (
          matchesSearch &&
          matchesSubject &&
          matchesPrice &&
          matchesLevel
        );
      });
    },
    [debouncedSearchQuery, appliedFilters]
  );

  
  const loadAvailableAssignments = async (page: number = 1, append: boolean = false) => {
    if (!user) return;

    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    
    abortControllerRef.current = new AbortController();

    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setSeenIds(new Set());
        setCurrentPage(1);
      }

      const offset = (page - 1) * ITEMS_PER_PAGE;

      
      
      const params: any = {
        limit: ITEMS_PER_PAGE * 2, 
        offset,
      };

      
      if (appliedFilters.subjectType !== "all") {
        params.subject_type = appliedFilters.subjectType;
      }
      if (appliedFilters.minPrice !== 0 || appliedFilters.maxPrice !== MAX_PRICE) {
        params.min_price = appliedFilters.minPrice;
        params.max_price = appliedFilters.maxPrice;
      }
      if (appliedFilters.level !== "all") {
        params.filter_level = appliedFilters.level;
      }

      const response = await getAvailableAssignments(params);

      let newAssignments = response.assignments || [];

      console.log("Raw assignments from backend:", newAssignments);
      console.log("Number of assignments fetched:", newAssignments.length);

      
      newAssignments = shuffleArray(newAssignments);

      
      if (append) {
        const uniqueNewAssignments = newAssignments.filter(a => !seenIds.has(a.id));
        console.log("Unique new assignments after deduplication:", uniqueNewAssignments.length);
        setAvailableAssignments((prev) => [...prev, ...uniqueNewAssignments]);

        
        const newIds = uniqueNewAssignments.map((a) => a.id);
        setSeenIds((prev) => new Set([...prev, ...newIds]));
      } else {
        
        setAvailableAssignments(newAssignments);
        const newIds = newAssignments.map((a) => a.id);
        setSeenIds(new Set(newIds));
      }

      console.log("Total assignments in state:", append ? "appended" : newAssignments.length);

      
      setHasMore(newAssignments.length >= ITEMS_PER_PAGE);
    } catch (error: any) {
      if (error.name !== "AbortError" && error.name !== "CanceledError") {
        toast.error(error.response?.data?.error?.message || "Failed to load assignments");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMoreAssignments = useCallback(() => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      loadAvailableAssignments(nextPage, true);
    }
  }, [currentPage, loadingMore, hasMore]);

  
  const { loadMoreRef } = useInfiniteScroll({
    loading: loadingMore,
    hasMore,
    onLoadMore: loadMoreAssignments,
  });

  const loadMyAssignments = async () => {
    if (!user) return;
    try {
      const response = await getMyAssignments();
      setMyAssignments(response.assignments || []);
    } catch (error: any) {
      console.error("Failed to load my assignments:", error);
    }
  };

  const loadMyApplications = async () => {
    if (!user) return;
    try {
      const response = await getMyApplications();
      setMyApplications(response.applications || []);
    } catch (error: any) {
      console.error("Failed to load applications:", error);
    }
  };

  const loadMonetizationData = async () => {
    if (!user) return;
    try {
      const [earningsData, accountsData] = await Promise.all([
        getUserEarnings(),
        getMyAccountDetails(),
      ]);
      setEarnings(earningsData);
      const accountsList = accountsData.accounts || [];
      setAccounts(accountsList);
      if (accountsList.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accountsList[0].id);
      }
    } catch (error: any) {
      console.error("Failed to load monetization data:", error);
    }
  };

  
  const applyFilters = () => {
    setAppliedFilters(pendingFilters);
    setShowFilters(false);
  };

  
  useEffect(() => {
    loadAvailableAssignments();
  }, [debouncedSearchQuery, appliedFilters]);

  
  useEffect(() => {
    loadAvailableAssignments();
    loadMyAssignments();
    loadMyApplications();
    loadMonetizationData();
  }, [user]);

  
  const filteredAssignments = useMemo(() => {
    console.log("Filtering assignments. Total before filter:", availableAssignments.length);
    console.log("Applied filters:", appliedFilters);
    console.log("Search query:", debouncedSearchQuery);
    const filtered = filterAssignments(availableAssignments);
    console.log("Filtered assignments count:", filtered.length);
    console.log("Filtered assignments:", filtered);
    return filtered;
  }, [availableAssignments, filterAssignments]);

  const handleViewAssignmentDetails = (id: string) => {
    navigate(`/assignments/${id}`);
  };

  const handlePostAssignment = () => {
    navigate("/assignments/new");
  };

  const resetFilters = () => {
    const defaultFilters = {
      subjectType: "all",
      minPrice: 0,
      maxPrice: MAX_PRICE,
      level: "all",
    };
    setPendingFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setSearchQuery("");
  };

  const hasActiveFilters =
    appliedFilters.subjectType !== "all" ||
    appliedFilters.level !== "all" ||
    appliedFilters.minPrice !== 0 ||
    appliedFilters.maxPrice !== MAX_PRICE ||
    searchQuery !== "";

  const hasMyAssignments = myAssignments.length > 0;
  const hasDoingApplications = myApplications.length > 0;
  const hasCompletedPaid = myApplications.filter(
    (app) => app.status === "completed" && app.payment_status === "paid"
  ).length > 0;

  return (
    <AppLayout showRightSidebar={false}>
      <div className="p-6 space-y-6 custom-fonts">
        
        <div className="flex justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Assignments</h1>
            <p className="text-muted-foreground mt-1">
              Find help or help others with assignments
            </p>
          </div>
          <Button variant="outline" onClick={handlePostAssignment}>
            <Plus className="h-4 w-4" />
            <span className="hidden md:block ml-2">Post Assignment</span>
          </Button>
        </div>

        
        <Tabs defaultValue="browse" className="w-full">
          {(() => {
            let visibleTabs = 1;
            if (hasMyAssignments) visibleTabs++;
            if (hasDoingApplications) visibleTabs++;
            if (hasCompletedPaid) visibleTabs++;

            return (
              <TabsList className={`grid w-full grid-cols-${Math.min(visibleTabs, 4)}`}>
                <TabsTrigger value="browse">
                  <Briefcase className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Browse</span>
                  {filteredAssignments.length > 0 && (
                    <span className="ml-2 text-xs">({filteredAssignments.length})</span>
                  )}
                </TabsTrigger>

                {hasMyAssignments && (
                  <TabsTrigger value="my-assignments">
                    <Inbox className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">My Assignments</span>
                    {myAssignments.length > 0 && (
                      <span className="ml-2 text-xs">({myAssignments.length})</span>
                    )}
                  </TabsTrigger>
                )}

                {hasDoingApplications && (
                  <TabsTrigger value="my-applications">
                    <ListChecks className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Doing</span>
                    {myApplications.length > 0 && (
                      <span className="ml-2 text-xs">({myApplications.length})</span>
                    )}
                  </TabsTrigger>
                )}

                {hasCompletedPaid && (
                  <TabsTrigger value="monetization">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Earnings</span>
                  </TabsTrigger>
                )}
              </TabsList>
            );
          })()}

          
          <TabsContent value="browse" className="space-y-4">
            
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by title, description, subject, or creator..."
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

              
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                    {hasActiveFilters && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] flex items-center justify-center text-primary-foreground">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Assignments</SheetTitle>
                    <SheetDescription>
                      Refine your search with these filters
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-6 space-y-6">
                    
                    <div className="space-y-2">
                      <Label>Subject / Course</Label>
                      <Select
                        value={pendingFilters.subjectType}
                        onValueChange={(value) =>
                          setPendingFilters((prev) => ({ ...prev, subjectType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="Subject">Subject</SelectItem>
                          <SelectItem value="Course">Course</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    
                    <div className="space-y-2">
                      <Label>Level</Label>
                      <Select
                        value={pendingFilters.level}
                        onValueChange={(value) =>
                          setPendingFilters((prev) => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="100">Level 100</SelectItem>
                          <SelectItem value="200">Level 200</SelectItem>
                          <SelectItem value="300">Level 300</SelectItem>
                          <SelectItem value="400">Level 400</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    
                    <div className="space-y-3">
                      <Label>
                        Price Range (GHS {pendingFilters.minPrice} - GHS {pendingFilters.maxPrice})
                      </Label>
                      <Slider
                        min={0}
                        max={MAX_PRICE}
                        step={10}
                        value={[pendingFilters.minPrice, pendingFilters.maxPrice]}
                        onValueChange={([min, max]) =>
                          setPendingFilters((prev) => ({ ...prev, minPrice: min, maxPrice: max }))
                        }
                        className="w-full"
                      />
                    </div>

                    
                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={resetFilters}
                        className="flex-1"
                      >
                        Reset
                      </Button>
                      <Button
                        onClick={applyFilters}
                        className="flex-1"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            
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
                {appliedFilters.subjectType !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Subject: {appliedFilters.subjectType}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({ ...prev, subjectType: "all" }))
                      }
                    />
                  </Badge>
                )}
                {appliedFilters.level !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Level: {appliedFilters.level}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({ ...prev, level: "all" }))
                      }
                    />
                  </Badge>
                )}
                {(appliedFilters.minPrice !== 0 || appliedFilters.maxPrice !== MAX_PRICE) && (
                  <Badge variant="secondary" className="gap-1">
                    Price: GHS {appliedFilters.minPrice} - GHS {appliedFilters.maxPrice}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        setAppliedFilters((prev) => ({
                          ...prev,
                          minPrice: 0,
                          maxPrice: MAX_PRICE,
                        }))
                      }
                    />
                  </Badge>
                )}
              </div>
            )}

            
            {loading ? (
              <LoadingSpinner size="md" />
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assignments found</h3>
                <p className="text-muted-foreground mb-4">
                  {hasActiveFilters
                    ? "Try adjusting your search or filters"
                    : "Check back later for new assignment opportunities"}
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={resetFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredAssignments.map((assignment) => (
                    <AssignmentCard
                      key={assignment.id}
                      assignment={assignment}
                      onViewDetails={handleViewAssignmentDetails}
                    />
                  ))}
                </div>

                
                {hasMore && (
                  <div ref={loadMoreRef} className="py-4 text-center">
                    {loadingMore && <LoadingSpinner size="sm" />}
                  </div>
                )}

                {!hasMore && filteredAssignments.length > 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    You've reached the end
                  </div>
                )}
              </>
            )}
          </TabsContent>

          
          <TabsContent value="my-assignments" className="space-y-4">
            {myAssignments.length === 0 ? (
              <div className="text-center py-12">
                <Inbox className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't posted any assignments
                </p>
                <Button onClick={handlePostAssignment}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post Your First Assignment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    showApplicationCount={true}
                    onViewDetails={handleViewAssignmentDetails}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          
          <TabsContent value="my-applications" className="space-y-4">
            {myApplications.length === 0 ? (
              <div className="text-center py-12">
                <ListChecks className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No applications yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't applied to any assignments
                </p>
                <Button variant="outline" onClick={() => navigate("/assignments")}>
                  Browse Assignments
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {myApplications.map((application) => (
                  <ApplicationCard
                    key={application.id}
                    application={application}
                    onViewDetails={() =>
                      navigate(`/assignments/applications/${application.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          
          {hasCompletedPaid && (
            <TabsContent value="monetization" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4">Earnings & Payouts</h2>

                
                {!earnings ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="md" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6">
                        <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
                          Total Earnings
                        </div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          GHS {Number(earnings.total_earnings).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {earnings.total_completed} completed
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
                        <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-2">
                          Credited Earnings
                        </div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          GHS {Number(earnings.credited_earnings).toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium mb-2">
                          Pending Earnings
                        </div>
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          GHS {Number(earnings.pending_earnings).toFixed(2)}
                        </div>
                      </div>
                    </div>

                    
                    <Card className="mb-8">
                      <CardHeader>
                        <CardTitle>All Earnings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {myApplications.filter(app => app.status === 'completed' && app.payment_status === 'paid').length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No earnings yet
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myApplications
                              .filter(app => app.status === 'completed' && app.payment_status === 'paid')
                              .map((app) => (
                                <div
                                  key={app.id}
                                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium mb-1">
                                      {app.assignment_title || 'Assignment'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                      <User className="h-3 w-3" />
                                      <span>{app.owner_name || app.owner_username}</span>
                                    </div>
                                    {app.submitted_at && (
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(app.submitted_at), "MMM dd, yyyy")}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg mb-1">
                                      GHS {Number(app.assignment_price || 0).toFixed(2)}
                                    </div>
                                    <div className="flex gap-2">
                                      <Badge variant="default">
                                        {app.money_credited ? 'Credited' : 'Pending'}
                                      </Badge>
                                      {app.rating && (
                                        <Badge variant="outline">
                                          ⭐ {app.rating}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}

                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Payout Accounts</h3>

                  {accounts.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground mb-4">
                        No payout accounts configured
                      </p>
                      <Button
                        onClick={() => {
                          setSelectedAccountForEdit(undefined);
                          setShowAccountModal(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Account
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accounts.length === 2 && (
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Select Account to Update
                          </label>
                          <Select
                            value={selectedAccountId}
                            onValueChange={setSelectedAccountId}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.account_name} ({account.account_type === "mobile_money" ? "Mobile Money" : "Bank"})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {accounts.map((account) => (
                        <div
                          key={account.id}
                          className={`border rounded-lg p-4 ${
                            accounts.length === 1 || account.id === selectedAccountId
                              ? "block"
                              : "hidden"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium mb-1">
                                {account.account_name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {account.account_type.replace("_", " ").toUpperCase()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {account.account_number}
                              </div>
                              {account.mobile_money_network && (
                                <div className="text-sm text-muted-foreground">
                                  Network: {account.mobile_money_network}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {account.payout_requested && (
                                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                                  Payout Requested
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            if (accounts.length === 1) {
                              setSelectedAccountForEdit(accounts[0]);
                            } else {
                              const selected = accounts.find(acc => acc.id === selectedAccountId);
                              setSelectedAccountForEdit(selected);
                            }
                            setShowAccountModal(true);
                          }}
                          disabled={accounts.length === 2 && !selectedAccountId}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Update Account
                        </Button>

                        {accounts.length === 1 && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedAccountForEdit(undefined);
                              setShowAccountModal(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Second Account
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>

        
        <AccountModal
          open={showAccountModal}
          onClose={() => {
            setShowAccountModal(false);
            setSelectedAccountForEdit(undefined);
            loadMonetizationData();
          }}
          accounts={accounts}
          currentAccount={selectedAccountForEdit}
        />
      </div>
    </AppLayout>
  );
}