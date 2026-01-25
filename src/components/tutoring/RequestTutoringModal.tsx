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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { TutorProfile } from "@/api/tutoring.api";
import { BookOpen, Clock, DollarSign, Calendar } from "lucide-react";

const requestSchema = z.object({
  message: z.string().min(10, "Please provide at least 10 characters"),
  schedules: z.array(z.string()).min(1, "Please select at least one schedule"),
  sessionType: z.enum(["single", "semester"], {
    required_error: "Please select a session type",
  }),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestTutoringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutor: TutorProfile;
  onSubmit: (data: RequestFormData & { schedules: string[] }) => void;
  isLoading?: boolean;
}

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
      message: "",
      schedules: [],
      sessionType: "single",
    },
  });

  const sessionType = form.watch("sessionType");
  const selectedSchedules = form.watch("schedules");

  const handleSubmit = (data: RequestFormData) => {
    onSubmit(data);
  };

  const tutorName = tutor.full_name || tutor.username || "this tutor";
  const sessionRate = tutor.session_rate ? parseFloat(tutor.session_rate) : 25;
  const semesterRate = tutor.semester_rate
    ? parseFloat(tutor.semester_rate)
    : sessionRate * 12 * 0.85;

  const availableSchedules =
    tutor.availability && tutor.availability.length > 0
      ? tutor.availability
      : [
          "Monday 9AM - 12PM",
          "Tuesday 2PM - 5PM",
          "Wednesday 9AM - 12PM",
          "Thursday 2PM - 5PM",
          "Friday 9AM - 12PM",
        ];

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
            <FormField
              control={form.control}
              name="sessionType"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Session Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={(value) => {
                        field.onChange(value);
                        form.setValue("schedules", []);
                      }}
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
                                One tutoring session - Select 1 time slot
                              </p>
                            </div>
                            <div className="flex items-center text-lg font-semibold">
                              <DollarSign className="h-5 w-5" />
                              {sessionRate.toFixed(2)}
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
                                Multiple sessions - Select your preferred times
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center text-lg font-semibold">
                                <DollarSign className="h-5 w-5" />
                                {semesterRate.toFixed(2)}
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

            <FormField
              control={form.control}
              name="schedules"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Available Time Slots
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">
                      {sessionType === "single"
                        ? "Select 1 time slot that works for you"
                        : "Select one or more time slots for your sessions"}
                    </p>
                  </div>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {availableSchedules.map((schedule, index) => (
                      <FormField
                        key={index}
                        control={form.control}
                        name="schedules"
                        render={({ field }) => {
                          const isChecked = field.value?.includes(schedule);
                          const canSelect =
                            sessionType === "semester" ||
                            !field.value?.length ||
                            isChecked;

                          return (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={isChecked}
                                  disabled={!canSelect}
                                  onCheckedChange={(checked) => {
                                    if (sessionType === "single") {
                                      field.onChange(checked ? [schedule] : []);
                                    } else {
                                      return checked
                                        ? field.onChange([
                                            ...field.value,
                                            schedule,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== schedule
                                            )
                                          );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {schedule}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  {selectedSchedules.length > 0 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Selected: {selectedSchedules.length} time slot
                      {selectedSchedules.length !== 1 ? "s" : ""}
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What you need help with</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what you'd like to learn or work on in this subject..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium mb-2">What happens next?</p>
              <ul className="space-y-1 text-muted-foreground">
                <li>• {tutorName} will be notified of your request</li>
                <li>• They have 24 hours to accept or decline</li>
                <li>
                  • If accepted, you'll proceed to payment to confirm the
                  session
                </li>
                <li>
                  • After payment, you can message them to finalize schedule
                </li>
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
