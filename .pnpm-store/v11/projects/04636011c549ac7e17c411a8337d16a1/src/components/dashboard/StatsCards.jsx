import { Map, CalendarCheck,  TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({ title, value, description, icon: Icon, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-16" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ trips, loading }) {
  const now = new Date();
  const upcoming = trips?.filter((t) => new Date(t.startDate) > now).length ?? 0;
  const active = trips?.filter(
    (t) => new Date(t.startDate) <= now && new Date(t.endDate) >= now
  ).length ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Trips"
        value={loading ? "—" : trips?.length ?? 0}
        description="All your planned trips"
        icon={Map}
        loading={loading}
      />
      <StatCard
        title="Upcoming Trips"
        value={loading ? "—" : upcoming}
        description="Trips starting in the future"
        icon={CalendarCheck}
        loading={loading}
      />
      <StatCard
        title="Active Trips"
        value={loading ? "—" : active}
        description="Trips happening right now"
        icon={TrendingUp}
        loading={loading}
      />
    </div>
  );
}
