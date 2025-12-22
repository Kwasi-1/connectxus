import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Flag,
  Eye,
  Trash2,
  UserX,
  Filter,
  MessageSquare,
  Calendar,
  Share2,
  Heart,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentModerationItem } from "@/types/admin";
import { adminApi } from "@/api/admin.api";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";

export function Reports() {
  const { toast } = useToast();
  const { selectedSpaceId } = useAdminSpace();
  const [reports, setReports] = useState<ContentModerationItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  const [showViewPostModal, setShowViewPostModal] = useState(false);
  const [showWarnUserModal, setShowWarnUserModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedReport, setSelectedReport] =
    useState<ContentModerationItem | null>(null);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "warn" | null
  >(null);
  const [warningMessage, setWarningMessage] = useState("");
  const [moderationNotes, setModerationNotes] = useState("");

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true);      const status = statusFilter === "all" ? undefined : statusFilter;
      const contentType = typeFilter === "all" ? undefined : typeFilter;
      const offset = (currentPage - 1) * pageSize;

      const response = await adminApi.getContentReports(
        selectedSpaceId,
        status,
        contentType,
        pageSize,
        offset
      );
      setReports(response as ContentModerationItem[]);
    } catch (error) {
      console.error("Error loading reports:", error);
      toast({
        title: "Error",
        description: "Failed to load reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, typeFilter, currentPage, pageSize, selectedSpaceId, toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const filteredReports =
    reports.length > 0 &&
    reports.filter((report) => {
      const matchesSearch =
        report.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reporterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.content.author.displayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || report.priority === priorityFilter;
      const matchesType = typeFilter === "all" || report.type === typeFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesType;
    });

  const handleApproveReport = useCallback(
    async (reportId: string) => {
      try {
        await adminApi.resolveReport(
          reportId,
          "remove_content",
          "Content removed by admin"
        );
        await loadReports();
        toast({
          title: "Report Approved",
          description: "Content has been removed and user has been notified.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error approving report:", error);
        toast({
          title: "Error",
          description: "Failed to approve report",
          variant: "destructive",
        });
      }
    },
    [toast, loadReports]
  );

  const handleRejectReport = useCallback(
    async (reportId: string) => {
      try {
        await adminApi.resolveReport(
          reportId,
          "no_action",
          "Report rejected by admin"
        );
        await loadReports();
        toast({
          title: "Report Rejected",
          description: "No action taken. Content remains published.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error rejecting report:", error);
        toast({
          title: "Error",
          description: "Failed to reject report",
          variant: "destructive",
        });
      }
    },
    [toast, loadReports]
  );

  const handleWarnUser = useCallback(
    async (reportId: string, message: string) => {
      try {
        await adminApi.resolveReport(
          reportId,
          "warn_user",
          `User warned: ${message}`
        );
        await loadReports();
        toast({
          title: "User Warned",
          description: "Warning has been sent to the user.",
          variant: "default",
        });
      } catch (error) {
        console.error("Error warning user:", error);
        toast({
          title: "Error",
          description: "Failed to warn user",
          variant: "destructive",
        });
      }
    },
    [toast, loadReports]
  );

  const handleViewPost = (report: ContentModerationItem) => {
    setSelectedReport(report);
    setShowViewPostModal(true);
  };

  const handleModerationAction = (
    report: ContentModerationItem,
    action: "approve" | "reject" | "warn"
  ) => {
    setSelectedReport(report);
    setActionType(action);

    if (action === "warn") {
      setShowWarnUserModal(true);
    } else {
      setShowConfirmDialog(true);
    }
  };

  const confirmAction = () => {
    if (!selectedReport || !actionType) return;

    if (actionType === "approve") {
      handleApproveReport(selectedReport.id);
    } else if (actionType === "reject") {
      handleRejectReport(selectedReport.id);
    }

    setShowConfirmDialog(false);
    setSelectedReport(null);
    setActionType(null);
  };

  const submitWarning = () => {
    if (!selectedReport || !warningMessage.trim()) return;

    handleWarnUser(selectedReport.id, warningMessage);
    setShowWarnUserModal(false);
    setSelectedReport(null);
    setWarningMessage("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-600 text-white">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-600 text-white">Rejected</Badge>;
      case "removed":
        return <Badge className="bg-gray-600 text-white">Removed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge className="bg-red-600 text-white">Urgent</Badge>;
      case "high":
        return <Badge className="bg-orange-600 text-white">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-600 text-white">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "post":
        return <Flag className="h-4 w-4" />;
      case "comment":
        return <AlertTriangle className="h-4 w-4" />;
      case "group":
        return <UserX className="h-4 w-4" />;
      default:
        return <Flag className="h-4 w-4" />;
    }
  };

  const reportStats =
    reports.length > 0
      ? {
          total: reports.length,
          pending: reports.filter((r) => r.status === "pending").length,
          approved: reports.filter((r) => r.status === "approved").length,
          rejected: reports.filter((r) => r.status === "rejected").length,
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
            Reports & Moderation
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Reports & Moderation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Review
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Moderation Queue</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="comment">Comment</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="block md:hidden space-y-4">
            {filteredReports.length > 0 &&
              filteredReports.map((report) => (
                <Card key={report.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={report.content.author.avatar}
                          alt={report.content.author.displayName}
                        />
                        <AvatarFallback>
                          {report.content.author.displayName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {report.content.author.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {report.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleViewPost(report)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        {report.status === "pending" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                handleModerationAction(report, "approve")
                              }
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve & Remove
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleModerationAction(report, "reject")
                              }
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject Report
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleModerationAction(report, "warn")
                              }
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Warn User
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(report.type)}
                      <span className="capitalize text-sm">{report.type}</span>
                      {getPriorityBadge(report.priority)}
                      {getStatusBadge(report.status)}
                    </div>

                    <div className="text-sm text-muted-foreground line-clamp-2">
                      {report.content.text}
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Reported by: {report.reporterName}</span>
                      <Badge variant="outline" className="text-xs">
                        {report.reason}
                      </Badge>
                    </div>

                    {report.content.images &&
                      report.content.images.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {report.content.images.length} image(s)
                        </Badge>
                      )}
                  </div>
                </Card>
              ))}
          </div>

          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Content</TableHead>
                  <TableHead className="w-[80px]">Type</TableHead>
                  <TableHead className="w-[120px]">Reporter</TableHead>
                  <TableHead className="w-[120px]">Reason</TableHead>
                  <TableHead className="w-[100px]">Priority</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[100px]">Reported</TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.length > 0 &&
                  filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8 mt-1 flex-shrink-0">
                            <AvatarImage
                              src={report.content.author.avatar}
                              alt={report.content.author.displayName}
                            />
                            <AvatarFallback>
                              {report.content.author.displayName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {report.content.author.displayName}
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {report.content.text}
                            </div>
                            {report.content.images &&
                              report.content.images.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="mt-1 text-xs"
                                >
                                  {report.content.images.length} image(s)
                                </Badge>
                              )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {getTypeIcon(report.type)}
                          <span className="capitalize">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="truncate">{report.reporterName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {report.reason}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {report.createdAt.toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewPost(report)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {report.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleModerationAction(report, "approve")
                                  }
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Approve & Remove
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleModerationAction(report, "reject")
                                  }
                                >
                                  <XCircle className="mr-2 h-4 w-4" />
                                  Reject Report
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleModerationAction(report, "warn")
                                  }
                                >
                                  <UserX className="mr-2 h-4 w-4" />
                                  Warn User
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={showViewPostModal} onOpenChange={setShowViewPostModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reported Content Details</DialogTitle>
            <DialogDescription>
              Review the reported content and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Report ID</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.id}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported By</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.reporterName}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reason</Label>
                  <Badge variant="outline">{selectedReport.reason}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  {getPriorityBadge(selectedReport.priority)}
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  {getStatusBadge(selectedReport.status)}
                </div>
                <div>
                  <Label className="text-sm font-medium">Reported On</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReport.createdAt.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={selectedReport.content.author.avatar}
                      alt={selectedReport.content.author.displayName}
                    />
                    <AvatarFallback>
                      {selectedReport.content.author.displayName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {selectedReport.content.author.displayName}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        @{selectedReport.content.author.username}
                      </Badge>
                      {selectedReport.content.author.verified && (
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {selectedReport.content.author.major} • Year{" "}
                      {selectedReport.content.author.year}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {selectedReport.content.createdAt?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <p className="text-sm">{selectedReport.content.text}</p>
                </div>

                {selectedReport.content.images &&
                  selectedReport.content.images.length > 0 && (
                    <div className="mb-3">
                      <div className="grid grid-cols-2 gap-2">
                        {selectedReport.content.images.map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Content image ${index + 1}`}
                            className="rounded-lg max-h-48 w-full object-cover"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground border-t pt-3">
                  {selectedReport.content.likes !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{selectedReport.content.likes}</span>
                    </div>
                  )}
                  {selectedReport.content.comments !== undefined && (
                    <div className="flex items-center space-x-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{selectedReport.content.comments}</span>
                    </div>
                  )}
                  {selectedReport.content.shares !== undefined && (
                    <div className="flex items-center space-x-1">
                      <Share2 className="h-4 w-4" />
                      <span>{selectedReport.content.shares}</span>
                    </div>
                  )}
                </div>
              </div>

              {selectedReport.status === "pending" && (
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewPostModal(false);
                      handleModerationAction(selectedReport, "warn");
                    }}
                  >
                    <UserX className="mr-2 h-4 w-4" />
                    Warn User
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowViewPostModal(false);
                      handleModerationAction(selectedReport, "reject");
                    }}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Report
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setShowViewPostModal(false);
                      handleModerationAction(selectedReport, "approve");
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Remove
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showWarnUserModal} onOpenChange={setShowWarnUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Warn User</DialogTitle>
            <DialogDescription>
              Send a warning to {selectedReport?.content.author.displayName}{" "}
              about their content.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="warning-message">Warning Message</Label>
              <Textarea
                id="warning-message"
                placeholder="Enter warning message for the user..."
                value={warningMessage}
                onChange={(e) => setWarningMessage(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowWarnUserModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitWarning} disabled={!warningMessage.trim()}>
              Send Warning
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve"
                ? "Approve Report & Remove Content"
                : "Reject Report"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? "This will remove the content and notify the user. This action cannot be undone."
                : "This will reject the report and keep the content published. The reporter will be notified."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmAction}
              className={
                actionType === "approve" ? "bg-red-600 hover:bg-red-700" : ""
              }
            >
              {actionType === "approve" ? "Remove Content" : "Reject Report"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
