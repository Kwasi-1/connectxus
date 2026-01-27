import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  GraduationCap,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Download,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import { TutorApplication,  } from "@/types/admin";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import moment from "moment";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";

export function AdminTutoring() {
  const { toast } = useToast();
  const { selectedSpaceId } = useAdminSpace();
  const [allApplications, setAllApplications] = useState<TutorApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [activeTab, setActiveTab] = useState("tutors");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const loadTutorApplications = useCallback(async () => {
    try {
      if (offset === 0) {
        setIsLoading(true);
      } else {
        setIsFetching(true);
      }

      const status = statusFilter === "all" ? undefined : statusFilter;
      const search = debouncedSearch || undefined;
      const response = await adminApi.getTutorApplications(
        selectedSpaceId,
        search,
        status,
        limit,
        offset
      );

      if (offset === 0) {
        setAllApplications(response.applications as TutorApplication[]);
      } else {
        setAllApplications(prev => [...prev, ...(response.applications as TutorApplication[])]);
      }

      setTotalCount(response.total);
      setHasMore(response.applications.length === limit);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load tutor applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  }, [offset, limit, statusFilter, debouncedSearch, selectedSpaceId, toast]);

  useEffect(() => {
    loadTutorApplications();
  }, [loadTutorApplications]);

  useEffect(() => {
    setOffset(0);
    setAllApplications([]);
  }, [debouncedSearch, statusFilter, selectedSpaceId]);

  const { loadMoreRef } = useInfiniteScroll({
    loading: isFetching,
    hasMore,
    onLoadMore: () => setOffset(prev => prev + limit),
    threshold: 300,
  });

  const handleApproveTutor = async (applicationId: string) => {
    try {
      await adminApi.approveTutorApplication(
        applicationId,
        "Application approved by admin"
      );
      await loadTutorApplications();
      toast({
        title: "Tutor Application Approved",
        description: "The tutor application has been approved.",
      });
    } catch (error) {
      console.error("Error approving tutor application:", error);
      toast({
        title: "Error",
        description: "Failed to approve tutor application",
        variant: "destructive",
      });
    }
  };

  const handleRejectTutor = async (applicationId: string) => {
    try {
      await adminApi.rejectTutorApplication(
        applicationId,
        "Application rejected by admin"
      );
      await loadTutorApplications();
      toast({
        title: "Tutor Application Rejected",
        description: "The tutor application has been rejected.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error rejecting tutor application:", error);
      toast({
        title: "Error",
        description: "Failed to reject tutor application",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const tutorStats = {
    total: totalCount,
    pending: allApplications.filter((a) => a.status === "pending").length,
    approved: allApplications.filter((a) => a.status === "approved").length,
    rejected: allApplications.filter((a) => a.status === "rejected").length,
  };



  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">Tutoring</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="animate-pulse">
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title:
        activeTab === "tutors"
          && "Total Tutor Applications",
      value: tutorStats.total,
      icon: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Pending Review",
      value: activeTab === "tutors" && tutorStats.pending ,
      icon: <Clock className="h-4 w-4 text-orange-600" />,
    },
    {
      title: "Approved",
      value:
        activeTab === "tutors" && tutorStats.approved ,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    {
      title: activeTab === "tutors" && "Active Tutors",
      value:
        activeTab === "tutors" && tutorStats.approved ,
      icon: <Star className="h-4 w-4 text-campus-orange" />,
    },
  ];

  const actionButtons = [
    {
      label: "Export",
      icon: <Download className="h-4 w-4 mr-2" />,
      variant: "outline" as const,
      size: "sm" as const,
    },
  ];

  const filterOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  const tutorTableContent = (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Subjects</TableHead>
            <TableHead>Rate</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allApplications.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{application.full_name}</div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {application.qualifications}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {application.subject}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                {application.session_rate
                  ? `$${application.session_rate}/hr`
                  : "Not specified"}
              </TableCell>
              <TableCell>{getStatusBadge(application.status)}</TableCell>
              <TableCell>
                {moment(application.submitted_at).format("Do MMMM")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {application.status === "pending" && (
                      <>
                        <DropdownMenuItem
                          onClick={() => handleApproveTutor(application.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRejectTutor(application.id)}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div ref={loadMoreRef} className="h-4" />
      {isFetching && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground text-center py-2">
          Showing {allApplications.length} of {totalCount} applications
        </div>
      )}
    </>
  );

  const tabs = [
    {
      value: "tutors",
      label: "Tutor Applications",
      content: tutorTableContent,
    },
  ];

  return (
    <AdminPageLayout
      title="Tutoring"
      actionButtons={actionButtons}
      statsCards={statsCards}
      contentTitle="Applications Management"
      showSearch={true}
      searchPlaceholder="Search applications..."
      searchValue={searchQuery}
      onSearchChange={setSearchQuery}
      showFilter={true}
      filterValue={statusFilter}
      onFilterChange={setStatusFilter}
      filterOptions={filterOptions}
      filterPlaceholder="Status"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isLoading={isLoading}
      loadingCardCount={4}
    />
  );
}

export default AdminTutoring;
