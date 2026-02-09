import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, DollarSign } from "lucide-react";

const refundSchema = z.object({
  reason: z.string().min(1, "Please select a reason"),
  explanation: z.string().optional(),
});

type RefundFormData = z.infer<typeof refundSchema>;

interface RefundRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorName: string;
  refundAmount: number;
  completedAt?: string;
  onSubmit: (reason: string, explanation?: string) => void;
  isLoading?: boolean;
}

const refundReasons = [
  { value: "tutor_unavailable", label: "Tutor became unavailable" },
  { value: "changed_mind", label: "Changed my mind" },
  { value: "scheduling_conflict", label: "Scheduling conflict" },
  { value: "quality_concerns", label: "Quality concerns" },
  { value: "other", label: "Other" },
];

export function RefundRequestModal({
  open,
  onOpenChange,
  tutorName,
  refundAmount,
  completedAt,
  onSubmit,
  isLoading = false,
}: RefundRequestModalProps) {
  const form = useForm<RefundFormData>({
    resolver: zodResolver(refundSchema),
    defaultValues: {
      reason: "",
      explanation: "",
    },
  });

  const handleSubmit = (data: RefundFormData) => {
    onSubmit(data.reason, data.explanation);
  };

  const hoursSinceCompletion = completedAt
    ? (Date.now() - new Date(completedAt).getTime()) / (1000 * 60 * 60)
    : null;

  const actualRefundAmount = refundAmount * 0.85;
  const platformFee = refundAmount * 0.15;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Request Refund
          </DialogTitle>
          <DialogDescription>
            Request a refund for your session with {tutorName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {hoursSinceCompletion !== null && hoursSinceCompletion > 24 && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-4">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  ⚠️ Refund Window Expired
                </p>
                <p className="text-xs text-red-700 dark:text-red-300">
                  Refunds are only available within 24 hours of session completion.
                  It has been {hoursSinceCompletion.toFixed(1)} hours since completion.
                </p>
              </div>
            )}

            {hoursSinceCompletion !== null && hoursSinceCompletion <= 24 && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-4">
                <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                  ✓ Eligible for Refund
                </p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Time remaining: {(24 - hoursSinceCompletion).toFixed(1)} hours
                </p>
              </div>
            )}

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Amount:</span>
                <span className="font-medium flex items-center">
                  <DollarSign className="h-4 w-4" />
                  {refundAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Platform Fee (15%):</span>
                <span className="text-red-600 flex items-center">
                  -<DollarSign className="h-4 w-4" />
                  {platformFee.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex items-center justify-between">
                <span className="font-medium">You'll Receive:</span>
                <span className="text-lg font-bold text-green-600 flex items-center">
                  <DollarSign className="h-5 w-5" />
                  {actualRefundAmount.toFixed(2)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason for Refund</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {refundReasons.map((reason) => (
                        <SelectItem key={reason.value} value={reason.value}>
                          {reason.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="explanation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please provide any additional context..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Refund Policy
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                <li>• Refunds are only available within 24 hours of session completion</li>
                <li>• A 15% platform fee is deducted from the refund amount</li>
                <li>• Your refund request will be reviewed by our admin team</li>
                <li>• Approved refunds are processed within 3-5 business days</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  (hoursSinceCompletion !== null && hoursSinceCompletion > 24)
                }
              >
                {isLoading ? "Submitting..." : "Submit Refund Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
