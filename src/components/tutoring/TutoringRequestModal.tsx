import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TutorProfile } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { createTutoringSession } from "@/api/mentorship.api";
import { getValidatedSpaceId } from "@/lib/apiClient";

interface TutoringRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: TutorProfile;
}

export function TutoringRequestModal({
  isOpen,
  onClose,
  tutor,
}: TutoringRequestModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [preferredTimes, setPreferredTimes] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60);

  const createSessionMutation = useMutation({
    mutationFn: (data: {
      tutor_id: string;
      scheduled_at: string;
      duration_minutes: number;
      subject?: string;
    }) => createTutoringSession(data),
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: `Your tutoring request has been sent to ${tutor.username || tutor.user?.username}. They will respond soon.`,
      });
      onClose();
            setSubject("");
      setMessage("");
      setPreferredTimes("");
      setScheduledDate("");
      setDuration(60);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send tutoring request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

        const scheduledAt = scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    createSessionMutation.mutate({
      tutor_id: tutor.user_id || tutor.user?.id || '',
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      subject: subject || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Tutoring Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Select a subject..."
              required
            />
          </div>

          <div>
            <Label htmlFor="scheduled">Scheduled Date & Time</Label>
            <Input
              id="scheduled"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              placeholder="60"
              min="30"
              max="180"
              step="15"
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the tutor about your learning goals and what you need help with..."
              rows={4}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
