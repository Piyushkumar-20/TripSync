import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateExpense } from "@/hooks/useExpenses";

const CATEGORIES = ["Food", "Hotel", "Transport", "Shopping", "Other"];

export default function AddExpenseDialog({ open, onClose, tripId }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const createExpense = useCreateExpense(tripId, onClose);

  useEffect(() => {
    if (open) reset({ title: "", note: "", amount: "", category: "" });
  }, [open, reset]);

  const onSubmit = (values) => {
    createExpense.mutate({
      title:    values.title.trim(),
      note:     values.note?.trim() || undefined,
      amount:   Number(values.amount),
      category: values.category,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="exp-title">Title</Label>
            <Input
              id="exp-title"
              placeholder="e.g. Dinner at hotel"
              {...register("title", {
                required: "Title is required",
                minLength: { value: 5, message: "At least 5 characters" },
                maxLength: { value: 50, message: "At most 50 characters" },
              })}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="exp-amount">Amount (₹)</Label>
              <Input
                id="exp-amount"
                type="number"
                min={1}
                placeholder="e.g. 1500"
                {...register("amount", {
                  required: "Amount is required",
                  min: { value: 1, message: "Min ₹1" },
                })}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exp-category">Category</Label>
              <select
                id="exp-category"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register("category", { required: "Category is required" })}
              >
                <option value="">Select…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && (
                <p className="text-xs text-destructive">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="exp-note">Note <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="exp-note"
              placeholder="e.g. very nice food"
              {...register("note", {
                minLength: { value: 5, message: "At least 5 characters" },
                maxLength: { value: 20, message: "At most 20 characters" },
              })}
            />
            {errors.note && (
              <p className="text-xs text-destructive">{errors.note.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createExpense.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createExpense.isPending}>
              {createExpense.isPending ? "Adding..." : "Add Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
