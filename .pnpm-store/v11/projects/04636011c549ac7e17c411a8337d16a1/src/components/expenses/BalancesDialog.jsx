import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

function BalanceRow({ entry }) {
  const isPositive = entry.balance > 0;
  const isZero     = entry.balance === 0;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="font-medium">{entry.user.fullName}</span>
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>Paid ₹{entry.paid}</span>
        <span>Owes ₹{Number(entry.owes).toFixed(2)}</span>
        <span
          className={`min-w-[72px] text-right font-semibold text-sm tabular-nums ${
            isZero ? "text-muted-foreground" : isPositive ? "text-green-600" : "text-red-500"
          }`}
        >
          {isZero
            ? "Settled"
            : isPositive
            ? `+₹${entry.balance.toFixed(2)}`
            : `-₹${Math.abs(entry.balance).toFixed(2)}`}
        </span>
      </div>
    </div>
  );
}

export default function BalancesDialog({ open, onClose, balances }) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Balances</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-muted-foreground -mt-2">
          Positive → gets back money · Negative → owes money
        </p>

        <Separator />

        <div className="divide-y divide-border">
          {balances?.map((entry) => (
            <BalanceRow key={entry.user._id} entry={entry} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
