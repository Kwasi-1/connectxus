import { Badge } from "@/components/ui/badge";
import { UserCheck } from "lucide-react";
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

  // Extract date parts for the badge
  const month = startDate.format("MMM");
  const dayNumber = startDate.format("D");
  const dayName = startDate.format("ddd").toUpperCase();
  const startTime = startDate.format("h:mm A");

  return (
    <div
      onClick={onClick}
      className="group relative w-full h-[28rem] md:h-[20rem] rounded-[0.9rem] overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 isolate bg-muted/20"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400 font-medium">No Image</span>
          </div>
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent z-10" />

      {/* Top Status Badges */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 items-end">
        {showRegistrationStatus && event.is_registered && (
          <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-md shadow-sm transition-all border-none font-semibold">
            <UserCheck className="h-3.5 w-3.5 mr-1" />
            Registered
          </Badge>
        )}
        {event.category && (
          <Badge
            variant="outline"
            className="bg-black/20 text-white border-white/20 backdrop-blur-md font-medium"
          >
            {event.category}
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-4 z-20 text-white flex flex-col gap-5">
        {/* Title */}
        <h3 className="text-2xl md:text-2xl font-semibold leading-[1.1] tracking-tight line-clamp-2 drop-shadow-sm">
          {event.title}
        </h3>

        {/* Bottom Row: Date Badge and Details */}
        <div className="flex items-end gap-3 md:gap-4">
          {/* Date Badge */}
          <div className="flex-shrink-0 w-[3.5rem] md:w-16 rounded-md overflow-hidden shadow-lg shadow-black/20 bg-white">
            <div className="bg-zinc-800 text-white text-[10px] md:text-xs font-bold text-center py-1 uppercase tracking-widest">
              {month}
            </div>
            <div className="bg-white text-zinc-900 flex flex-col items-center justify-center py-1.5 md:py-2">
              <span className="text-xl md:text-2xl font-black leading-none tracking-tighter">
                {dayNumber}
              </span>
              <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-zinc-500 mt-0.5">
                {dayName}
              </span>
            </div>
          </div>

          {/* Details (Location & Time) */}
          <div className="flex-1 flex items-end justify-between pb-0.5 min-w-0 gap-2">
            <div className="flex flex-col min-w-0 gap-0.5">
              <span className="font-semibold text-white/95 text-sm md:text-base truncate">
                {event.location?.split(",")[0] || "Location TBD"}
              </span>
              <span className="text-xs text-white/70 truncate max-w-[150px] md:max-w-[200px]">
                {event.location || "Details coming soon"}
              </span>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
              <span className="text-sm md:text-base font-medium text-white/95">
                {startTime}
              </span>
              <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
                Local
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
