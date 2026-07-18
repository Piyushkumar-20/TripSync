import { Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUpgradeSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function UpgradeDialog({ open, onClose, title, description }) {
  const { user } = useAuth();
  const upgrade = useUpgradeSubscription({ user });

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
            <Crown className="h-5 w-5 text-primary" />
          </div>
          <DialogTitle>{title || "Upgrade to Pro"}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {description ||
              "Unlock unlimited trips, unlimited members, share links, and real-time collaboration features."}
          </p>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={upgrade.isPending}>
            Not now
          </Button>
          <Button onClick={() => upgrade.mutate()} disabled={upgrade.isPending}>
            {upgrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upgrade
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
