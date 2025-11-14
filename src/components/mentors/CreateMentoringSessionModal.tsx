import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import {
  createMentoringSession,
  getMyMentorProfile,
} from "@/api/mentorship.api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface CreateMentoringSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateMentoringSessionModal = ({
  open,
  onOpenChange,
}: CreateMentoringSessionModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: mentorProfile } = useQuery({
    queryKey: ["my-mentor-profile"],
    queryFn: () => getMyMentorProfile(),
    enabled: !!user && open,
    retry: false,
  });

  const [formData, setFormData] = useState({
    mentee_id: "",
    topic: "",
    scheduled_at: "",
    duration: 60,
    mentee_notes: "",
  });

  const createSessionMutation = useMutation({
    mutationFn: createMentoringSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mentoring-sessions"] });
      toast.success("Mentoring session created successfully!");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create mentoring session"
      );
    },
  });

  const resetForm = () => {
    setFormData({
      mentee_id: "",
      topic: "",
      scheduled_at: "",
      duration: 60,
      mentee_notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mentorProfile?.user_id) {
      toast.error("Unable to find your mentor profile");
      return;
    }

    if (!formData.topic || !formData.scheduled_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    createSessionMutation.mutate({
      mentor_id: mentorProfile.user_id,
      topic: formData.topic,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      duration: formData.duration,
      mentee_notes: formData.mentee_notes || undefined,
    });
  };

  if (!mentorProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Mentoring Session</DialogTitle>
            <DialogDescription>
              You need to be a mentor to create sessions
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You don't have a mentor profile. Please apply to become a mentor
              first.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Mentoring Session</DialogTitle>
          <DialogDescription>
            Schedule a new mentoring session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">
              Topic <span className="text-red-500">*</span>
            </Label>
            <Input
              id="topic"
              placeholder="e.g. Career guidance, Leadership"
              value={formData.topic}
              onChange={(e) =>
                setFormData({ ...formData, topic: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_at">
              Scheduled Date & Time <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_at: e.target.value })
                }
                required
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              min="15"
              step="15"
              value={formData.duration}
              onChange={(e) =>
                setFormData({ ...formData, duration: parseInt(e.target.value) })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mentee_notes">Notes (optional)</Label>
            <Textarea
              id="mentee_notes"
              placeholder="Additional information about the session..."
              value={formData.mentee_notes}
              onChange={(e) =>
                setFormData({ ...formData, mentee_notes: e.target.value })
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending
                ? "Creating..."
                : "Create Session"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
