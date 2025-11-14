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
import { TutorApplication, MentorApplication } from "@/types/admin";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { adminApi } from "@/api/admin.api";
import { getDefaultSpaceId } from "@/lib/apiClient";
import moment from "moment";

export function TutoringMentorship() {
  const { toast } = useToast();
  const [tutorApplications, setTutorApplications] = useState<
    TutorApplication[]
  >([]);
  const [mentorApplications, setMentorApplications] = useState<
    MentorApplication[]
  >([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tutors");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const loadTutorApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const spaceId = getDefaultSpaceId();
      if (!spaceId) {
        toast({
          title: "Error",
          description:
            "No space ID available. Please configure VITE_DEFAULT_SPACE_ID.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const status = statusFilter === "all" ? undefined : statusFilter;
      const response = await adminApi.getTutorApplications(
        spaceId,
        status,
        currentPage,
        pageSize
      );
      setTutorApplications(response.applications as TutorApplication[]);
    } catch (error) {
      console.error("Error loading tutor applications:", error);
      toast({
        title: "Error",
        description: "Failed to load tutor applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, toast]);

  const loadMentorApplications = useCallback(async () => {
    try {
      setIsLoading(true);
      const spaceId = getDefaultSpaceId();
      if (!spaceId) {
        toast({
          title: "Error",
          description:
            "No space ID available. Please configure VITE_DEFAULT_SPACE_ID.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      const status = statusFilter === "all" ? undefined : statusFilter;
      const response = await adminApi.getMentorApplications(
        spaceId,
        status,
        currentPage,
        pageSize
      );
      setMentorApplications(response.applications as MentorApplication[]);
    } catch (error) {
      console.error("Error loading mentor applications:", error);
      toast({
        title: "Error",
        description: "Failed to load mentor applications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, statusFilter, toast]);

  useEffect(() => {
    if (activeTab === "tutors") {
      loadTutorApplications();
    } else {
      loadMentorApplications();
    }
  }, [activeTab, loadTutorApplications, loadMentorApplications]);

  const filteredTutorApps = tutorApplications.filter((app) => {
    const matchesSearch =
      app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMentorApps =
    mentorApplications.length > 0 &&
    mentorApplications.filter((app) => {
      const matchesSearch =
        app.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.specialties.some((s) =>
          s.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      return matchesSearch && matchesStatus;
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

  const handleApproveMentor = async (applicationId: string) => {
    try {
      await adminApi.approveMentorApplication(
        applicationId,
        "Application approved by admin"
      );
      await loadMentorApplications();
      toast({
        title: "Mentor Application Approved",
        description: "The mentor application has been approved.",
      });
    } catch (error) {
      console.error("Error approving mentor application:", error);
      toast({
        title: "Error",
        description: "Failed to approve mentor application",
        variant: "destructive",
      });
    }
  };

  const handleRejectMentor = async (applicationId: string) => {
    try {
      await adminApi.rejectMentorApplication(
        applicationId,
        "Application rejected by admin"
      );
      await loadMentorApplications();
      toast({
        title: "Mentor Application Rejected",
        description: "The mentor application has been rejected.",
        variant: "destructive",
      });
    } catch (error) {
      console.error("Error rejecting mentor application:", error);
      toast({
        title: "Error",
        description: "Failed to reject mentor application",
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

  const tutorStats =
    tutorApplications.length > 0
      ? {
          total: tutorApplications.length,
          pending: tutorApplications.filter((a) => a.status === "pending")
            .length,
          approved: tutorApplications.filter((a) => a.status === "approved")
            .length,
          rejected: tutorApplications.filter((a) => a.status === "rejected")
            .length,
        }
      : {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        };

  const mentorStats =
    mentorApplications.length > 0
      ? {
          total: mentorApplications.length,
          pending: mentorApplications.filter((a) => a.status === "pending")
            .length,
          approved: mentorApplications.filter((a) => a.status === "approved")
            .length,
          rejected: mentorApplications.filter((a) => a.status === "rejected")
            .length,
        }
      : {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
        };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold custom-font">
            Tutoring & Mentorship
          </h1>
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
          ? "Total Tutor Applications"
          : "Total Mentor Applications",
      value: activeTab === "tutors" ? tutorStats.total : mentorStats.total,
      icon: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: "Pending Review",
      value: activeTab === "tutors" ? tutorStats.pending : mentorStats.pending,
      icon: <Clock className="h-4 w-4 text-orange-600" />,
    },
    {
      title: "Approved",
      value:
        activeTab === "tutors" ? tutorStats.approved : mentorStats.approved,
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
    {
      title: activeTab === "tutors" ? "Active Tutors" : "Active Mentors",
      value:
        activeTab === "tutors" ? tutorStats.approved : mentorStats.approved,
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
        {filteredTutorApps.map((application) => (
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
                {application.subjects.map((subject, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {subject}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {application.hourly_rate
                ? `$${application.hourly_rate}/hr`
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
  );

    const mentorTableContent = (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Applicant</TableHead>
          <TableHead>Industry</TableHead>
          <TableHead>Experience</TableHead>
          <TableHead>Specialties</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Applied</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredMentorApps.length > 0 &&
          filteredMentorApps.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{application.full_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {application.position} at {application.company}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{application.industry}</Badge>
              </TableCell>
              <TableCell>{application.experience} years</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {application.specialties
                    .slice(0, 2)
                    .map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  {application.specialties.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{application.specialties.length - 2}
                    </Badge>
                  )}
                </div>
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
                          onClick={() => handleApproveMentor(application.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRejectMentor(application.id)}
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
  );

    const tabs = [
    {
      value: "tutors",
      label: "Tutor Applications",
      content: tutorTableContent,
    },
    {
      value: "mentors",
      label: "Mentor Applications",
      content: mentorTableContent,
    },
  ];

  return (
    <AdminPageLayout
      title="Tutoring & Mentorship"
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

export default TutoringMentorship;
