import { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { differenceInDays, format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Pencil,
  Receipt,
  Trash2,
  User,
  UserPlus,
  Users,
  CalendarDays,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { useMembers } from "@/hooks/useMembers";
import { useDestinations } from "@/hooks/useDestinations";
import { useDestinationActivityCounts } from "@/hooks/useActivities";
import { useExpenses, useExpenseBalances } from "@/hooks/useExpenses";
import { useDocuments } from "@/hooks/useDocuments";
import { useTripSocket } from "@/hooks/useTripSocket";
import { can } from "@/lib/rbac";
import TripFormDialog from "@/components/trips/TripFormDialog";
import DeleteTripDialog from "@/components/trips/DeleteTripDialog";
import AddMemberDialog from "@/components/members/AddMemberDialog";
import UpdateRoleDialog from "@/components/members/UpdateRoleDialog";
import RemoveMemberDialog from "@/components/members/RemoveMemberDialog";
import MemberTable from "@/components/members/MemberTable";
import DestinationFormDialog from "@/components/destinations/DestinationFormDialog";
import DeleteDestinationDialog from "@/components/destinations/DeleteDestinationDialog";
import DestinationList from "@/components/destinations/DestinationList";
import AddExpenseDialog from "@/components/expenses/AddExpenseDialog";
import ExpenseList from "@/components/expenses/ExpenseList";
import DocumentList from "@/components/documents/DocumentList";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function getTripStatus(trip) {
  const now = new Date();
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);
  if (now < start) return { label: "Upcoming", variant: "secondary" };
  if (now > end) return { label: "Completed", variant: "outline" };
  return { label: "Active", variant: "default" };
}

function Dot() {
  return <span className="select-none text-muted-foreground/30" aria-hidden>•</span>;
}

export function ComingSoon({ icon: Icon, title }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-24 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">This feature is coming soon.</p>
      </CardContent>
    </Card>
  );
}

