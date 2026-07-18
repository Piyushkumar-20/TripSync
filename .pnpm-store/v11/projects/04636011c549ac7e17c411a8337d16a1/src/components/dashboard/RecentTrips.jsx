import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";

function getTripStatus(trip) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return { label: "Upcoming", variant: "secondary" };
  if (now > end) return { label: "Completed", variant: "outline" };
  return { label: "Active", variant: "default" };
}

export default function RecentTrips({ trips, loading }) {
  const navigate = useNavigate();
  const recent = trips?.slice(0, 4) ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Recent Trips</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No trips yet"
            description="Create your first trip to get started."
          />
        ) : (
          <div className="space-y-2">
            {recent.map((trip) => {
              const status = getTripStatus(trip);
              return (
                <div
                  key={trip._id}
                  onClick={() => navigate(`/trips/${trip._id}`, { state: { trip } })}
                  className="flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{trip.title}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <CalendarDays className="h-3 w-3" />
                      {format(new Date(trip.startDate), "MMM d")} –{" "}
                      {format(new Date(trip.endDate), "MMM d, yyyy")}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="ml-3 shrink-0">
                    {status.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
