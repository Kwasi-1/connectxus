import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TutorApplication as ApiTutorApplication } from "@/api/mentorship.api";
import { Calendar, Clock, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";

interface TutorApplicationCardProps {
  application: ApiTutorApplication;
  onEdit: () => void;
}

export function TutorApplicationCard({
  application,
  onEdit,
}: TutorApplicationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Tutoring Application</CardTitle>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {application.status.charAt(0).toUpperCase() +
              application.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            Submitted:{" "}
            {format(new Date(application.submitted_at), "MMM dd, yyyy")}
          </div>
          {application.availability && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
              {Array.isArray(application.availability)
                ? application.availability.length
                : 0}{" "}
              time slots
            </div>
          )}
        </div>

        {application.subjects && application.subjects.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Subjects:</h4>
            <div className="flex flex-wrap gap-1">
              {application.subjects.map((subject, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {application.motivation && (
          <div>
            <h4 className="font-medium mb-2">Motivation:</h4>
            <p className="text-sm text-muted-foreground">
              {application.motivation}
            </p>
          </div>
        )}

        {application.reviewer_notes && (
          <div>
            <h4 className="font-medium mb-2">Review Notes:</h4>
            <p className="text-sm text-muted-foreground">
              {application.reviewer_notes}
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            // disabled={application.status === "approved"}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {/* <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(application.id)}
            disabled={application.status === "approved"}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
