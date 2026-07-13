import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MoreHorizontal,
  Plus,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import { useMembers } from "@/hooks/useMembers";
import { useTripSocket } from "@/hooks/useTripSocket";
import {
  useChecklist,
  useCreateChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from "@/hooks/useChecklist";
import { cn } from "@/lib/utils";
import QueryErrorState from "@/components/shared/QueryErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MAX_ITEM_LENGTH = 50;

const VIEWS = {
  personal: {
    type: "Packing",
    title: "Personal List",
    description: "Personal checklist - only visible to you",
    icon: User,
    action: "Add Item",
    addCopy: "Add new item",
    placeholder: "Add a personal item…",
    emptyCopy: "Nothing here yet. Add your first item.",
    progressTitle: "Your Progress",
    progressSuffix: "Done",
    completeLabel: "Completed",
    pendingLabel: "Remaining",
    stroke: "stroke-primary",
    metricColor: "bg-primary",
    showAssignee: false,
    showTotal: false,
  },
  shared: {
    type: "Shared",
    title: "Shared Tasks",
    description: "Collaborative checklist for the whole trip",
    icon: Users,
    action: "Add Task",
    addCopy: "Add new task",
    placeholder: "Add a shared task…",
    emptyCopy: "No tasks yet. Add the first one for your group.",
    progressTitle: "Overall Progress",
    progressSuffix: "Completed",
    completeLabel: "Completed",
    pendingLabel: "Pending",
    stroke: "stroke-emerald-500",
    metricColor: "bg-emerald-500",
    showAssignee: true,
    showTotal: true,
  },
};

const AVATAR_PALETTE = [
  "bg-emerald-500",
  "bg-violet-500",
  "bg-orange-500",
  "bg-blue-500",
  "bg-pink-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

function colorFor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function firstName(name) {
  return name?.trim().split(/\s+/)[0] || "Member";
}

function timeAgo(value) {
  if (!value) return "";
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function StatusBox({ checked }) {
  return (
    <span
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-md border transition-all duration-200",
        checked
          ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/25"
          : "border-muted-foreground/40 bg-background group-hover/row:border-primary/70",
      )}
    >
      {checked && <Check className="size-3.5" />}
    </span>
  );
}

function Assignee({ name, color }) {
  if (!name) return null;

  return (
    <div className="hidden min-w-36 items-center gap-2 text-sm sm:flex">
      <Avatar className="size-6">
        <AvatarFallback className={cn("text-[11px] font-semibold text-white", color)}>
          {name[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <span className="font-medium">{name}</span>
    </div>
  );
}

function ChecklistRow({ item, shared, assignee, onToggle, onDelete }) {
  const time = timeAgo(item.updatedAt ?? item.createdAt);

  return (
    <div className="group/row grid min-h-12 grid-cols-[1fr_auto] items-center gap-3 border-b px-4 transition-all duration-200 last:border-b-0 hover:bg-muted/45 sm:px-6">
      <button
        type="button"
        onClick={() => onToggle(item)}
        className="flex min-w-0 items-center gap-3 text-left"
        aria-pressed={item.completed}
        aria-label={`Mark "${item.text}" as ${item.completed ? "incomplete" : "complete"}`}
      >
        <StatusBox checked={item.completed} />
        <div className="min-w-0">
          <p
            className={cn(
              "truncate text-sm font-medium transition-colors",
              item.completed && "text-muted-foreground line-through",
            )}
          >
            {item.text}
          </p>
          {shared && assignee && (
            <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground sm:hidden">
              <span>{assignee.name}</span>
              <span aria-hidden="true">/</span>
              <span>{time}</span>
            </p>
          )}
        </div>
      </button>

      <div className="flex items-center gap-3">
        {shared && assignee && <Assignee name={assignee.name} color={assignee.color} />}
        {shared && (
          <span className="hidden w-14 text-right text-xs text-muted-foreground sm:inline">
            {time}
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" aria-label={`More options for ${item.text}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(item)}>
              <Trash2 className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

function AddRow({ view, adding, setAdding, onAdd, isPending }) {
  const [text, setText] = useState("");

  const submit = (event) => {
    event.preventDefault();
    const value = text.trim();
    if (!value) return;
    onAdd(value);
    setText(""); // Input keeps focus, so the row stays ready for rapid entry.
  };

  if (!adding) {
    return (
      <div className="p-2">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/20 text-sm font-medium text-foreground transition-all duration-200 hover:border-primary/60 hover:bg-primary/5 hover:text-primary"
        >
          <Plus className="size-4 text-primary" />
          {view.addCopy}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-2">
      <Input
        autoFocus
        value={text}
        maxLength={MAX_ITEM_LENGTH}
        placeholder={view.placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setAdding(false);
        }}
        className="h-11 rounded-xl"
      />
      <Button type="submit" className="h-11 shrink-0" disabled={isPending || !text.trim()}>
        <Plus className="size-4" />
        Add
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0"
        aria-label="Cancel adding"
        onClick={() => setAdding(false)}
      >
        <X className="size-4" />
      </Button>
    </form>
  );
}

function ChecklistTable({
  view,
  items,
  isLoading,
  isError,
  error,
  queryKey,
  assigneeFor,
  adding,
  setAdding,
  onAdd,
  onToggle,
  onDelete,
  isAdding,
}) {
  return (
    <Card className="py-0 shadow-lg shadow-foreground/5">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="space-y-px p-4 sm:p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-11 w-full rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <div className="px-6 py-10">
            <QueryErrorState
              error={error}
              title="Unable to load checklist"
              queryKey={queryKey}
            />
          </div>
        ) : items.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted-foreground">{view.emptyCopy}</p>
        ) : (
          <div className="divide-y-0">
            {items.map((item) => (
              <ChecklistRow
                key={item._id}
                item={item}
                shared={view.showAssignee}
                assignee={assigneeFor(item)}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
        <AddRow
          key={adding ? "add-open" : "add-closed"}
          view={view}
          adding={adding}
          setAdding={setAdding}
          onAdd={onAdd}
          isPending={isAdding}
        />
      </CardContent>
    </Card>
  );
}

function ProgressRing({ completed, total, strokeClass, suffix }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const percent = total ? completed / total : 0;
  const offset = circumference * (1 - percent);

  return (
    <div className="relative mx-auto size-36">
      <svg className="size-36 -rotate-90" viewBox="0 0 112 112" aria-hidden="true">
        <circle cx="56" cy="56" r={radius} className="stroke-muted" strokeWidth="7" fill="none" />
        <circle
          cx="56"
          cy="56"
          r={radius}
          className={cn(strokeClass, "transition-all duration-500")}
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tracking-tight">
          {completed} / {total}
        </span>
        <span className="mt-1 text-[11px] text-muted-foreground">
          {Math.round(percent * 100)}% {suffix}
        </span>
      </div>
    </div>
  );
}

function MetricLine({ color, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2">
        <span className={cn("size-2 rounded-full", color)} />
        <span>{label}</span>
      </div>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function ProgressCard({ view, completed, total }) {
  return (
    <Card className="shadow-lg shadow-foreground/5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{view.progressTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <ProgressRing
          completed={completed}
          total={total}
          strokeClass={view.stroke}
          suffix={view.progressSuffix}
        />
        <Separator className="my-5" />
        <div className="space-y-3">
          <MetricLine color={view.metricColor} label={view.completeLabel} value={completed} />
          <MetricLine color="bg-muted-foreground/60" label={view.pendingLabel} value={total - completed} />
          {view.showTotal && (
            <MetricLine color="bg-muted-foreground/30" label="Total Tasks" value={total} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function MembersCard({ members, currentUserId, isLoading, onViewAll }) {
  return (
    <Card className="shadow-lg shadow-foreground/5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Trip Members</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="mx-auto size-8 rounded-full" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <p className="text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {members.map((member) => {
              const isYou = member.id === currentUserId;
              return (
                <div key={member.id} className="min-w-0 text-center">
                  <Avatar className="mx-auto size-8">
                    <AvatarFallback className={cn("text-xs font-semibold text-white", member.color)}>
                      {member.name[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="mt-2 truncate text-xs font-medium">{member.name}</p>
                  {isYou && <p className="truncate text-[11px] text-muted-foreground">(You)</p>}
                </div>
              );
            })}
          </div>
        )}
        <Button variant="link" size="sm" className="mt-5 h-auto p-0 text-primary" onClick={onViewAll}>
          View all members
          <ArrowRight className="size-3.5" />
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ChecklistsPage() {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [adding, setAdding] = useState(false);

  useTripSocket(tripId);

  const activeView = searchParams.get("type") === "shared" ? "shared" : "personal";
  const view = VIEWS[activeView];
  const Icon = view.icon;

  const { data: trips, isLoading: tripsLoading, isError: tripsError, error: tripsLoadError } = useTrips();
  const { data: members, isLoading: membersLoading } = useMembers(tripId);
  const { data: items, isLoading: itemsLoading, isError: itemsError, error: itemsLoadError } = useChecklist(tripId, view.type);

  const createItem = useCreateChecklistItem(tripId, view.type);
  const updateItem = useUpdateChecklistItem(tripId, view.type);
  const deleteItem = useDeleteChecklistItem(tripId, view.type);

  const trip = useMemo(() => trips?.find((item) => item._id === tripId), [trips, tripId]);
  const rows = items ?? [];

  const currentUserId = (user?._id ?? user?.id)?.toString();

  // Map every member to a stable name + colour so shared-task assignees and the
  // members card stay consistent.
  const memberMap = useMemo(() => {
    const map = new Map();
    members?.forEach((member) => {
      const u = member.userId;
      const id = u?._id?.toString();
      if (id) map.set(id, { name: firstName(u.fullName), color: colorFor(id) });
    });
    return map;
  }, [members]);

  const memberList = useMemo(
    () =>
      members?.map((member) => {
        const id = member.userId?._id?.toString();
        return { id, name: firstName(member.userId?.fullName), color: colorFor(id ?? "") };
      }) ?? [],
    [members],
  );

  const assigneeFor = (item) => {
    const id = item.createdBy?.toString();
    if (!id) return null;
    return memberMap.get(id) ?? { name: "Member", color: colorFor(id) };
  };

  const completed = rows.filter((item) => item.completed).length;
  const total = rows.length;

  const handleToggle = (item) =>
    updateItem.mutate({ itemId: item._id, data: { completed: !item.completed } });
  const handleDelete = (item) => deleteItem.mutate(item._id);
  const handleAdd = (text) => createItem.mutate(text);
  const handleViewChange = (value) => {
    setAdding(false);
    setSearchParams(value === "shared" ? { type: "shared" } : {});
  };

  if (tripsLoading && !trip) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-[520px] w-full rounded-[24px]" />
      </div>
    );
  }

  if (tripsError && !trip) {
    return (
      <QueryErrorState error={tripsLoadError} title="Unable to load trip" queryKey={["trips"]} />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit"
          onClick={() => navigate(tripId ? `/trips/${tripId}` : "/trips")}
        >
          <ArrowLeft className="size-4" />
          {trip?.title ?? "Trip"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <main className="min-w-0 space-y-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border bg-card shadow-sm">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{view.title}</h1>
                <p className="mt-1 text-sm text-muted-foreground">{view.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Tabs value={activeView} onValueChange={handleViewChange}>
                <TabsList>
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="shared">Shared</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button
                className="border border-primary/20 shadow-sm shadow-primary/15"
                onClick={() => setAdding(true)}
              >
                <Plus className="size-4" />
                {view.action}
              </Button>
            </div>
          </div>

          <ChecklistTable
            view={view}
            items={rows}
            isLoading={itemsLoading}
            isError={itemsError}
            error={itemsLoadError}
            queryKey={["checklists", tripId, view.type]}
            assigneeFor={assigneeFor}
            adding={adding}
            setAdding={setAdding}
            onAdd={handleAdd}
            onToggle={handleToggle}
            onDelete={handleDelete}
            isAdding={createItem.isPending}
          />
        </main>

        <aside className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
          <ProgressCard view={view} completed={completed} total={total} />
          {activeView === "shared" && (
            <MembersCard
              members={memberList}
              currentUserId={currentUserId}
              isLoading={membersLoading}
              onViewAll={() => navigate(`/trips/${tripId}`, { state: { activeTab: "members" } })}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
