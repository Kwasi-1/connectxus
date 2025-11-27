import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  DollarSign,
  CheckCircle,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { mockTransactions } from "@/data/tutoringBusinessMockData";
import { useCurrency } from "@/hooks/useCurrency";

export function TutoringBusinessTransactions() {
  const { formatCurrency } = useCurrency();
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sessionTypeFilter, setSessionTypeFilter] = useState("all");
  const [selectedTransaction, setSelectedTransaction] = useState<
    (typeof mockTransactions)[0] | null
  >(null);

  // Calculate metrics
  const totalTransactions = mockTransactions.length;
  const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const completedSessions = mockTransactions.filter(
    (t) => t.status === "completed"
  ).length;
  const refundedCount = mockTransactions.filter(
    (t) => t.status === "refunded"
  ).length;
  const refundRate = ((refundedCount / totalTransactions) * 100).toFixed(1);

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const matchesSearch =
      transaction.studentName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.tutorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject =
      subjectFilter === "all" || transaction.subject === subjectFilter;
    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;
    const matchesSessionType =
      sessionTypeFilter === "all" ||
      transaction.sessionType === sessionTypeFilter;

    return (
      matchesSearch && matchesSubject && matchesStatus && matchesSessionType
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      case "paid":
        return <Badge className="bg-blue-600 text-white">Paid</Badge>;
      case "refunded":
        return <Badge className="bg-gray-600 text-white">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const subjects = [
    "all",
    ...Array.from(new Set(mockTransactions.map((t) => t.subject))),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Transactions</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Gross revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Sessions
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSessions}</div>
            <p className="text-xs text-muted-foreground">
              {((completedSessions / totalTransactions) * 100).toFixed(0)}%
              completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{refundRate}%</div>
            <p className="text-xs text-muted-foreground">
              {refundedCount} refunded
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>All Transactions</CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject === "all" ? "All Subjects" : subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sessionTypeFilter}
                onValueChange={setSessionTypeFilter}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="single">Single</SelectItem>
                  <SelectItem value="semester">Semester</SelectItem>
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
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={transaction.studentAvatar} />
                          <AvatarFallback>
                            {transaction.studentName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{transaction.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={transaction.tutorAvatar} />
                          <AvatarFallback>
                            {transaction.tutorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{transaction.tutorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.subject}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {transaction.sessionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {filteredTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="p-4 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">
                      {transaction.id}
                    </span>
                    {getStatusBadge(transaction.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={transaction.studentAvatar} />
                      <AvatarFallback>
                        {transaction.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {transaction.studentName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {transaction.subject}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(transaction.amount)}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-xs capitalize mt-1"
                      >
                        {transaction.sessionType}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Detail Sheet */}
      <Sheet
        open={!!selectedTransaction}
        onOpenChange={() => setSelectedTransaction(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
            <SheetDescription>
              Complete information about this transaction
            </SheetDescription>
          </SheetHeader>
          {selectedTransaction && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Transaction ID</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTransaction.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="mt-1">
                    {getStatusBadge(selectedTransaction.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Date</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(selectedTransaction.date).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Payment Method</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedTransaction.paymentMethod}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Participants</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedTransaction.studentAvatar} />
                      <AvatarFallback>
                        {selectedTransaction.studentName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {selectedTransaction.studentName}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Student
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar>
                      <AvatarImage src={selectedTransaction.tutorAvatar} />
                      <AvatarFallback>
                        {selectedTransaction.tutorName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">
                        {selectedTransaction.tutorName}
                      </div>
                      <div className="text-sm text-muted-foreground">Tutor</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Session Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Subject
                    </span>
                    <span className="text-sm font-medium">
                      {selectedTransaction.subject}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Topic</span>
                    <span className="text-sm font-medium">
                      {selectedTransaction.topic}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Session Type
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {selectedTransaction.sessionType}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Payment Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Amount
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(selectedTransaction.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Platform Fee (15%)
                    </span>
                    <span className="text-sm font-medium">
                      {formatCurrency(selectedTransaction.platformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">
                      Tutor Earnings
                    </span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(selectedTransaction.tutorAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedTransaction.status === "refunded" &&
                selectedTransaction.refundDate && (
                  <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="font-medium text-red-900 dark:text-red-100 mb-2">
                      Refund Information
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-300">
                          Refund Date
                        </span>
                        <span className="text-red-900 dark:text-red-100">
                          {new Date(
                            selectedTransaction.refundDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {selectedTransaction.refundReason && (
                        <div className="flex justify-between">
                          <span className="text-red-700 dark:text-red-300">
                            Reason
                          </span>
                          <span className="text-red-900 dark:text-red-100">
                            {selectedTransaction.refundReason}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              <div className="text-xs text-muted-foreground">
                Transaction Reference: {selectedTransaction.transactionRef}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
