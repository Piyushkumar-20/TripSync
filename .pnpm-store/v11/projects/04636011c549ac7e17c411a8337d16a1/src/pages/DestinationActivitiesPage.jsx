import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid } from "date-fns";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Clock,
  Compass,
  GripVertical,
  Hotel,
  IndianRupee,
  Landmark,
  ListChecks,
  MapPin,
  MoreHorizontal,
  Mountain,
  Pencil,
  Plane,
  Plus,
  Ship,
  ShoppingBag,
  Train,
  Trees,
  Trash2,
  Bus,
  User,
  UtensilsCrossed,
  Waves,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  activityQueryKey,
  useActivities,
  useActivitySocket,
  useReorderActivities,
} from "@/hooks/useActivities";
import { useDestinations } from "@/hooks/useDestinations";
import { useMembers } from "@/hooks/useMembers";
import { useTrips } from "@/hooks/useTrips";
import { useTripSocket } from "@/hooks/useTripSocket";
import { can } from "@/lib/rbac";
import { getLoadErrorMessage, logError } from "@/lib/errors";
import ActivityFormDialog from "@/components/activities/ActivityFormDialog";
import DeleteActivityDialog from "@/components/activities/DeleteActivityDialog";
import EmptyState from "@/components/shared/EmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date) {
  if (!date) return "No date";
  const parsed = new Date(date);
  return isValid(parsed) ? format(parsed, "MMM d, yyyy") : "Date unavailable";
}

function getDateKey(date) {
  if (!date) return "unknown";
  const parsed = new Date(date);
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : "unknown";
}

function groupActivitiesByDate(activities = []) {
  const groups = new Map();

  [...activities]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .forEach((activity) => {
      const dateKey = getDateKey(activity.visitDate);
      const group = groups.get(dateKey) ?? {
        dateKey,
        visitDate: activity.visitDate,
        activities: [],
      };

      group.activities.push(activity);
      groups.set(dateKey, group);
    });

  return [...groups.values()].sort((a, b) => {
    if (a.dateKey === "unknown") return 1;
    if (b.dateKey === "unknown") return -1;
    return new Date(a.visitDate) - new Date(b.visitDate);
  });
}

function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return "Time TBD";
  if (!startTime) return `Ends ${endTime}`;
  if (!endTime) return `Starts ${startTime}`;
  return `${startTime} - ${endTime}`;
}

function getActivityIcon(title = "", className = "h-5 w-5") {
  const value = title.toLowerCase();

  if (/\b(hotel|stay|check-?in)\b/.test(value)) return <Hotel className={className} />;
  if (/\b(museum|gallery|temple|church|mosque)\b/.test(value)) return <Landmark className={className} />;
  if (/\b(restaurant|lunch|dinner|breakfast|cafe|café)\b/.test(value)) return <UtensilsCrossed className={className} />;
  if (/\b(flight|airport)\b/.test(value)) return <Plane className={className} />;
  if (/\b(train|railway)\b/.test(value)) return <Train className={className} />;
  if (/\bbus\b/.test(value)) return <Bus className={className} />;
  if (/\bbeach\b/.test(value)) return <Waves className={className} />;
  if (/\b(hiking|trek)\b/.test(value)) return <Mountain className={className} />;
  if (/\bshopping\b/.test(value)) return <ShoppingBag className={className} />;
  if (/\bpark\b/.test(value)) return <Trees className={className} />;
  if (/\b(tour|sightseeing)\b/.test(value)) return <Camera className={className} />;
  if (/\badventure\b/.test(value)) return <Compass className={className} />;
  if (/\b(boat|cruise)\b/.test(value)) return <Ship className={className} />;

  return <MapPin className={className} />;
}

function ActivityIconGlyph({ title }) {
  return getActivityIcon(title);
}

function toTransformString(transform, isDragging) {
  if (!transform) return undefined;

  const scale = isDragging ? 1.02 : 1;
  return `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0) scale(${scale})`;
}

