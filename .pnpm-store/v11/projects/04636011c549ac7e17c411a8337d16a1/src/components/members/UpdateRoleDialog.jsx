import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateMemberRole } from "@/hooks/useMembers";

const ROLES = [
  { value: "Editor", label: "Editor" },
  { value: "Viewer", label: "Viewer" },
];

export default function UpdateRoleDialog({ open, onClose, member, tripId }) {
  const [role, setRole] = useState(member?.role ?? "Viewer");
  const updateRole = useUpdateMemberRole(tripId, onClose);

  useEffect(() => {
    if (open && member) setRole(member.role);
  }, [open, member]);

  const handleSave = () => {
    if (!member) return;
    updateRole.mutate({ memberId: member._id, role });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Update Role</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Update role for{" "}
            <span className="font-semibold text-foreground">
              {member?.userId?.fullName}
            </span>
          </p>

          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateRole.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateRole.isPending}>
            {updateRole.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
