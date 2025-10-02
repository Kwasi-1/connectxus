import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RoleApplication, ProjectRole } from '@/types/communities';
import { Check, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectRoleApplicationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: ProjectRole;
  onAcceptApplication: (applicationId: string) => void;
  onRejectApplication: (applicationId: string) => void;
}

export const ProjectRoleApplicationsModal = ({
  open,
  onOpenChange,
  role,
  onAcceptApplication,
  onRejectApplication,
}: ProjectRoleApplicationsModalProps) => {
  const { toast } = useToast();
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingApplications = role.applications.filter(app => app.status === 'pending');
  const acceptedApplications = role.applications.filter(app => app.status === 'accepted');

  const handleAccept = async (applicationId: string) => {
    setProcessingId(applicationId);
    await new Promise(resolve => setTimeout(resolve, 500));
    onAcceptApplication(applicationId);
    setProcessingId(null);
    toast({
      title: "Application accepted",
      description: "The applicant has been added to the role",
    });
  };

  const handleReject = async (applicationId: string) => {
    setProcessingId(applicationId);
    await new Promise(resolve => setTimeout(resolve, 500));
    onRejectApplication(applicationId);
    setProcessingId(null);
    toast({
      title: "Application rejected",
      description: "The applicant has been notified",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{role.name} Applications</DialogTitle>
          <DialogDescription>
            {role.slotsFilled} of {role.slotsTotal} slots filled • {pendingApplications.length} pending application{pendingApplications.length !== 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[500px] pr-4">
          <div className="space-y-6">
            {pendingApplications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Pending Applications
                </h3>
                <div className="space-y-3">
                  {pendingApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onAccept={() => handleAccept(application.id)}
                      onReject={() => handleReject(application.id)}
                      isProcessing={processingId === application.id}
                      canAccept={role.slotsFilled < role.slotsTotal}
                    />
                  ))}
                </div>
              </div>
            )}

            {acceptedApplications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  Accepted Members
                </h3>
                <div className="space-y-3">
                  {acceptedApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      isAccepted
                    />
                  ))}
                </div>
              </div>
            )}

            {pendingApplications.length === 0 && acceptedApplications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No applications yet
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

interface ApplicationCardProps {
  application: RoleApplication;
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
  canAccept?: boolean;
  isAccepted?: boolean;
}

const ApplicationCard = ({
  application,
  onAccept,
  onReject,
  isProcessing,
  canAccept = true,
  isAccepted = false,
}: ApplicationCardProps) => {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={application.userAvatar} alt={application.userName} />
            <AvatarFallback>
              {application.userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{application.userName}</h4>
            <p className="text-xs text-muted-foreground">
              Applied {application.appliedAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        {isAccepted && (
          <Badge variant="secondary" className="gap-1">
            <Check className="h-3 w-3" />
            Accepted
          </Badge>
        )}
      </div>

      <div className="bg-muted/50 rounded p-3">
        <p className="text-sm">{application.message}</p>
      </div>

      {!isAccepted && onAccept && onReject && (
        <div className="flex gap-2">
          <Button
            onClick={onAccept}
            size="sm"
            disabled={isProcessing || !canAccept}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            size="sm"
            disabled={isProcessing}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
};
