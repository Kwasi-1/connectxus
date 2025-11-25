import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Star, CheckCircle2, AlertTriangle } from "lucide-react";

const completionSchema = z.object({
  sessionHappened: z.enum(["yes", "no"], {
    required_error: "Please confirm if the session took place",
  }),
  rating: z.number().min(1).max(5).optional(),
  review: z.string().optional(),
  issueReason: z.string().optional(),
});

type CompletionFormData = z.infer<typeof completionSchema>;

interface SessionCompletionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorName: string;
  onComplete: (rating: number, review?: string) => void;
  onReportIssue: (reason: string) => void;
  isLoading?: boolean;
}

export function SessionCompletionModal({
  open,
  onOpenChange,
  tutorName,
  onComplete,
  onReportIssue,
  isLoading = false,
}: SessionCompletionModalProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const form = useForm<CompletionFormData>({
    resolver: zodResolver(completionSchema),
    defaultValues: {
      sessionHappened: undefined,
      rating: undefined,
      review: "",
      issueReason: "",
    },
  });

  const sessionHappened = form.watch("sessionHappened");
  const rating = form.watch("rating");

  const handleSubmit = (data: CompletionFormData) => {
    if (data.sessionHappened === "yes") {
      if (data.rating) {
        onComplete(data.rating, data.review);
      }
    } else {
      if (data.issueReason) {
        onReportIssue(data.issueReason);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Complete Session
          </DialogTitle>
          <DialogDescription>
            Let us know how your session with {tutorName} went
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Did Session Happen */}
            <FormField
              control={form.control}
              name="sessionHappened"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Did this session take place?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                        <RadioGroupItem value="yes" id="yes" />
                        <Label htmlFor="yes" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <span>Yes, the session happened</span>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg border p-3 hover:bg-accent transition-colors">
                        <RadioGroupItem value="no" id="no" />
                        <Label htmlFor="no" className="flex-1 cursor-pointer">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <span>No, there was an issue</span>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* If Yes - Rating and Review */}
            {sessionHappened === "yes" && (
              <>
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rate your experience</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => field.onChange(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  star <= (hoveredStar || rating || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                          {rating && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              {rating} star{rating !== 1 ? "s" : ""}
                            </span>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="review"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Review (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Share your experience with this tutor..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p className="text-muted-foreground">
                    Your payment will be released to {tutorName} on the next
                    biweekly payout date. Your rating and review will be added
                    to their profile.
                  </p>
                </div>
              </>
            )}

            {/* If No - Issue Reporting */}
            {sessionHappened === "no" && (
              <>
                <FormField
                  control={form.control}
                  name="issueReason"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>What happened?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <RadioGroupItem
                              value="tutor_no_show"
                              id="tutor_no_show"
                            />
                            <Label
                              htmlFor="tutor_no_show"
                              className="flex-1 cursor-pointer"
                            >
                              Tutor didn't show up
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <RadioGroupItem
                              value="rescheduled"
                              id="rescheduled"
                            />
                            <Label
                              htmlFor="rescheduled"
                              className="flex-1 cursor-pointer"
                            >
                              Session was rescheduled
                            </Label>
                          </div>
                          <div className="flex items-center space-x-3 rounded-lg border p-3">
                            <RadioGroupItem value="other" id="other" />
                            <Label
                              htmlFor="other"
                              className="flex-1 cursor-pointer"
                            >
                              Other issue
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4 text-sm">
                  <p className="font-medium text-amber-900 dark:text-amber-100 mb-1">
                    Support Review
                  </p>
                  <p className="text-amber-700 dark:text-amber-300">
                    Our support team will review your report and contact you
                    within 48 hours to resolve the issue.
                  </p>
                </div>
              </>
            )}

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
              <Button
                type="submit"
                disabled={
                  isLoading ||
                  !sessionHappened ||
                  (sessionHappened === "yes" && !rating) ||
                  (sessionHappened === "no" && !form.watch("issueReason"))
                }
              >
                {isLoading
                  ? "Submitting..."
                  : sessionHappened === "yes"
                  ? "Submit & Release Payment"
                  : "Report Issue"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
