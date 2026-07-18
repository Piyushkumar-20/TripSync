import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function WelcomeBanner({ user }) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <Card className="relative overflow-hidden border-0 bg-linear-to-br from-primary/10 via-primary/5 to-background">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">{greeting}</span>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Welcome back, {user?.fullName?.split(" ")[0]}!
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Plan your next adventure and collaborate with your travel squad.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
