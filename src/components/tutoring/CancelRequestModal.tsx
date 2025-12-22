import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";

interface CancelRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  isPaid?: boolean;
}

export function CancelRequestModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
  isPaid = false,
}: CancelRequestModalProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason(""); 
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Cancel Tutoring Request
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for cancelling this request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isPaid && (
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4 text-sm">
              <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                Refund Policy
              </p>
              <p className="text-yellow-800 dark:text-yellow-200">
                Since you've already paid, cancelling will initiate a refund request.
                The refund will be processed according to our refund policy.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for cancellation <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you're cancelling this request..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
            {reason.trim().length > 0 && reason.trim().length < 10 && (
              <p className="text-sm text-muted-foreground">
                Please provide at least 10 characters
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Keep Request
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading || reason.trim().length < 10}
          >
            {isLoading ? "Cancelling..." : "Cancel Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
