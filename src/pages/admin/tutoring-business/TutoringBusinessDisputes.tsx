import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  AlertCircle as AlertCircleIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import { adminApi } from "@/api/admin.api";
import { useAdminSpace } from "@/contexts/AdminSpaceContext";
import { useToast } from "@/hooks/use-toast";

interface Dispute {
  id: string;
  requestId: string;
  studentName: string;
  tutorName: string;
  subject: string;
  topic: string;
  amount: number;
  paymentStatus: string;
  refundReason?: string;
  requestedDate?: string;
  sessionStatus: string;
}

export function TutoringBusinessDisputes() {
  const { formatCurrency } = useCurrency();
  const { selectedSpaceId } = useAdminSpace();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadData();
  }, [selectedSpaceId, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await adminApi.getTutoringBusinessDisputes(
        selectedSpaceId,
        100,
        0,
        statusFilter === "all" ? undefined : statusFilter
      );

      const transformedDisputes: Dispute[] = result.disputes.map((d) => ({
        id: d.id,
        requestId: d.tutoring_request_id,
        studentName: d.student_name,
        tutorName: d.tutor_name,
        subject: d.subject,
        topic: d.topic,
        amount: parseFloat(d.amount),
        paymentStatus: d.payment_status,
        refundReason: d.refund_reason,
        requestedDate: d.refund_requested_at,
        sessionStatus: d.session_status,
      }));

      setDisputes(transformedDisputes);
    } catch (err: any) {
      console.error("Failed to load disputes:", err);
      setError(err.message || "Failed to load disputes");
    } finally {
      setLoading(false);
    }
  };

  const totalDisputes = disputes.length;
  const pendingDisputes = disputes.filter(
    (d) => d.paymentStatus === "pending" || d.paymentStatus === "paid"
  ).length;
  const resolvedDisputes = disputes.filter(
    (d) => d.paymentStatus === "refunded"
  ).length;
  const urgentDisputes = disputes.filter((d) => {
    if (!d.requestedDate) return false;
    const daysSince =
      (Date.now() - new Date(d.requestedDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return daysSince > 3; 
  }).length;

  const filteredDisputes = disputes.filter((dispute) => {
    const matchesSearch =
      dispute.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      case "paid":
        return (
          <Badge className="bg-blue-600 text-white">Awaiting Action</Badge>
        );
      case "refunded":
        return <Badge className="bg-green-600 text-white">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const calculateDaysSince = (date?: string) => {
    if (!date) return "N/A";
    const days = Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) return <span className="text-blue-600">Today</span>;
    if (days === 1) return <span className="text-orange-600">1 day ago</span>;
    if (days > 3) return <span className="text-red-600">{days} days ago</span>;
    return <span className="text-muted-foreground">{days} days ago</span>;
  };

  const handleApproveRefund = async () => {
    if (!selectedDispute) return;

    if (
      !window.confirm(
        `Are you sure you want to approve a refund of ${formatCurrency(
          selectedDispute.amount
        )} for this dispute?`
      )
    ) {
      return;
    }

    setIsProcessing(true);

    try {
      await adminApi.approveTutoringBusinessRefund(selectedDispute.requestId);

      toast({
        title: "Refund Approved",
        description: `Refund of ${formatCurrency(
          selectedDispute.amount
        )} has been approved and will be processed.`,
      });

      setSelectedDispute(null);
      setAdminNotes("");
      loadData();
    } catch (err: any) {
      console.error("Failed to approve refund:", err);
      toast({
        title: "Refund Failed",
        description: err.message || "Failed to approve refund",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold custom-font">Disputes & Refunds</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold custom-font">Disputes & Refunds</h1>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircleIcon className="h-5 w-5" />
              <p>Failed to load disputes: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Disputes & Refunds</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Disputes
            </CardTitle>
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
            <p className="text-xs text-muted-foreground">
              {((resolvedDisputes / totalDisputes) * 100).toFixed(0)}%
              resolution rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentDisputes}</div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Awaiting Action</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
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
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDisputes.map((dispute) => (
                  <TableRow
                    key={dispute.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setAdminNotes("");
                    }}
                  >
                    <TableCell className="font-medium">{dispute.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
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
                          <AvatarFallback>
                            {dispute.tutorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{dispute.tutorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{dispute.subject}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(dispute.amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(dispute.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {calculateDaysSince(dispute.requestedDate)}
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
                  setAdminNotes("");
                }}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{dispute.id}</span>
                    {getStatusBadge(dispute.paymentStatus)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
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
                      <div className="font-semibold">
                        {formatCurrency(dispute.amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculateDaysSince(dispute.requestedDate)}
                      </div>
                    </div>
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
                    {getStatusBadge(selectedDispute.paymentStatus)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Session Status</div>
                  <div className="text-sm text-muted-foreground capitalize">
                    {selectedDispute.sessionStatus}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Requested</div>
                  <div className="text-sm">
                    {calculateDaysSince(selectedDispute.requestedDate)}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Participants</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
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
                      Request ID
                    </span>
                    <span className="text-sm font-medium">
                      {selectedDispute.requestId}
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
                    <span className="text-sm text-muted-foreground">Topic</span>
                    <span className="text-sm font-medium">
                      {selectedDispute.topic}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Amount</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(selectedDispute.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedDispute.refundReason && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Refund Reason</h3>
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                    {selectedDispute.refundReason}
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
                  disabled={selectedDispute.paymentStatus === "refunded"}
                />
              </div>

              {selectedDispute.paymentStatus === "refunded" ? (
                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="font-medium text-green-900 dark:text-green-100 mb-2">
                    <CheckCircle className="inline h-4 w-4 mr-2" />
                    Refund Processed
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    This refund has been successfully processed.
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleApproveRefund}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {isProcessing ? "Processing..." : "Approve Refund"}
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
