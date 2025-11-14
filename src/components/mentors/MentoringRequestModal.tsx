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
import { MentorProfile } from "@/types/global";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { createMentoringSession } from "@/api/mentorship.api";

interface MentoringRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorProfile;
}

export function MentoringRequestModal({
  isOpen,
  onClose,
  mentor,
}: MentoringRequestModalProps) {
  const { toast } = useToast();
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState(60);

  const createSessionMutation = useMutation({
    mutationFn: (data: {
      mentor_id: string;
      scheduled_at: string;
      duration_minutes: number;
      topic?: string;
    }) => createMentoringSession(data),
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: `Your mentoring request has been sent to ${mentor.username || mentor.user?.username}. They will respond soon.`,
      });
      onClose();
            setTopic("");
      setMessage("");
      setScheduledDate("");
      setDuration(60);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send mentoring request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

        const scheduledAt = scheduledDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    createSessionMutation.mutate({
      mentor_id: mentor.user_id || mentor.user?.id || '',
      scheduled_at: scheduledAt,
      duration_minutes: duration,
      topic: topic || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Mentoring Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Career guidance, Interview prep, etc."
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
              placeholder="Tell the mentor about your goals and what you'd like to discuss..."
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
