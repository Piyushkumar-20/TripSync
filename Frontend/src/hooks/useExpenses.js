import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { expenseService } from "@/services/expenseService";

export const useExpenses = (tripId) =>
  useQuery({
    queryKey: ["expenses", tripId],
    queryFn: async () => {
      const res = await expenseService.getAll(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useExpenseBalances = (tripId) =>
  useQuery({
    queryKey: ["expenses-balances", tripId],
    queryFn: async () => {
      const res = await expenseService.getBalances(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useCreateExpense = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => expenseService.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", tripId] });
      qc.invalidateQueries({ queryKey: ["expenses-balances", tripId] });
      toast.success("Expense added");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to add expense.")),
  });
};

export const useDeleteExpense = (tripId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId) => expenseService.delete(tripId, expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses", tripId] });
      qc.invalidateQueries({ queryKey: ["expenses-balances", tripId] });
      toast.success("Expense deleted");
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to delete expense.")),
  });
};
