import { format } from "date-fns";
import { CalendarDays, Clock, IndianRupee, ListChecks, Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function DestinationCard({
  destination,
  tripId,
  activityCount,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  const navigate = useNavigate();

  return (
    <Card className="group py-0">
      <div className="p-3.5 space-y-2">

        {/* Name + action buttons */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{destination.name}</p>
          <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {canEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onEdit(destination)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(destination)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Compact meta row */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3 shrink-0" />
            {format(new Date(destination.visitDate), "MMM d, yyyy")}
          </span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 shrink-0" />
            {destination.visitTime}
          </span>
          <span className="opacity-30">·</span>
          <span className="flex items-center gap-1">
            <IndianRupee className="h-3 w-3 shrink-0" />
            {destination.estimatedCost}
          </span>
        </div>

        {/* Description */}
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {destination.description}
        </p>

        {/* Footer */}
        {destination.createdBy?.fullName && (
          <p className="text-[10px] text-muted-foreground/50">
            Added by {destination.createdBy.fullName}
          </p>
        )}

        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-center text-xs"
          onClick={() => navigate(`/trips/${tripId}/destinations/${destination._id}/activities`)}
        >
          <ListChecks className="mr-1.5 h-3.5 w-3.5" />
          Activities ({activityCount ?? 0})
        </Button>
      </div>
    </Card>
  );
}

export default function DestinationList({
  destinations,
  loading,
  tripId,
  activityCounts = {},
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((dest) => (
        <DestinationCard
          key={dest._id}
          destination={dest}
          tripId={tripId}
          activityCount={activityCounts[dest._id]}
          canEdit={canEdit}
          canDelete={canDelete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