function SortableActivityCard({
  activity,
  canEdit,
  canDelete,
  canReorder,
  onEdit,
  onDelete,
}) {
  const {
    attributes,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: activity._id, disabled: !canReorder });

  const style = {
    transform: toTransformString(transform, isDragging),
    transition,
    zIndex: isDragging ? 20 : undefined,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`group overflow-hidden border-white/10 bg-card/70 py-0 shadow-sm shadow-black/10 backdrop-blur transition-[border-color,background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:bg-muted/25 hover:shadow-md hover:shadow-black/20 ${
        isDragging ? "cursor-grabbing border-primary/50 bg-muted/35 shadow-2xl shadow-black/30" : ""
      }`}
    >
      <CardContent className="p-3.5 sm:p-4">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-4">
          <Button
            ref={setActivatorNodeRef}
            variant="ghost"
            size="icon"
            aria-label="Drag to reorder activity"
            className={`h-9 w-7 shrink-0 text-muted-foreground/55 transition-colors hover:bg-transparent hover:text-primary ${
              canReorder ? "cursor-grab active:cursor-grabbing" : "cursor-not-allowed opacity-40"
            }`}
            disabled={!canReorder}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex min-w-0 items-start gap-3.5">
              <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-muted/45 text-primary shadow-inner shadow-white/5 sm:flex">
                <ActivityIconGlyph title={activity.title} />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <CardTitle className="truncate text-base font-semibold leading-tight tracking-normal text-foreground">
                  {activity.title}
                </CardTitle>

                {activity.description && (
                  <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
                    {activity.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    {formatDate(activity.visitDate)}
                  </span>
                  <span className="text-muted-foreground/35">{"\u2022"}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {formatTimeRange(activity.startTime, activity.endTime)}
                  </span>
                  <span className="text-muted-foreground/35">{"\u2022"}</span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5 shrink-0" />
                    {activity.estimatedCost || 0}
                  </span>
                  {activity.createdBy?.fullName && (
                    <>
                      <span className="text-muted-foreground/35">{"\u2022"}</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        {activity.createdBy.fullName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {(canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Open activity actions"
                  className="h-8 w-8 shrink-0 rounded-lg border-white/10 bg-background/30 text-muted-foreground transition-colors hover:border-primary/35 hover:bg-primary/10 hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit(activity)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {canEdit && canDelete && <DropdownMenuSeparator />}
                {canDelete && (
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => onDelete(activity)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ActivitiesSectionHeader({ sortBy, onSortChange }) {
  return (
    <Card className="overflow-hidden border-white/10 bg-card/75 shadow-sm shadow-black/10">
      <CardHeader className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ListChecks className="h-4 w-4" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-normal">Activities</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage and organize all activities for this destination.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Sort by</span>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="h-9 w-[140px] rounded-lg border-white/10 bg-background/40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="order">Order</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="time">Time</SelectItem>
              <SelectItem value="cost">Cost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function DestinationActivitiesPage() {
  const { tripId, destinationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  const { data: trips } = useTrips();
  const trip = trips?.find((t) => t._id === tripId);
  const { data: members } = useMembers(tripId);
  const { data: destinations, isLoading: destinationsLoading } = useDestinations(tripId);
  const destination = destinations?.find((d) => d._id === destinationId);
  const {
    data: activities,
    isLoading: activitiesLoading,
    isError,
    error,
  } = useActivities(tripId, destinationId);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [sortBy, setSortBy] = useState("order");
  const reorderActivities = useReorderActivities(tripId, destinationId);

  useTripSocket(tripId);
  useActivitySocket(tripId, destinationId);

  const userId = user?._id?.toString() ?? user?.id?.toString();
  const isOwner = (trip?.owner?._id ?? trip?.owner)?.toString() === userId;
  const memberRecord = members?.find((m) => m.userId?._id?.toString() === userId);
  const currentRole = isOwner ? "Owner" : memberRecord?.role;
  const canAddActivity = can(currentRole, "addActivity");
  const canEditActivity = can(currentRole, "editActivity");
  const canDeleteActivity = can(currentRole, "deleteActivity");
  const activityCount = activities?.length ?? 0;
  const orderedActivities = useMemo(
    () => [...(activities ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [activities],
  );
  const activityGroups = useMemo(() => groupActivitiesByDate(orderedActivities), [orderedActivities]);
  const sortableActivityIds = useMemo(
    () => orderedActivities.map((activity) => activity._id),
    [orderedActivities],
  );

  useEffect(() => {
    if (!isError) return;

    logError(error, "activities-load");
    toast.error(getLoadErrorMessage(error));
  }, [isError, error]);

  const closeForm = () => {
    setFormOpen(false);
    setSelectedActivity(null);
  };

  const closeDelete = () => {
    setDeleteOpen(false);
    setSelectedActivity(null);
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id || reorderActivities.isPending) return;

    const oldIndex = orderedActivities.findIndex((activity) => activity._id === active.id);
    const newIndex = orderedActivities.findIndex((activity) => activity._id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const previousActivities = activities ?? [];
    const reordered = arrayMove(orderedActivities, oldIndex, newIndex).map((activity, index) => ({
      ...activity,
      order: index + 1,
    }));
    const payload = reordered.map((activity) => ({
      id: activity._id,
      order: activity.order,
    }));
    const queryKey = activityQueryKey(tripId, destinationId);

    qc.setQueryData(queryKey, reordered);
    reorderActivities.mutate(payload, {
      onError: (err) => {
        qc.setQueryData(queryKey, previousActivities);
        logError(err, "activities-reorder");
        toast.error("Unable to reorder activities. Please try again.");
      },
    });
  };

  const handleSortChange = (value) => {
    if (value !== "order") {
      toast.info("Sorting by order is available right now. Date, time, and cost are coming soon.");
      return;
    }

    setSortBy(value);
  };

  return (
    <div className="space-y-5">
      <Card className="decorative-surface relative overflow-hidden border-white/10 bg-card/75 shadow-lg shadow-black/10">
        <CardHeader className="relative space-y-4 p-5">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit px-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
            onClick={() => navigate(`/trips/${tripId}`)}
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Trip
          </Button>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <CardTitle className="text-2xl font-semibold tracking-normal sm:text-3xl">
                {destinationsLoading ? "Activities" : destination?.name ?? "Destination not found"}
              </CardTitle>
              <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" />
                  {destination?.visitDate ? formatDate(destination.visitDate) : "Visit date unavailable"}
                </span>
                <span className="text-muted-foreground/35">{"\u2022"}</span>
                <Badge variant="secondary" className="rounded-full px-2.5 py-0.5 text-xs">
                  {activityCount} {activityCount === 1 ? "Activity" : "Activities"}
                </Badge>
              </div>
            </div>

            {canAddActivity && (
              <Button
                className="shrink-0 rounded-lg px-4 shadow-md shadow-primary/20"
                onClick={() => {
                  setSelectedActivity(null);
                  setFormOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Activity
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      <ActivitiesSectionHeader sortBy={sortBy} onSortChange={handleSortChange} />

      {activitiesLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-14">
            <EmptyState
              icon={ListChecks}
              title="Unable to load activities"
              description={getLoadErrorMessage(error)}
            />
          </CardContent>
        </Card>
      ) : activities?.length === 0 ? (
        <Card className="min-h-[260px] border-white/10 bg-card/70">
          <CardContent className="flex min-h-[260px] items-center justify-center py-10">
            <EmptyState
              icon={ListChecks}
              title="No activities yet"
              description="Start planning this destination by adding your first activity."
              action={
                canAddActivity && (
                  <Button
                    size="default"
                    onClick={() => {
                      setSelectedActivity(null);
                      setFormOpen(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Activity
                  </Button>
                )
              }
            />
          </CardContent>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableActivityIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-4">
              {activityGroups.map((group, index) => (
                <section
                  key={group.dateKey}
                  className="rounded-xl border border-white/10 bg-card/60 p-3.5 shadow-sm shadow-black/10 sm:p-4"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CalendarDays className="h-4 w-4" />
                      </div>
                      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                        <h2 className="text-xl font-semibold tracking-normal">Day {index + 1}</h2>
                        <p className="text-sm text-muted-foreground">
                          {group.visitDate ? formatDate(group.visitDate) : "Date unavailable"}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-xs">
                      {group.activities.length} {group.activities.length === 1 ? "Activity" : "Activities"}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {group.activities.map((activity) => (
                      <SortableActivityCard
                        key={activity._id}
                        activity={activity}
                        canEdit={canEditActivity}
                        canDelete={canDeleteActivity}
                        canReorder={canEditActivity}
                        onEdit={(item) => {
                          setSelectedActivity(item);
                          setFormOpen(true);
                        }}
                        onDelete={(item) => {
                          setSelectedActivity(item);
                          setDeleteOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ActivityFormDialog
        open={formOpen}
        onClose={closeForm}
        tripId={tripId}
        destinationId={destinationId}
        activity={selectedActivity}
      />
      <DeleteActivityDialog
        open={deleteOpen}
        onClose={closeDelete}
        activity={selectedActivity}
        tripId={tripId}
        destinationId={destinationId}
      />
    </div>
  );
}
