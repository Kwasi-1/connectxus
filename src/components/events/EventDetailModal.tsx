import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  UserCheck,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Event,
  registerForEvent,
  unregisterFromEvent,
  deleteEvent,
  getEventAttendees,
} from "@/api/events.api";
import { toast } from "sonner";
import moment from "moment";

interface EventDetailModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const EventDetailModal = ({
  event,
  open,
  onOpenChange,
  canManage = false,
  onEdit,
  onDelete,
}: EventDetailModalProps) => {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: attendees = [] } = useQuery({
    queryKey: ["event-attendees", event.id],
    queryFn: () => getEventAttendees(event.id, { limit: 10 }),
    enabled: open && canManage,
  });

  const registerMutation = useMutation({
    mutationFn: () => registerForEvent(event.id),
    onSuccess: () => {
      toast.success("Successfully registered for event");
      queryClient.invalidateQueries({ queryKey: ["group-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["group-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", event.id] });
    },
    onError: () => {
      toast.error("Failed to register for event");
    },
  });

  const unregisterMutation = useMutation({
    mutationFn: () => unregisterFromEvent(event.id),
    onSuccess: () => {
      toast.success("Successfully unregistered from event");
      queryClient.invalidateQueries({ queryKey: ["group-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["group-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["event-attendees", event.id] });
    },
    onError: () => {
      toast.error("Failed to unregister from event");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(event.id),
    onSuccess: () => {
      toast.success("Event deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["group-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-events"] });
      queryClient.invalidateQueries({ queryKey: ["group-upcoming-events"] });
      queryClient.invalidateQueries({ queryKey: ["community-upcoming-events"] });
      onOpenChange(false);
      onDelete?.();
    },
    onError: () => {
      toast.error("Failed to delete event");
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
    setShowDeleteDialog(false);
  };

  const isRegistrationOpen = () => {
    const now = new Date();
    const startDate = new Date(event.start_date);

    if (now >= startDate) return false;

    if (event.max_attendees && event.registered_count >= event.max_attendees) {
      return false;
    }

    if (event.registration_required && event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      if (now >= deadline) return false;
    }

    return true;
  };

  const isFull = event.max_attendees && event.registered_count >= event.max_attendees;
  const isPast = new Date(event.end_date) < new Date();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl">{event.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary">{event.category}</Badge>
                  {isPast && <Badge variant="outline">Past Event</Badge>}
                  {isFull && <Badge variant="destructive">Full</Badge>}
                  {event.is_public && <Badge>Public</Badge>}
                </div>
              </div>

              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Event
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Event
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {event.image_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {event.description && (
              <div>
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
              </div>
            )}

            <Separator />

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {moment(event.start_date).format("dddd, MMMM D, YYYY")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {moment(event.start_date).format("h:mm A")} -{" "}
                    {moment(event.end_date).format("h:mm A")}
                  </p>
                </div>
              </div>

              {event.timezone && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{event.timezone}</p>
                </div>
              )}
            </div>

            {event.location && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{event.location}</p>
                  {event.venue_details && (
                    <p className="text-sm text-muted-foreground mt-1">{event.venue_details}</p>
                  )}
                </div>
              </div>
            )}

            {event.registration_required && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">
                    {event.registered_count} registered
                    {event.max_attendees && ` / ${event.max_attendees} max`}
                  </p>
                  {event.registration_deadline && (
                    <p className="text-sm text-muted-foreground">
                      Registration closes:{" "}
                      {moment(event.registration_deadline).format("MMM D, YYYY h:mm A")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {canManage && attendees.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Recent Attendees</h3>
                <div className="space-y-2">
                  {attendees.slice(0, 5).map((attendee: any) => (
                    <div key={attendee.user_id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>
                          {attendee.full_name?.[0] || attendee.username?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{attendee.full_name}</p>
                        <p className="text-xs text-muted-foreground">@{attendee.username}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            {!canManage && !isPast && (
              <>
                {event.is_registered ? (
                  <Button
                    variant="outline"
                    onClick={() => unregisterMutation.mutate()}
                    disabled={unregisterMutation.isPending}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {unregisterMutation.isPending ? "Unregistering..." : "Unregister"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => registerMutation.mutate()}
                    disabled={registerMutation.isPending || !isRegistrationOpen()}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    {registerMutation.isPending
                      ? "Registering..."
                      : isFull
                      ? "Event Full"
                      : "Register"}
                  </Button>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone and all
              registrations will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
