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
            {/* Refund Amount */}
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Refund Amount:
                </span>
                <span className="text-lg font-semibold flex items-center">
                  <DollarSign className="h-5 w-5" />
                  {refundAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Reason Selection */}
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

            {/* Explanation */}
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

            {/* Important Notice */}
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 p-4 text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                Refund Review Process
              </p>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300 text-xs">
                <li>• Your refund request will be reviewed by our team</li>
                <li>• You'll receive a response within 48 hours</li>
                <li>
                  • Approved refunds are processed within 5-7 business days
                </li>
                <li>• Payment will be held until the review is complete</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Refund Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
