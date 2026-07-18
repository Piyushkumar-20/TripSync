import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  CreditCard,
  LogOut,
  Mail,
  Moon,
  Monitor,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useSubscription } from "@/hooks/useSubscription";
import PageHeader from "@/components/shared/PageHeader";
import QueryErrorState from "@/components/shared/QueryErrorState";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

function formatDate(value) {
  if (!value) return "Not scheduled";
  return format(new Date(value), "MMM d, yyyy");
}

function InfoRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {Icon && <Icon className="h-4 w-4" />}
        <span>{label}</span>
      </div>
      <div className="text-right font-medium">{value}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    isError: subscriptionError,
    error: subscriptionLoadError,
  } = useSubscription();

  const initials = user?.fullName
    ?.split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const planLabel = subscription?.plan ?? "Free";
  const isPro = subscription?.plan === "Pro" && subscription?.status === "Active";

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, plan, security, and workspace preferences."
      />

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Account
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                    {initials || "TS"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{user?.fullName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">
                      {user?.provider === "google" ? "Google account" : "Email account"}
                    </Badge>
                    {user?.isEmailVerified && (
                      <Badge variant="outline" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate("/forgot-password")}>
                Reset Password
              </Button>
            </div>

            <div className="mt-5 divide-y">
              <InfoRow label="Email" value={user?.email || "-"} icon={Mail} />
              <InfoRow
                label="Authentication"
                value={user?.provider === "google" ? "Google OAuth" : "Email and password"}
                icon={ShieldCheck}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              Subscription
            </CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-5">
            {subscriptionError ? (
              <QueryErrorState
                error={subscriptionLoadError}
                title="Unable to load subscription"
                queryKey={["subscription"]}
              />
            ) : subscriptionLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-2xl font-bold">{planLabel}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isPro
                        ? "Premium collaboration is enabled."
                        : "Free plan limits apply to trips and members."}
                    </p>
                  </div>
                  <Badge variant={isPro ? "default" : "secondary"}>
                    {subscription.status}
                  </Badge>
                </div>
                <div className="mt-5 divide-y">
                  <InfoRow
                    label={isPro ? "Renewal Date" : "Expiry Date"}
                    value={formatDate(subscription.currentPeriodEnd)}
                    icon={CalendarClock}
                  />
                  <InfoRow
                    label="Billing"
                    value={isPro ? "Paid" : "No active billing"}
                    icon={CreditCard}
                  />
                </div>
                <Button className="mt-5 w-full" onClick={() => navigate("/subscription")}>
                  Manage Subscription
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Monitor className="h-4 w-4" />
            Appearance
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-5">
          <div className="grid gap-3 sm:grid-cols-3">
            {themeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                type="button"
                variant={theme === value ? "default" : "outline"}
                className="justify-start"
                onClick={() => setTheme(value)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">Sign out of this device</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your current session will end and you will return to login.
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
