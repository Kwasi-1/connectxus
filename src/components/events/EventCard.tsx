import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Eye } from "lucide-react";
import { Event } from "@/api/events.api";
import moment from "moment";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: Event;
  onClick?: () => void;
  showRegistrationStatus?: boolean;
}

export const EventCard = ({
  event,
  onClick,
  showRegistrationStatus = true,
}: EventCardProps) => {
  const startDate = moment(event.start_date);

  const month = startDate.format("MMM").toUpperCase(); // JAN
  const day = startDate.format("DD"); // 03
  const time = startDate.format("HH:mm"); // 21:30

  const locationParts = event.location ? event.location.split(",") : ["TBD"];
  const locationName = locationParts[0].trim();
  const locationSub = locationParts.length > 1 ? locationParts[1].trim() : "";

  return (
    <Card
      onClick={onClick}
      className={cn(
        "group relative rounded-none overflow-hidden cursor-pointer",
        "shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full isolate"
      )}
    >
      {/* Header Image Section */}
      <div className="relative h-36 w-full bg-muted overflow-hidden shrink-0">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-primary/5">
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
              No Image
            </div>
          </div>
        )}

        {/* Top Left Badge (Yellow) */}
        {/* <div className="absolute top-6 left-0 bg-[#FCD34D] text-slate-900 font-bold text-sm px-4 py-1.5 rounded-r-xl shadow-sm z-10 tracking-wide">
          {event.category || "Event"}
        </div> */}
      </div>

      {/* Content Section */}
      <div className="py-4 px-5 flex flex-col gap-5 grow">
        {/* Title */}
        <div className="relative w-fit">
          <h3 className="text-xl font-semibold text-foreground leading-tight z-10 relative line-clamp-2 custom-font capitalize">
            {event.title}
          </h3>
        </div>

        {/* Info Row: Date + Details */}
        <div className="flex items-start gap-5 pt-1">
          {/* Date Column - Big and Bold */}
          <div className="flex flex-col items-center leading-none shrink-0 min-w-[3rem]">
            <span className="text-4xl custom-font font-[500] text-muted-foreground/80 tracking-tightest">
              {day}
            </span>
            <span className="text-sm font-bold text-muted-foreground uppercase mt-1 tracking-wider">
              {month}
            </span>
          </div>

          {/* Details Column */}
          <div className="flex-1 flex flex-col gap-3 min-w-0">
            {/* Location */}
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-1 shrink-0 text-muted-foreground" />
              <div className="text-sm font-medium leading-snug truncate w-full">
                <span className="block text-foreground font-medium truncate">
                  {locationName}
                </span>
                {locationSub ? (
                  <span className="block text-muted-foreground text-xs truncate">
                    {locationSub}
                  </span>
                ) : (
                  <span className="block text-muted-foreground text-xs truncate opacity-0">
                    .
                  </span>
                )}
              </div>
            </div>

            {/* Time */}
            <div className="flex items-center gap-2.5">
              <Clock className="w-4 h-4 shrink-0 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {time}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Button - Pushed to bottom */}
        <div className="mt-auto pt2 flex items-center justify-end">
          {event.registration_required ? (
            <Button            
              variant="outline"
              className="rounded-full text-muted-foreground font-medium gap-2">
              Register
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-muted-foreground font-medium gap-2"
            >
              {/* <Eye className="w-4 h-4" /> */}
              View Details
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
