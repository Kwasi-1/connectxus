
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TutorProfile } from '@/types/global';
import { useToast } from '@/hooks/use-toast';

interface TutoringRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tutor: TutorProfile;
}

export function TutoringRequestModal({ isOpen, onClose, tutor }: TutoringRequestModalProps) {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [preferredTimes, setPreferredTimes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Request Sent!",
      description: `Your tutoring request has been sent to ${tutor.user.displayName}. They will respond within 24 hours.`,
    });

    setIsSubmitting(false);
    onClose();
    
    // Reset form
    setSubject('');
    setMessage('');
    setPreferredTimes('');
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
            <Label htmlFor="times">Preferred Times</Label>
            <Input
              id="times"
              value={preferredTimes}
              onChange={(e) => setPreferredTimes(e.target.value)}
              placeholder="e.g., Monday 2-4 PM, Tuesday 10-12 AM"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
