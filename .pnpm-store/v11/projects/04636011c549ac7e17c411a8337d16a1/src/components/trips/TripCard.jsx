import { differenceInDays, format } from "date-fns";
import {
  CalendarDays,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Receipt,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

function getTripStatus(trip) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return { label: "Upcoming", variant: "secondary" };
  if (now > end) return { label: "Completed", variant: "outline" };
  return { label: "Active", variant: "default" };
}

function MetaItem({ icon: Icon, label }) {
  return (
    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 shrink-0 text-primary/70" />
      {label}
    </span>
  );
}

function Dot() {
  return (
    <span className="text-muted-foreground/30 select-none" aria-hidden>
      •
    </span>
  );
}

export default function TripCard({
  trip,
  memberCount = 0,
  destinationCount = 0,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false,
}) {
  const navigate = useNavigate();
  const status = getTripStatus(trip);

  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const days = Math.max(differenceInDays(endDate, startDate), 1);
  const dateLabel = `${format(startDate, "MMM d")} – ${format(endDate, "MMM d, yyyy")}`;
  const ownerName = trip.owner?.fullName ?? trip.owner?.name ?? "—";

  return (
    <div
      className="group rounded-2xl border bg-card px-6 py-5 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      onClick={() => navigate(`/trips/${trip._id}`, { state: { trip } })}
    >
      {/* Top row: title + status badge + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-bold leading-tight truncate">{trip.title}</h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Badge
            variant={status.variant}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm"
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {status.label}
          </Badge>

          {(canEdit || canDelete) && (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => onEdit(trip)}
                  title="Edit trip"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  onClick={() => onDelete(trip)}
                  title="Delete trip"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <p className="mt-2 text-muted-foreground text-sm line-clamp-2 leading-relaxed">
          {trip.description}
        </p>
      )}

      <Separator className="my-4" />

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <MetaItem icon={CalendarDays} label={dateLabel} />
        <Dot />
        <MetaItem icon={Clock} label={`${days} day${days !== 1 ? "s" : ""}`} />
        <Dot />
        <MetaItem icon={User} label={ownerName} />
        <Dot />
        <MetaItem icon={Users} label={`${memberCount} member${memberCount !== 1 ? "s" : ""}`} />
        {destinationCount > 0 && (
          <>
            <Dot />
            <MetaItem icon={MapPin} label={`${destinationCount} destination${destinationCount !== 1 ? "s" : ""}`} />
          </>
        )}
      </div>

      {/* Quick-access tab buttons */}
      <div
        className="mt-3 flex items-center gap-1 flex-wrap"
        onClick={(e) => e.stopPropagation()}
      >
        {[
          { label: "Members", icon: Users, tab: "members" },
          { label: "Destinations", icon: MapPin, tab: "destinations" },
          { label: "Expenses", icon: Receipt, tab: "expenses" },
          { label: "Documents", icon: FileText, tab: "documents" },
        ].map(({ label, icon: Icon, tab }) => (
          <button
            key={tab}
            onClick={() =>
              navigate(`/trips/${trip._id}`, { state: { trip, activeTab: tab } })
            }
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
