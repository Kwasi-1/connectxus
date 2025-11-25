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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TutorProfile } from "@/api/mentorship.api";
import { BookOpen, Clock, DollarSign } from "lucide-react";

const requestSchema = z.object({
  subject: z.string().min(1, "Please select a subject"),
  topic: z.string().min(10, "Please provide at least 10 characters"),
  preferredSchedule: z
    .array(z.string())
    .min(1, "Please select at least one time slot"),
  sessionType: z.enum(["single", "semester"], {
    required_error: "Please select a session type",
  }),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestTutoringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: TutorProfile;
  onSubmit: (data: RequestFormData) => void;
  isLoading?: boolean;
}

const scheduleOptions = [
  { id: "morning", label: "Morning (8AM - 12PM)" },
  { id: "afternoon", label: "Afternoon (12PM - 5PM)" },
  { id: "evening", label: "Evening (5PM - 9PM)" },
];

export function RequestTutoringModal({
  open,
  onOpenChange,
  tutor,
  onSubmit,
  isLoading = false,
}: RequestTutoringModalProps) {
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      subject: "",
      topic: "",
      preferredSchedule: [],
      sessionType: "single",
    },
  });

  const handleSubmit = (data: RequestFormData) => {
    onSubmit(data);
  };

  const tutorName = tutor.full_name || tutor.username || "this tutor";
  const hourlyRate = tutor.hourly_rate || 25;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Request Tutoring Session
          </DialogTitle>
          <DialogDescription>
            Request a tutoring session with {tutorName}. They'll have 24 hours
            to respond.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Subject Selection */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {tutor.subjects?.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Topic/Description */}
            <FormField
              control={form.control}
              name="topic"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic / What you need help with</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you'd like to learn or work on..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Schedule */}
            <FormField
              control={form.control}
              name="preferredSchedule"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Preferred Schedule
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Select all time slots that work for you
                    </p>
                  </div>
                  {scheduleOptions.map((option) => (
                    <FormField
                      key={option.id}
                      control={form.control}
                      name="preferredSchedule"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={option.id}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        option.id,
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== option.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              {option.label}
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Session Type */}
            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Session Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors">
                        <RadioGroupItem value="single" id="single" />
                        <Label
                          htmlFor="single"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Single Session</p>
                              <p className="text-sm text-muted-foreground">
                                One tutoring session
                              </p>
                            </div>
                            <div className="flex items-center text-lg font-semibold">
                              <DollarSign className="h-5 w-5" />
                              {hourlyRate}
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors">
                        <RadioGroupItem value="semester" id="semester" />
                        <Label
                          htmlFor="semester"
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Semester Package</p>
                              <p className="text-sm text-muted-foreground">
                                12 sessions with 15% discount
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-muted-foreground">
                                ${hourlyRate * 12}
                              </span>
                              <div className="flex items-center text-lg font-semibold">
                                <DollarSign className="h-5 w-5" />
                                {Math.round(hourlyRate * 12 * 0.85)}
                              </div>
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Info Notice */}
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {tutorName} will be notified of your request</li>
                <li>• They have 24 hours to accept or decline</li>
                <li>
                  • If accepted, you'll proceed to payment to confirm the
                  session
                </li>
                <li>• After payment, you can message them to schedule</li>
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
                {isLoading ? "Sending Request..." : "Send Request"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
