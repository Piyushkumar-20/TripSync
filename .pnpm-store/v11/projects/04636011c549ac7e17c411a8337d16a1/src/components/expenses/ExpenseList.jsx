import { useState, useMemo } from "react";
import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDeleteExpense } from "@/hooks/useExpenses";
import BalancesDialog from "./BalancesDialog";

const CATEGORIES = ["All", "Food", "Hotel", "Transport", "Shopping", "Other"];

const CATEGORY_COLORS = {
  Food:      "bg-orange-100 text-orange-700",
  Hotel:     "bg-blue-100 text-blue-700",
  Transport: "bg-purple-100 text-purple-700",
  Shopping:  "bg-pink-100 text-pink-700",
  Other:     "bg-gray-100 text-gray-600",
};

function SummaryCard({ expenses, balances, currentUserId, onClick }) {
  const totalSpent = expenses?.reduce((sum, e) => sum + e.amount, 0) ?? 0;
  const myEntry    = balances?.find((b) => b.user._id?.toString() === currentUserId?.toString());
  const myBalance  = myEntry?.balance ?? 0;

  const balanceDescription = myBalance === 0 ? "You're all settled up"
    : myBalance > 0 ? "You get back" : "You owe";

  const balanceText = myBalance === 0 ? "Settled"
    : myBalance > 0 ? `+₹${myBalance.toFixed(2)}` : `-₹${Math.abs(myBalance).toFixed(2)}`;

  const balanceColor = myBalance === 0 ? "text-muted-foreground"
    : myBalance > 0 ? "text-green-600" : "text-red-500";

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total Expenses</span>
        <span className="font-semibold tabular-nums">₹{totalSpent.toLocaleString()}</span>
      </div>
      <div className="flex items-center justify-between text-sm mt-1">
        <span className="text-muted-foreground">{balanceDescription}</span>
        <span className={`font-semibold tabular-nums ${balanceColor}`}>{balanceText}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1.5">Tap to see all balances →</p>
    </button>
  );
}

function ExpenseRow({ expense, canDelete, tripId }) {
  const deleteExpense = useDeleteExpense(tripId);

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[expense.category]}`}>
          {expense.category}
        </span>
        <span className="truncate font-medium">{expense.title}</span>
        {expense.note && (
          <span className="hidden sm:inline text-xs text-muted-foreground truncate">
            — {expense.note}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <p className="font-medium tabular-nums">₹{expense.amount}</p>
          <p className="text-[10px] text-muted-foreground">
            ₹{expense.shareAmount}/person · {expense.paidBy?.fullName ?? "Unknown"}
          </p>
        </div>
        {canDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => deleteExpense.mutate(expense._id)}
            disabled={deleteExpense.isPending}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export default function ExpenseList({
  expenses,
  balances,
  expensesLoading,
  balancesLoading,
  canDelete,
  tripId,
  currentUserId,
}) {
  const [balancesOpen, setBalancesOpen] = useState(false);
  const [search,       setSearch]       = useState("");
  const [category,     setCategory]     = useState("All");

  const filtered = useMemo(() => {
    return expenses?.filter((e) => {
      const matchesCategory = category === "All" || e.category === category;
      const matchesSearch   = e.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [expenses, search, category]);

  if (expensesLoading || balancesLoading) {
    return (
      <div className="space-y-2 px-5 py-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }

  return (
    <>
      {/* Summary — fixed at top */}
      {expenses?.length > 0 && (
        <>
          <SummaryCard
            expenses={expenses}
            balances={balances}
            currentUserId={currentUserId}
            onClick={() => setBalancesOpen(true)}
          />
          <Separator />
        </>
      )}

      {/* Search + category filter */}
      {expenses?.length > 0 && (
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-border">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-xs"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scrollable expense list */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-border px-5">
        {expenses?.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No expenses yet.</p>
        ) : filtered?.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
        ) : (
          filtered?.map((expense) => (
            <ExpenseRow
              key={expense._id}
              expense={expense}
              canDelete={canDelete}
              tripId={tripId}
            />
          ))
        )}
      </div>

      <BalancesDialog
        open={balancesOpen}
        onClose={() => setBalancesOpen(false)}
        balances={balances}
      />
    </>
  );
}
