import { useNavigate, useParams } from "react-router-dom";
import { CalendarDays, Loader2, Link, UserPlus } from "lucide-react";
import { useAcceptShareLink, useShareLink } from "@/hooks/useTrips";
import EmptyState from "@/components/shared/EmptyState";
import QueryErrorState from "@/components/shared/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ShareInvitePage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { data: share, isLoading, isError, error } = useShareLink(token);
  const acceptShareLink = useAcceptShareLink(token, (result) => {
    navigate(`/trips/${result.tripId}`, { replace: true });
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <Skeleton className="h-10 w-52" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        title="Unable to open share link"
        queryKey={["share-link", token]}
      />
    );
  }

  if (!share) {
    return (
      <EmptyState
        icon={Link}
        title="Share link not found"
        description="This link may have expired or been disabled."
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Join {share.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {share.owner?.fullName || "A TripSync member"} shared this trip with you.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            {share.description && (
              <p className="text-sm text-muted-foreground">{share.description}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{share.role}</Badge>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Shared trip
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => acceptShareLink.mutate()}
            disabled={acceptShareLink.isPending}
          >
            {acceptShareLink.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Join Trip
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
