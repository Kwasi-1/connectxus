import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, UserCheck, Clock } from "lucide-react";
import { Event } from "@/api/events.api";
import moment from "moment";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  showRegistrationStatus?: boolean;
}

export const EventCard = ({ event, onClick, showRegistrationStatus = true }: EventCardProps) => {
  const isPast = new Date(event.end_date) < new Date();
  const isFull = event.max_attendees && event.registered_count >= event.max_attendees;
  const isUpcoming = new Date(event.start_date) > new Date();

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {event.image_url && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-lg line-clamp-2">{event.title}</h3>
            {showRegistrationStatus && event.is_registered && (
              <Badge variant="secondary" className="shrink-0">
                <UserCheck className="h-3 w-3 mr-1" />
                Registered
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{event.category}</Badge>
            {isPast && <Badge variant="secondary">Past</Badge>}
            {isFull && <Badge variant="destructive">Full</Badge>}
            {isUpcoming && <Badge variant="default">Upcoming</Badge>}
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        )}

        {/* Date & Time */}
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
          <div>
            <p className="font-medium">{moment(event.start_date).format("MMM D, YYYY")}</p>
            <p className="text-muted-foreground">
              {moment(event.start_date).format("h:mm A")} -{" "}
              {moment(event.end_date).format("h:mm A")}
            </p>
          </div>
        </div>

        {/* Location */}
        {event.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-muted-foreground truncate">{event.location}</p>
          </div>
        )}

        {/* Registration Info */}
        {event.registration_required && (
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
            <p className="text-muted-foreground">
              {event.registered_count} registered
              {event.max_attendees && ` / ${event.max_attendees} max`}
            </p>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{event.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