export default function TripDetailsPage() {
  const { tripId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: allTrips, isLoading: tripsLoading } = useTrips();
  const trip = allTrips?.find((t) => t._id === tripId) ?? state?.trip;

  const { data: members, isLoading: membersLoading } = useMembers(tripId);
  const { data: destinations, isLoading: destinationsLoading } = useDestinations(tripId);
  const activityCounts = useDestinationActivityCounts(tripId, destinations ?? []);
  const { data: expenses,  isLoading: expensesLoading  } = useExpenses(tripId);
  const { data: balances,  isLoading: balancesLoading  } = useExpenseBalances(tripId);
  const { data: documents, isLoading: documentsLoading } = useDocuments(tripId);

  const [editOpen, setEditOpen]           = useState(false);
  const [deleteOpen, setDeleteOpen]       = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [selectedMember, setSelectedMember]           = useState(null);
  const [updateRoleOpen, setUpdateRoleOpen]           = useState(false);
  const [removeOpen, setRemoveOpen]                   = useState(false);
  const [destFormOpen, setDestFormOpen]               = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [deleteDestOpen, setDeleteDestOpen]           = useState(false);
  const [addExpenseOpen, setAddExpenseOpen]           = useState(false);

  useTripSocket(tripId);

  const userId = user?._id?.toString() ?? user?.id?.toString();
  const isOwner = (trip?.owner?._id ?? trip?.owner)?.toString() === userId;
  const memberRecord = members?.find((m) => m.userId?._id?.toString() === userId);
  const currentRole = isOwner ? "Owner" : memberRecord?.role;

  const canEditTrip        = can(currentRole, "editTrip");
  const canDeleteTrip      = can(currentRole, "deleteTrip");
  const canManageMembers   = can(currentRole, "addMember");
  const canAddDestination  = can(currentRole, "addDestination");
  const canEditDestination = can(currentRole, "editDestination");
  const canDelDestination  = can(currentRole, "deleteDestination");
  const canAddExpense      = can(currentRole, "addExpense");
  const canDeleteExpense   = can(currentRole, "deleteExpense");
  const canUploadDocument  = can(currentRole, "uploadDocument");
  const canDeleteDocument  = can(currentRole, "deleteDocument");

  if (tripsLoading && !trip) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-72 w-full rounded-[24px]" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-64 w-full rounded-[24px]" />
      </div>
    );
  }

  if (!trip) {
    return (
      <EmptyState
        title="Trip not found"
        description="This trip may have been deleted or you don't have access."
        action={
          <Button onClick={() => navigate("/trips")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Trips
          </Button>
        }
      />
    );
  }

  const status = getTripStatus(trip);
  const days   = differenceInDays(new Date(trip.endDate), new Date(trip.startDate));
  const memberCount = membersLoading ? null : (members?.length ?? 0);
  const destCount   = destinationsLoading ? null : (destinations?.length ?? 0);

  return (
    <div className="space-y-5">

      {/* ── Nav row ── */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/trips")}>
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> All Trips
        </Button>

        <div className="flex items-center gap-2">
          {canEditTrip && (
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit Trip
            </Button>
          )}
          {canDeleteTrip && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive border-destructive/30 hover:bg-destructive/10"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Delete Trip
            </Button>
          )}
        </div>
      </div>

      {/* ── Hero card ── */}
      <Card className="py-0 overflow-hidden">

        {/* Cover image */}
        {trip.coverImage && (
          <img
            src={trip.coverImage}
            alt="Trip cover"
            className="h-36 w-full object-cover"
          />
        )}

        {/* Trip identity */}
        <div className="px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-xl font-semibold tracking-tight leading-snug sm:text-2xl">
              {trip.title}
            </h1>
            <Badge variant={status.variant} className="shrink-0 mt-0.5">
              {status.label}
            </Badge>
          </div>

          {trip.description && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {trip.description}
            </p>
          )}

          {/* Compact single-line metadata */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              {format(new Date(trip.startDate), "MMM d")}
              {" → "}
              {format(new Date(trip.endDate), "MMM d, yyyy")}
            </span>
            <Dot />
            <span>{days} day{days !== 1 ? "s" : ""}</span>
            <Dot />
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 shrink-0" />
              {trip.owner?.fullName ?? user?.fullName}
            </span>
            {memberCount !== null && (
              <>
                <Dot />
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {memberCount} member{memberCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
            {destCount !== null && destCount > 0 && (
              <>
                <Dot />
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {destCount} destination{destCount !== 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* ── Content tabs ── */}
      <Tabs defaultValue={state?.activeTab ?? "members"} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members">
            Members{memberCount !== null ? ` (${memberCount})` : ""}
          </TabsTrigger>
          <TabsTrigger value="destinations">
            Destinations{destCount !== null ? ` (${destCount})` : ""}
          </TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger
            value="checklists"
            onClick={() => navigate(`/trips/${tripId}/checklists`)}
          >
            Checklist
          </TabsTrigger>
        </TabsList>

        {/* ── Members ── */}
        <TabsContent value="members">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Members
                  {memberCount !== null && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({memberCount})
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  People collaborating on this trip.
                </p>
              </div>
              {canManageMembers && (
                <Button size="sm" className="shrink-0" onClick={() => setAddMemberOpen(true)}>
                  <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                </Button>
              )}
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              {membersLoading ? (
                <div className="space-y-px p-5">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : members?.length === 0 ? (
                <div className="px-5 py-4">
                  <EmptyState
                    icon={Users}
                    title="No members yet"
                    description="Invite people to collaborate on this trip."
                    action={
                      canManageMembers && (
                        <Button size="sm" onClick={() => setAddMemberOpen(true)}>
                          <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add Member
                        </Button>
                      )
                    }
                  />
                </div>
              ) : (
                <div className="max-h-[420px] overflow-y-auto">
                  <MemberTable
                    members={members}
                    loading={false}
                    isOwner={canManageMembers}
                    onUpdateRole={(m) => { setSelectedMember(m); setUpdateRoleOpen(true); }}
                    onRemove={(m) => { setSelectedMember(m); setRemoveOpen(true); }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Destinations ── */}
        <TabsContent value="destinations">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Destinations
                  {destCount !== null && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      ({destCount})
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Places planned for this trip.
                </p>
              </div>
              {canAddDestination && (
                <Button
                  size="sm"
                  className="shrink-0"
                  onClick={() => { setSelectedDestination(null); setDestFormOpen(true); }}
                >
                  <MapPin className="mr-1.5 h-3.5 w-3.5" /> Add Destination
                </Button>
              )}
            </CardHeader>

            <Separator />

            <CardContent className="pt-5">
              {destinationsLoading ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : destinations?.length === 0 ? (
                <EmptyState
                  icon={MapPin}
                  title="No destinations added yet"
                  description="Start building your itinerary by adding places to visit."
                  action={
                    canAddDestination && (
                      <Button onClick={() => { setSelectedDestination(null); setDestFormOpen(true); }}>
                        <MapPin className="mr-2 h-4 w-4" /> Add Destination
                      </Button>
                    )
                  }
                />
              ) : (
                <DestinationList
                  destinations={destinations ?? []}
                  loading={false}
                  tripId={tripId}
                  activityCounts={activityCounts}
                  canEdit={canEditDestination}
                  canDelete={canDelDestination}
                  onEdit={(d) => { setSelectedDestination(d); setDestFormOpen(true); }}
                  onDelete={(d) => { setSelectedDestination(d); setDeleteDestOpen(true); }}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Documents ── */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Documents</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tickets, booking confirmations, and trip files.
              </p>
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              <DocumentList
                documents={documents}
                loading={documentsLoading}
                canUpload={canUploadDocument}
                canDelete={canDeleteDocument}
                tripId={tripId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Expenses ── */}
        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">Expenses</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Track what was spent and who owes whom.
                </p>
              </div>
              {canAddExpense && (
                <Button size="sm" className="shrink-0" onClick={() => setAddExpenseOpen(true)}>
                  <Receipt className="mr-1.5 h-3.5 w-3.5" /> Add Expense
                </Button>
              )}
            </CardHeader>

            <Separator />

            <CardContent className="p-0">
              <ExpenseList
                expenses={expenses}
                balances={balances}
                expensesLoading={expensesLoading}
                balancesLoading={balancesLoading}
                canDelete={canDeleteExpense}
                tripId={tripId}
                currentUserId={userId}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Dialogs ── */}
      <TripFormDialog open={editOpen} onClose={() => setEditOpen(false)} trip={trip} />
      <DeleteTripDialog
        open={deleteOpen}
        onClose={() => { setDeleteOpen(false); navigate("/trips"); }}
        trip={trip}
      />
      <AddMemberDialog
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        tripId={tripId}
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
      <DestinationFormDialog
        open={destFormOpen}
        onClose={() => { setDestFormOpen(false); setSelectedDestination(null); }}
        tripId={tripId}
        destination={selectedDestination}
      />
      <DeleteDestinationDialog
        open={deleteDestOpen}
        onClose={() => { setDeleteDestOpen(false); setSelectedDestination(null); }}
        destination={selectedDestination}
        tripId={tripId}
      />
      <AddExpenseDialog
        open={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
        tripId={tripId}
      />
    </div>
  );
}
