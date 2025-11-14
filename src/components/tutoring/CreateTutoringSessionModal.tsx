import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { createTutoringSession, getMyTutorProfile } from "@/api/mentorship.api";
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

interface CreateTutoringSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateTutoringSessionModal = ({
  open,
  onOpenChange,
}: CreateTutoringSessionModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tutorProfile } = useQuery({
    queryKey: ["my-tutor-profile"],
    queryFn: () => getMyTutorProfile(),
    enabled: !!user && open,
    retry: false,
  });

  const [formData, setFormData] = useState({
    student_id: "",
    subject: "",
    scheduled_at: "",
    duration: 60,
    hourly_rate: "",
    student_notes: "",
  });

  const createSessionMutation = useMutation({
    mutationFn: createTutoringSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tutoring-sessions"] });
      toast.success("Tutoring session created successfully!");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create tutoring session"
      );
    },
  });

  const resetForm = () => {
    setFormData({
      student_id: "",
      subject: "",
      scheduled_at: "",
      duration: 60,
      hourly_rate: "",
      student_notes: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tutorProfile?.user_id) {
      toast.error("Unable to find your tutor profile");
      return;
    }

    if (!formData.subject || !formData.scheduled_at) {
      toast.error("Please fill in all required fields");
      return;
    }

    createSessionMutation.mutate({
      tutor_id: tutorProfile.user_id,
      subject: formData.subject,
      scheduled_at: new Date(formData.scheduled_at).toISOString(),
      duration: formData.duration,
      hourly_rate: formData.hourly_rate || undefined,
      student_notes: formData.student_notes || undefined,
    });
  };

  if (!tutorProfile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Tutoring Session</DialogTitle>
            <DialogDescription>
              You need to be a tutor to create sessions
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-muted-foreground">
              You don't have a tutor profile. Please apply to become a tutor
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
          <DialogTitle>Create Tutoring Session</DialogTitle>
          <DialogDescription>Schedule a new tutoring session</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subject <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="e.g. Mathematics, Physics"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
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
            <Label htmlFor="hourly_rate">Hourly Rate (optional)</Label>
            <Input
              id="hourly_rate"
              type="text"
              placeholder="e.g. 50.00"
              value={formData.hourly_rate}
              onChange={(e) =>
                setFormData({ ...formData, hourly_rate: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_notes">Notes (optional)</Label>
            <Textarea
              id="student_notes"
              placeholder="Additional information about the session..."
              value={formData.student_notes}
              onChange={(e) =>
                setFormData({ ...formData, student_notes: e.target.value })
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
