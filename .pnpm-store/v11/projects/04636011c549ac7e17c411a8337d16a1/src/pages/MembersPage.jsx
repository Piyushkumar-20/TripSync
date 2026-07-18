import { useState, useMemo } from "react";
import { Users } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { useMembers } from "@/hooks/useMembers";
import { useSubscription } from "@/hooks/useSubscription";
import { useTripSocket } from "@/hooks/useTripSocket";
import { can } from "@/lib/rbac";
import MemberTable from "@/components/members/MemberTable";
import AddMemberDialog from "@/components/members/AddMemberDialog";
import UpdateRoleDialog from "@/components/members/UpdateRoleDialog";
import RemoveMemberDialog from "@/components/members/RemoveMemberDialog";
import EmptyState from "@/components/shared/EmptyState";
import QueryErrorState from "@/components/shared/QueryErrorState";
import PageHeader from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import UpgradeDialog from "@/components/subscription/UpgradeDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus } from "lucide-react";

function MembersContent({ tripId, canManageMembers }) {
  useTripSocket(tripId);
  const { data: members, isLoading, isError, error } = useMembers(tripId);
  const { data: subscription } = useSubscription();
  const [addOpen, setAddOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [updateRoleOpen, setUpdateRoleOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);

  const isPro = subscription?.plan === "Pro" && subscription?.status === "Active";
  const freeMemberLimitReached = !isPro && !isLoading && (members?.length ?? 0) >= 5;

  const handleInviteClick = () => {
    if (freeMemberLimitReached) {
      setUpgradeOpen(true);
      return;
    }
    setAddOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManageMembers && (
          <Button size="sm" onClick={handleInviteClick}>
            <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Member
          </Button>
        )}
      </div>

      {isError ? (
        <QueryErrorState
          error={error}
          title="Unable to load members"
          queryKey={["members", tripId]}
        />
      ) : members?.length === 0 && !isLoading ? (
        <EmptyState
          icon={Users}
          title="No members yet"
          description="Add members to collaborate on this trip."
          action={
            canManageMembers && (
              <Button onClick={handleInviteClick}>
                <UserPlus className="mr-2 h-4 w-4" /> Add Member
              </Button>
            )
          }
        />
      ) : (
        <MemberTable
          members={members}
          loading={isLoading}
          isOwner={canManageMembers}
          onUpdateRole={(m) => {
            setSelectedMember(m);
            setUpdateRoleOpen(true);
          }}
          onRemove={(m) => {
            setSelectedMember(m);
            setRemoveOpen(true);
          }}
        />
      )}

      <AddMemberDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        tripId={tripId}
      />
      <UpgradeDialog
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        description="Free trips can include up to 5 members."
      />
      <UpdateRoleDialog
        open={updateRoleOpen}
        onClose={() => setUpdateRoleOpen(false)}
        member={selectedMember}
        tripId={tripId}
      />
      <RemoveMemberDialog
        open={removeOpen}
        onClose={() => setRemoveOpen(false)}
        member={selectedMember}
        tripId={tripId}
      />
    </div>
  );
}

export default function MembersPage() {
  const { user } = useAuth();
  const { data: allTrips, isLoading: tripsLoading, isError: tripsError, error: tripsLoadError } = useTrips();
  const [selectedTripId, setSelectedTripId] = useState("");

  // Show all trips the user has access to (backend already scopes this)
  const trips = allTrips ?? [];

  const selectedTrip = trips.find((t) => t._id === selectedTripId);

  const userId = user?._id?.toString() ?? user?.id?.toString();
  const isOwner = (selectedTrip?.owner?._id ?? selectedTrip?.owner)?.toString() === userId;

  // canManageMembers is resolved after members load in MembersContent,
  // but we can fast-path it here for the trip owner
  const canManageMembers = isOwner;

  return (
    <div>
      <PageHeader
        title="Members"
        description="Manage collaborators across your trips."
      />

      <div className="mb-6 max-w-sm">
        <Select
          value={selectedTripId}
          onValueChange={setSelectedTripId}
          disabled={tripsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a trip to manage members..." />
          </SelectTrigger>
          <SelectContent>
            {trips.map((trip) => (
              <SelectItem key={trip._id} value={trip._id}>
                {trip.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!selectedTripId ? (
        tripsError ? (
          <QueryErrorState error={tripsLoadError} title="Unable to load trips" queryKey={["trips"]} />
        ) : (
        <EmptyState
          icon={Users}
          title="Select a trip"
          description="Choose a trip from the dropdown above to view and manage its members."
        />
        )
      ) : (
        <MembersContent tripId={selectedTripId} canManageMembers={canManageMembers} />
      )}
    </div>
  );
}
