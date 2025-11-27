import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  DollarSign,
  CheckCircle,
  TrendingUp,
  Banknote,
  Calendar,
} from "lucide-react";
import {
  mockPendingPayouts,
  mockPayoutHistory,
} from "@/data/tutoringBusinessMockData";
import { useCurrency } from "@/hooks/useCurrency";

export function TutoringBusinessPayouts() {
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPayout, setSelectedPayout] = useState<
    (typeof mockPendingPayouts)[0] | (typeof mockPayoutHistory)[0] | null
  >(null);
  const [payoutToPay, setPayoutToPay] = useState<
    (typeof mockPendingPayouts)[0] | null
  >(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Calculate metrics
  const totalPendingAmount = mockPendingPayouts.reduce(
    (sum, p) => sum + p.amount,
    0
  );
  const totalPendingPayouts = mockPendingPayouts.length;
  const totalCompletedPayouts = mockPayoutHistory.length;
  const totalPaidAmount = mockPayoutHistory.reduce(
    (sum, p) => sum + p.amount,
    0
  );

  // Calculate commission (20% of total amount)
  const incomingCommission = totalPendingAmount * 0.2;
  const totalCommission = mockPayoutHistory.reduce(
    (sum, p) => sum + p.amount * 0.2,
    0
  );

  // Calculate next payout date (mock - would come from schedule)
  const nextPayoutDate = new Date();
  nextPayoutDate.setDate(nextPayoutDate.getDate() + 7); // 7 days from now
  const daysUntilPayout = Math.ceil(
    (nextPayoutDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-orange-600 text-white">Pending</Badge>;
      case "completed":
        return <Badge className="bg-green-600 text-white">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePayPayout = async () => {
    if (!payoutToPay) return;

    setIsProcessingPayment(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Here you would call your actual payment API
    console.log("Processing payment for:", payoutToPay);

    setIsProcessingPayment(false);
    setPayoutToPay(null);

    // Show success message (you can use toast here)
    alert(
      `Payment of ${formatCurrency(
        payoutToPay.amount
      )} processed successfully for ${payoutToPay.tutorName}`
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold custom-font">Payouts</h1>
        <Button
          onClick={() => navigate("/admin/tutoring-business/payout-schedule")}
          variant="outline"
        >
          <Calendar className="h-4 w-4 mr-2" />
          Payout Schedule
        </Button>
      </div>

      {/* Metrics Cards - Dynamic based on active tab */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Payouts
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingPayouts}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        {activeTab === "pending" ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Amount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalPendingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">To be paid out</p>
          </CardContent>
        </Card>
        ) : (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Paid Amount
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalPaidAmount)}
              </div>
              <p className="text-xs text-muted-foreground">Total paid out</p>
            </CardContent>
          </Card>
        )}
        {activeTab === "pending" ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Incoming Commission
                </CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(incomingCommission)}
                </div>
                <p className="text-xs text-muted-foreground">
                  20% platform fee
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Next Payout
                </CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{daysUntilPayout} days</div>
                <p className="text-xs text-muted-foreground">
                  {nextPayoutDate.toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Commission
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalCommission)}
                </div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Payout
                </CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(
                    totalCompletedPayouts > 0
                      ? totalPaidAmount / totalCompletedPayouts
                      : 0
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Per payout</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs
        defaultValue="pending"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending Payouts
          </TabsTrigger>
          <TabsTrigger value="history">
            <CheckCircle className="h-4 w-4 mr-2" />
            Payout History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Transaction Amount</TableHead>
                      <TableHead>Payout Amount</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPendingPayouts.map((payout) => (
                      <TableRow
                        key={payout.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        <TableCell className="font-medium">
                          {payout.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={payout.tutorAvatar} />
                              <AvatarFallback>
                                {payout.tutorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{payout.tutorName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payout.amount / 0.8)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>{payout.sessionsCount} sessions</TableCell>
                        <TableCell>
                          {new Date(payout.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPayoutToPay(payout);
                            }}
                          >
                            <Banknote className="h-4 w-4 text-green-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {mockPendingPayouts.map((payout) => (
                  <Card
                    key={payout.id}
                    className="p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedPayout(payout)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{payout.id}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={payout.tutorAvatar} />
                          <AvatarFallback>
                            {payout.tutorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {payout.tutorName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payout.sessionsCount} sessions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            {formatCurrency(payout.amount)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Due {new Date(payout.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPayoutToPay(payout);
                          }}
                        >
                          <Banknote className="h-4 w-4 text-green-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payout ID</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Transaction Amount</TableHead>
                      <TableHead>Payout Amount</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Paid Date</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayoutHistory.map((payout) => (
                      <TableRow
                        key={payout.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        <TableCell className="font-medium">
                          {payout.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={payout.tutorAvatar} />
                              <AvatarFallback>
                                {payout.tutorName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{payout.tutorName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(payout.amount / 0.8)}
                        </TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {formatCurrency(payout.amount)}
                        </TableCell>
                        <TableCell>{payout.sessionsCount} sessions</TableCell>
                        <TableCell>
                          {new Date(payout.paidDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{payout.paymentMethod}</TableCell>
                        <TableCell>{getStatusBadge(payout.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden space-y-4">
                {mockPayoutHistory.map((payout) => (
                  <Card
                    key={payout.id}
                    className="p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => setSelectedPayout(payout)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{payout.id}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={payout.tutorAvatar} />
                          <AvatarFallback>
                            {payout.tutorName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {payout.tutorName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payout.sessionsCount} sessions
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">
                            ${payout.amount.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(payout.paidDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payout Detail Sheet */}
      <Sheet
        open={!!selectedPayout}
        onOpenChange={() => setSelectedPayout(null)}
      >
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Payout Details</SheetTitle>
            <SheetDescription>
              Complete information about this payout
            </SheetDescription>
          </SheetHeader>
          {selectedPayout && (
            <div className="mt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">Payout ID</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedPayout.id}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">Status</div>
                  <div className="mt-1">
                    {getStatusBadge(selectedPayout.status)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {"dueDate" in selectedPayout ? "Due Date" : "Paid Date"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(
                      "dueDate" in selectedPayout
                        ? selectedPayout.dueDate
                        : selectedPayout.paidDate
                    ).toLocaleDateString()}
                  </div>
                </div>
                {"paymentMethod" in selectedPayout && (
                  <div>
                    <div className="text-sm font-medium">Payment Method</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPayout.paymentMethod}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Tutor Information</h3>
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <Avatar>
                    <AvatarImage src={selectedPayout.tutorAvatar} />
                    <AvatarFallback>
                      {selectedPayout.tutorName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {selectedPayout.tutorName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tutor ID: {selectedPayout.tutorId}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Payout Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Sessions
                    </span>
                    <span className="text-sm font-medium">
                      {selectedPayout.sessionsCount}
                    </span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(selectedPayout.amount)}
                    </span>
                  </div>
                </div>
              </div>

              {"sessions" in selectedPayout && selectedPayout.sessions && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Included Sessions</h3>
                  <div className="space-y-2">
                    {selectedPayout.sessions.map((session) => (
                      <div
                        key={session.id}
                        className="flex justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {session.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {session.date}
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {formatCurrency(session.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {"referenceNumber" in selectedPayout && (
                <div className="text-xs text-muted-foreground">
                  Reference: {selectedPayout.referenceNumber}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Payment Confirmation Dialog */}
      <Dialog open={!!payoutToPay} onOpenChange={() => setPayoutToPay(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payout Payment</DialogTitle>
            <DialogDescription>
              Review the payout details before processing the payment.
            </DialogDescription>
          </DialogHeader>

          {payoutToPay && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={payoutToPay.tutorAvatar} />
                  <AvatarFallback>
                    {payoutToPay.tutorName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{payoutToPay.tutorName}</div>
                  <div className="text-sm text-muted-foreground">
                    {payoutToPay.id}
                  </div>
                </div>
              </div>

              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold">
                    {formatCurrency(payoutToPay.amount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions</span>
                  <span>{payoutToPay.sessionsCount} sessions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Due Date</span>
                  <span>
                    {new Date(payoutToPay.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg text-sm">
                <p className="text-muted-foreground">
                  This payment will be processed immediately and cannot be
                  undone. Please ensure all details are correct.
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPayoutToPay(null)}
              disabled={isProcessingPayment}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayPayout}
              disabled={isProcessingPayment}
              className="bg-green-600 hover:bg-green-700"
            >
              {isProcessingPayment ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                <>
                  <Banknote className="h-4 w-4 mr-2" />
                  Process Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
