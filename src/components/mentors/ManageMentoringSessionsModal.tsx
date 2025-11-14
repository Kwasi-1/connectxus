import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, Video, User, CheckCircle, XCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getMentoringSessions,
  updateMentoringSessionStatus,
  updateMentoringSessionMeetingLink,
  MentoringSession
} from '@/api/mentorship.api';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ManageMentoringSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ManageMentoringSessionsModal({ isOpen, onClose }: ManageMentoringSessionsModalProps) {
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<MentoringSession | null>(null);
  const [meetingLink, setMeetingLink] = useState('');

    const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['mentoring-sessions'],
    queryFn: () => getMentoringSessions(),
    enabled: isOpen,
  });

    const updateStatusMutation = useMutation({
    mutationFn: ({ sessionId, status }: { sessionId: string; status: 'scheduled' | 'completed' | 'cancelled' }) =>
      updateMentoringSessionStatus(sessionId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentoring-sessions'] });
      toast.success('Session status updated');
      setSelectedSession(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update session status');
    },
  });

    const addMeetingLinkMutation = useMutation({
    mutationFn: ({ sessionId, link }: { sessionId: string; link: string }) =>
      updateMentoringSessionMeetingLink(sessionId, link),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentoring-sessions'] });
      toast.success('Meeting link added');
      setMeetingLink('');
      setSelectedSession(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add meeting link');
    },
  });

  const handleAddMeetingLink = (session: MentoringSession) => {
    if (meetingLink.trim()) {
      addMeetingLinkMutation.mutate({ sessionId: session.id, link: meetingLink });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; color: string }> = {
      scheduled: { variant: 'default', color: 'bg-blue-500' },
      completed: { variant: 'secondary', color: 'bg-green-500' },
      cancelled: { variant: 'destructive', color: 'bg-red-500' },
    };
    const config = variants[status] || { variant: 'default', color: 'bg-gray-500' };
    return (
      <Badge variant={config.variant as any} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'PPp');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Mentoring Sessions</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="md" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground">You don't have any mentoring sessions scheduled.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Mentee ID: {session.mentee_id}</span>
                      </div>
                      {session.topic && (
                        <p className="text-sm font-medium">{session.topic}</p>
                      )}
                    </div>
                    {getStatusBadge(session.status)}
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDateTime(session.scheduled_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{session.duration_minutes} minutes</span>
                    </div>
                    {session.meeting_link && (
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        <a
                          href={session.meeting_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </div>
                    )}
                  </div>

                  {selectedSession?.id === session.id ? (
                    <div className="mt-4 space-y-3">
                      {!session.meeting_link && (
                        <div className="space-y-2">
                          <Label htmlFor="meeting-link">Add Meeting Link</Label>
                          <div className="flex gap-2">
                            <Input
                              id="meeting-link"
                              value={meetingLink}
                              onChange={(e) => setMeetingLink(e.target.value)}
                              placeholder="https://meet.google.com/..."
                            />
                            <Button
                              onClick={() => handleAddMeetingLink(session)}
                              disabled={!meetingLink.trim() || addMeetingLinkMutation.isPending}
                            >
                              Add
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        {session.status === 'scheduled' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                updateStatusMutation.mutate({ sessionId: session.id, status: 'completed' })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Complete
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateStatusMutation.mutate({ sessionId: session.id, status: 'cancelled' })
                              }
                              disabled={updateStatusMutation.isPending}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => setSelectedSession(null)}>
                          Close
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSession(session)}>
                        Manage
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
