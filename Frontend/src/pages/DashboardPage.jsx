import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTrips } from "@/hooks/useTrips";
import WelcomeBanner from "@/components/dashboard/WelcomeBanner";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentTrips from "@/components/dashboard/RecentTrips";
import QueryErrorState from "@/components/shared/QueryErrorState";
import QuickActions from "@/components/dashboard/QuickActions";
import TripFormDialog from "@/components/trips/TripFormDialog";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: allTrips, isLoading, isError, error } = useTrips();
  const [createOpen, setCreateOpen] = useState(false);

  const trips = allTrips ?? [];

  return (
    <div className="space-y-6">
      <WelcomeBanner user={user} />

      <StatsCards trips={trips} loading={isLoading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {isError ? (
            <QueryErrorState error={error} title="Unable to load trips" queryKey={["trips"]} />
          ) : (
            <RecentTrips trips={trips} loading={isLoading} />
          )}
        </div>
        <div>
          <QuickActions onCreateTrip={() => setCreateOpen(true)} />
        </div>
      </div>

      <TripFormDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        trip={null}
      />
    </div>
  );
}
