import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, AlertTriangle, CheckCircle, XCircle, ArrowUpCircle, Clock } from "lucide-react";
import { mockDisputes } from "@/data/tutoringBusinessMockData";

export const TutoringBusinessDisputes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<typeof mockDisputes[0] | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Calculate metrics
  const totalDisputes = mockDisputes.length;
  const pendingDisputes = mockDisputes.filter(d => d.status === "pending").length;
  const resolvedDisputes = mockDisputes.filter(d => d.status === "resolved").length;
  const urgentDisputes = mockDisputes.filter(d => d.priority === "urgent").length;

  const filteredDisputes = mockDisputes.filter((dispute) => {
    const matchesSearch =
      dispute.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "all" || dispute.type === typeFilter;
    const matchesPriority =
      priorityFilter === "all" || dispute.priority === priorityFilter;
    const matchesStatus =
      statusFilter === "all" || dispute.status === statusFilter;
    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

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
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      case "under_review":
        return <Badge className="bg-blue-600 text-white">Under Review</Badge>;
      case "resolved":
        return <Badge className="bg-green-600 text-white">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const typeLabels: Record<string, string> = {
      refund_request: "Refund Request",
      quality_complaint: "Quality Complaint",
      technical_issue: "Technical Issue",
    };
    return <Badge variant="outline">{typeLabels[type] || type}</Badge>;
  };

  const calculateTimeRemaining = (deadline: string) => {
    const now = new Date();
    const slaDeadline = new Date(deadline);
    const diff = slaDeadline.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 0) return <span className="text-red-600">Overdue</span>;
    if (hours < 24)
      return <span className="text-orange-600">{hours}h remaining</span>;
    const days = Math.floor(hours / 24);
    return (
      <span className="text-muted-foreground">
        {days}d {hours % 24}h
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Disputes & Refunds</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDisputes}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingDisputes}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedDisputes}</div>
            <p className="text-xs text-muted-foreground">{((resolvedDisputes / totalDisputes) * 100).toFixed(0)}% resolution rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentDisputes}</div>
            <p className="text-xs text-muted-foreground">Requires immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>All Disputes</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search disputes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="refund_request">Refund Request</SelectItem>
                  <SelectItem value="quality_complaint">
                    Quality Complaint
                  </SelectItem>
                  <SelectItem value="technical_issue">
                    Technical Issue
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
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
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dispute ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SLA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow
                    key={dispute.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setAdminNotes(dispute.adminNotes || "");
                    }}
                  >
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>{getTypeBadge(dispute.type)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dispute.studentAvatar} />
                          <AvatarFallback>
                            {dispute.studentName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dispute.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={dispute.tutorAvatar} />
                          <AvatarFallback>
                            {dispute.tutorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dispute.tutorName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${dispute.amount}
                    </TableCell>
                    <TableCell>{getPriorityBadge(dispute.priority)}</TableCell>
                    <TableCell>{getStatusBadge(dispute.status)}</TableCell>
                    <TableCell className="text-sm">
                      {calculateTimeRemaining(dispute.slaDeadline)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredDisputes.map((dispute) => (
              <Card
                key={dispute.id}
                className="p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedDispute(dispute);
                  setAdminNotes(dispute.adminNotes || "");
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dispute.id}</span>
                    {getPriorityBadge(dispute.priority)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={dispute.studentAvatar} />
                      <AvatarFallback>
                        {dispute.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {dispute.studentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {dispute.subject}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">${dispute.amount}</div>
                      {getStatusBadge(dispute.status)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    {getTypeBadge(dispute.type)}
                    <span className="text-muted-foreground">
                      {calculateTimeRemaining(dispute.slaDeadline)}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dispute Detail & Action Sheet */}
      <Sheet
        open={!!selectedDispute}
        onOpenChange={() => setSelectedDispute(null)}
      >
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Dispute Details & Actions</SheetTitle>
            <SheetDescription>
              Review and take action on this dispute
            </SheetDescription>
          </SheetHeader>
          {selectedDispute && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Dispute ID</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedDispute.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="mt-1">
                    {getStatusBadge(selectedDispute.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Priority</div>
                  <div className="mt-1">
                    {getPriorityBadge(selectedDispute.priority)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Type</div>
                  <div className="mt-1">
                    {getTypeBadge(selectedDispute.type)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">SLA Deadline</div>
                  <div className="text-sm">
                    {calculateTimeRemaining(selectedDispute.slaDeadline)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Requested</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(
                      selectedDispute.requestedDate
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Participants</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedDispute.studentAvatar} />
                      <AvatarFallback>
                        {selectedDispute.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {selectedDispute.studentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Student
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedDispute.tutorAvatar} />
                      <AvatarFallback>
                        {selectedDispute.tutorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {selectedDispute.tutorName}
                      </div>
                      <div className="text-xs text-muted-foreground">Tutor</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Session Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Transaction ID
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDispute.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Subject
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDispute.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Amount
                    </span>
                    <span className="text-sm font-medium">
                      ${selectedDispute.amount}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Dispute Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium mb-1">Reason</div>
                    <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {selectedDispute.reason}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Explanation</div>
                    <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                      {selectedDispute.explanation}
                    </div>
                  </div>
                </div>
              </div>

              {selectedDispute.evidence &&
                selectedDispute.evidence.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Evidence</h3>
                    <div className="space-y-2">
                      {selectedDispute.evidence.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 border rounded-lg text-sm"
                        >
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="space-y-4">
                <h3 className="font-semibold">Admin Notes</h3>
                <Textarea
                  placeholder="Add notes about this dispute..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {selectedDispute.status === "resolved" &&
                selectedDispute.resolution && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Resolution
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">
                      {selectedDispute.resolution}
                    </div>
                    {selectedDispute.resolvedDate && (
                      <div className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Resolved on{" "}
                        {new Date(
                          selectedDispute.resolvedDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}

              {selectedDispute.status !== "resolved" && (
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Refund
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Dispute
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Escalate
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
