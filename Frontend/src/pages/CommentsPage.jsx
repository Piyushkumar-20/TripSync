import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTrips } from "@/hooks/useTrips";
import { useTripSocket } from "@/hooks/useTripSocket";
import TripComments from "@/components/comments/TripComments";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function CommentsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { data: trips, isLoading } = useTrips();

  useTripSocket(tripId);

  const trip = useMemo(() => trips?.find((item) => item._id === tripId), [trips, tripId]);

  if (isLoading && !trip) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-[520px] w-full rounded-[24px]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        onClick={() => navigate(tripId ? `/trips/${tripId}` : "/trips")}
      >
        <ArrowLeft className="h-4 w-4" />
        {trip?.title ?? "Trip"}
      </Button>

      <TripComments tripId={tripId} />
    </div>
  );
}
