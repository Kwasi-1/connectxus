import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  reportPost,
  reportComment,
  reportMessage,
  reportUser,
  CreateReportRequest,
} from "@/api/reports.api";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "post" | "comment" | "message" | "user";
  targetId: string;
  targetDescription?: string;
}

const REPORT_REASONS = {
  post: [
    "spam",
    "harassment",
    "hate_speech",
    "misinformation",
    "inappropriate_content",
    "other",
  ],
  comment: [
    "spam",
    "harassment",
    "hate_speech",
    "inappropriate_content",
    "other",
  ],
  message: [
    "spam",
    "harassment",
    "threats",
    "inappropriate_content",
    "other",
  ],
  user: [
    "harassment",
    "impersonation",
    "spam_account",
    "inappropriate_behavior",
    "other",
  ],
};

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  harassment: "Harassment or Bullying",
  hate_speech: "Hate Speech",
  misinformation: "False Information",
  inappropriate_content: "Inappropriate Content",
  threats: "Threats or Violence",
  impersonation: "Impersonation",
  spam_account: "Spam Account",
  inappropriate_behavior: "Inappropriate Behavior",
  other: "Other",
};

export function ReportModal({
  isOpen,
  onClose,
  type,
  targetId,
  targetDescription = "",
}: ReportModalProps) {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  });

  const reportMutation = useMutation({
    mutationFn: (data: CreateReportRequest) => {
      switch (type) {
        case "post":
          return reportPost(targetId, data);
        case "comment":
          return reportComment(targetId, data);
        case "message":
          return reportMessage(targetId, data);
        case "user":
          return reportUser(targetId, data);
        default:
          throw new Error("Invalid report type");
      }
    },
    onSuccess: () => {
      toast.success("Report submitted successfully. Thank you for helping keep our community safe.");
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || "Failed to submit report");
    },
  });

  const handleClose = () => {
    setFormData({
      reason: "",
      description: "",
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reason || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.description.length > 1000) {
      toast.error("Description must be less than 1000 characters");
      return;
    }

    reportMutation.mutate(formData);
  };

  const getTitle = () => {
    switch (type) {
      case "post":
        return "Report Post";
      case "comment":
        return "Report Comment";
      case "message":
        return "Report Message";
      case "user":
        return "Report User";
      default:
        return "Report Content";
    }
  };

  const getDescription = () => {
    return `Help us understand what's wrong with this ${type}. Your report is anonymous.`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Select
              value={formData.reason}
              onValueChange={(value) =>
                setFormData({ ...formData, reason: value })
              }
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REPORT_REASONS[type].map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {REASON_LABELS[reason]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Please provide specific details about why you're reporting this..."
              rows={5}
              maxLength={1000}
              required
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {targetDescription && (
            <div className="rounded-lg border p-3 bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Reporting: {targetDescription}
              </p>
            </div>
          )}

          <div className="rounded-lg border p-3 bg-muted/50">
            <p className="text-xs text-muted-foreground">
              Your report will be reviewed by our moderation team. False reports may result in action against your account.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={reportMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={reportMutation.isPending}
            >
              {reportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
