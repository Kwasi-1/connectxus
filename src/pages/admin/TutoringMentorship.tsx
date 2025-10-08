import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      const mockTutorApps: TutorApplication[] = [
        {
          id: "1",
          applicantId: "u1",
          applicantName: "Sarah Chen",
          subjects: ["Mathematics", "Statistics"],
          hourlyRate: 25,
          qualifications: "Mathematics Major, 3.8 GPA, Dean's List",
          experience: "2 years tutoring experience, helped 50+ students",
          availability: [
            { day: "Monday", startTime: "14:00", endTime: "17:00" },
            { day: "Wednesday", startTime: "14:00", endTime: "17:00" },
            { day: "Friday", startTime: "10:00", endTime: "13:00" },
          ],
          status: "pending",
          submittedAt: new Date("2024-01-10"),
        },
        {
          id: "2",
          applicantId: "u2",
          applicantName: "John Doe",
          subjects: ["Computer Science", "Programming"],
          hourlyRate: 30,
          qualifications: "CS Major, Software Development Intern",
          experience: "1 year tutoring experience, strong in Python and Java",
          availability: [
            { day: "Tuesday", startTime: "15:00", endTime: "18:00" },
            { day: "Thursday", startTime: "15:00", endTime: "18:00" },
          ],
          status: "approved",
          reviewedBy: "Admin",
          reviewerNotes: "Excellent qualifications and experience",
          submittedAt: new Date("2024-01-08"),
          reviewedAt: new Date("2024-01-09"),
        },
      ];

      const mockMentorApps: MentorApplication[] = [
        {
          id: "1",
          applicantId: "u3",
          applicantName: "Dr. Michael Johnson",
          industry: "Technology",
          company: "Google",
          position: "Senior Software Engineer",
          experience: 8,
          specialties: [
            "Software Development",
            "Career Guidance",
            "Technical Leadership",
          ],
          linkedinProfile: "https://linkedin.com/in/mjohnson",
          portfolio: "https://mjohnson.dev",
          status: "pending",
          submittedAt: new Date("2024-01-12"),
        },
        {
          id: "2",
          applicantId: "u4",
          applicantName: "Emma Wilson",
          industry: "Finance",
          company: "Goldman Sachs",
          position: "Investment Analyst",
          experience: 5,
          specialties: [
            "Financial Analysis",
            "Investment Strategy",
            "Career Development",
          ],
          linkedinProfile: "https://linkedin.com/in/ewilson",
          status: "approved",
          reviewedBy: "Super Admin",
          reviewerNotes:
            "Strong background in finance, great for business students",
          submittedAt: new Date("2024-01-05"),
          reviewedAt: new Date("2024-01-06"),
        },
      ];

      setTutorApplications(mockTutorApps);
      setMentorApplications(mockMentorApps);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredTutorApps = tutorApplications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.subjects.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredMentorApps = mentorApplications.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.specialties.some((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApproveTutor = (applicationId: string) => {
    setTutorApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "approved" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date(),
            }
          : app
      )
    );
    toast({
      title: "Tutor Application Approved",
      description: "The tutor application has been approved.",
    });
  };

  const handleRejectTutor = (applicationId: string) => {
    setTutorApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "rejected" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date(),
            }
          : app
      )
    );
    toast({
      title: "Tutor Application Rejected",
      description: "The tutor application has been rejected.",
      variant: "destructive",
    });
  };

  const handleApproveMentor = (applicationId: string) => {
    setMentorApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "approved" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date(),
            }
          : app
      )
    );
    toast({
      title: "Mentor Application Approved",
      description: "The mentor application has been approved.",
    });
  };

  const handleRejectMentor = (applicationId: string) => {
    setMentorApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              status: "rejected" as const,
              reviewedBy: "Admin",
              reviewedAt: new Date(),
            }
          : app
      )
    );
    toast({
      title: "Mentor Application Rejected",
      description: "The mentor application has been rejected.",
      variant: "destructive",
    });
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
    total: tutorApplications.length,
    pending: tutorApplications.filter((a) => a.status === "pending").length,
    approved: tutorApplications.filter((a) => a.status === "approved").length,
    rejected: tutorApplications.filter((a) => a.status === "rejected").length,
  };

  const mentorStats = {
    total: mentorApplications.length,
    pending: mentorApplications.filter((a) => a.status === "pending").length,
    approved: mentorApplications.filter((a) => a.status === "approved").length,
    rejected: mentorApplications.filter((a) => a.status === "rejected").length,
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

  // Create stats cards data based on active tab
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

  // Create action buttons
  const actionButtons = [
    {
      label: "Export",
      icon: <Download className="h-4 w-4 mr-2" />,
      variant: "outline" as const,
      size: "sm" as const,
    },
  ];

  // Create filter options
  const filterOptions = [
    { value: "all", label: "All Status" },
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];

  // Create tutor table content
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
                <div className="font-medium">{application.applicantName}</div>
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
              {application.hourlyRate
                ? `$${application.hourlyRate}/hr`
                : "Not specified"}
            </TableCell>
            <TableCell>{getStatusBadge(application.status)}</TableCell>
            <TableCell>
              {application.submittedAt.toLocaleDateString()}
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

  // Create mentor table content
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
        {filteredMentorApps.map((application) => (
          <TableRow key={application.id}>
            <TableCell>
              <div>
                <div className="font-medium">{application.applicantName}</div>
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
                {application.specialties.slice(0, 2).map((specialty, index) => (
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
              {application.submittedAt.toLocaleDateString()}
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

  // Create tabs configuration
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
