import { format } from "date-fns";
import {
  BadgeCheck,
  CalendarClock,
  CreditCard,
  Crown,
  Infinity,
  Link,
  Loader2,
  Lock,
  Sparkles,
  Users,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSubscription, useUpgradeSubscription } from "@/hooks/useSubscription";
import PageHeader from "@/components/shared/PageHeader";
import QueryErrorState from "@/components/shared/QueryErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatDate(date) {
  if (!date) return "Not scheduled";
  return format(new Date(date), "MMM d, yyyy");
}

function PlanFeature({ icon: Icon, children }) {
  return (
    <li className="flex items-center gap-2 text-sm text-muted-foreground">
      <Icon className="h-4 w-4 text-primary" />
      <span>{children}</span>
    </li>
  );
}

function StatusCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="mt-1 text-base font-semibold">{value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { data: subscription, isLoading, isError, error } = useSubscription();
  const upgrade = useUpgradeSubscription({ user });

  const currentPlan = subscription?.plan ?? "Free";
  const isPro = currentPlan === "Pro" && subscription?.status === "Active";

  if (isError) {
    return (
      <QueryErrorState
        error={error}
        title="Unable to load subscription"
        queryKey={["subscription"]}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription"
        description="Manage your plan, billing status, and premium collaboration features."
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <Skeleton key={item} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <StatusCard title="Current Plan" value={currentPlan} icon={Crown} />
          <StatusCard title="Plan Status" value={subscription.status} icon={BadgeCheck} />
          <StatusCard title="Billing Status" value={isPro ? "Paid" : "Free"} icon={CreditCard} />
          <StatusCard
            title={isPro ? "Renewal Date" : "Expiry Date"}
            value={formatDate(subscription.currentPeriodEnd)}
            icon={CalendarClock}
          />
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Free
                  {!isPro && <Badge>Current Plan</Badge>}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Essential planning for small trips.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹0</p>
                <p className="text-xs text-muted-foreground">forever</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <PlanFeature icon={CalendarClock}>Maximum 3 Trips</PlanFeature>
              <PlanFeature icon={Users}>Maximum 5 Members</PlanFeature>
              <PlanFeature icon={Lock}>Share Link Disabled</PlanFeature>
            </ul>
            <Button className="mt-6 w-full" variant="outline" disabled>
              {!isPro ? "Current Plan" : "Included"}
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden border-primary/40">
          <div className="absolute right-4 top-4">
            <Badge variant="secondary">Best for groups</Badge>
          </div>
          <CardHeader>
            <div className="flex items-start justify-between gap-3 pr-24">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  Pro
                  {isPro && <Badge>Current Plan</Badge>}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Full collaboration for every itinerary.
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">₹99</p>
                <p className="text-xs text-muted-foreground">per month</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <PlanFeature icon={Infinity}>Unlimited Trips</PlanFeature>
              <PlanFeature icon={Users}>Unlimited Members</PlanFeature>
              <PlanFeature icon={Link}>Share Link Enabled</PlanFeature>
              <PlanFeature icon={Sparkles}>Real-time Collaboration</PlanFeature>
              <PlanFeature icon={Crown}>Priority Features</PlanFeature>
            </ul>
            <Button
              className="mt-6 w-full"
              onClick={() => upgrade.mutate()}
              disabled={isPro || upgrade.isPending || isLoading}
            >
              {upgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPro ? "Current Plan" : "Upgrade to Pro"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
