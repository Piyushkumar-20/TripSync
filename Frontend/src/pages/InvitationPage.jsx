import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarDays, Loader2, Mail, UserPlus } from "lucide-react";
import { useInvitation, useAcceptInvitation } from "@/hooks/useInvitations";
import EmptyState from "@/components/shared/EmptyState";
import QueryErrorState from "@/components/shared/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function InvitationPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { data: invitation, isLoading, isError, error } = useInvitation(token);
  const acceptInvitation = useAcceptInvitation(token, (result) => {
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
        title="Unable to open invitation"
        queryKey={["invitation", token]}
      />
    );
  }

  if (!invitation) {
    return (
      <EmptyState
        icon={Mail}
        title="Invitation not found"
        description="This invitation may have expired or been revoked."
      />
    );
  }

  const trip = invitation.trip;

  return (
    <div className="mx-auto max-w-xl">
      <Card>
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Join {trip.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {invitation.invitedBy?.fullName || "A TripSync member"} invited you to collaborate.
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">{trip.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <Badge variant="secondary">{invitation.role}</Badge>
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CalendarDays className="h-4 w-4" />
                Expires {format(new Date(invitation.expiresAt), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => acceptInvitation.mutate()}
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Accept Invitation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
