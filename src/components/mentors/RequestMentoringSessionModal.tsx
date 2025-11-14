import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createMentorshipRequest } from '@/api/mentorship.api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare } from 'lucide-react';

interface RequestMentoringSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  sessionTopic: string;
  mentorName: string;
}

export const RequestMentoringSessionModal = ({
  open,
  onOpenChange,
  sessionId,
  sessionTopic,
  mentorName,
}: RequestMentoringSessionModalProps) => {
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');

  const requestMutation = useMutation({
    mutationFn: createMentorshipRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentorship-requests'] });
      queryClient.invalidateQueries({ queryKey: ['available-mentoring-sessions'] });
      toast.success('Request sent successfully!');
      onOpenChange(false);
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send request');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!sessionId) {
      toast.error('Invalid session');
      return;
    }

    requestMutation.mutate({
      session_id: sessionId,
      message: message || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Mentoring Session
          </DialogTitle>
          <DialogDescription>
            Request to join this mentoring session with {mentorName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="font-semibold">Session Topic</Label>
            <p className="text-sm text-muted-foreground">{sessionTopic}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you want to join this session..."
              className="min-h-[100px]"
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
            <Button type="submit" disabled={requestMutation.isPending}>
              {requestMutation.isPending ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
