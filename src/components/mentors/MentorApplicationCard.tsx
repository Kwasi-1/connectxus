
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MentorApplication } from '@/types/applications';
import { Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface MentorApplicationCardProps {
  application: MentorApplication;
  onEdit: (application: MentorApplication) => void;
  onDelete: (applicationId: string) => void;
}

export function MentorApplicationCard({ application, onEdit, onDelete }: MentorApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{application.industry} Mentor Application</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {application.company} • {application.position}
            </p>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Submitted: {format(application.submittedAt, 'MMM dd, yyyy')}
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            Experience: {application.experience} years
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Specialties:</h4>
          <div className="flex flex-wrap gap-1">
            {application.specialties.map((specialty, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Motivation:</h4>
          <p className="text-sm text-muted-foreground">{application.motivation}</p>
        </div>

        {application.reviewerNotes && (
          <div>
            <h4 className="font-medium mb-2">Review Notes:</h4>
            <p className="text-sm text-muted-foreground">{application.reviewerNotes}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(application)}
            disabled={application.status === 'approved'}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(application.id)}
            disabled={application.status === 'approved'}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
