import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { checklistService } from "@/services/checklistService";

// Query key shape: ["checklists", tripId, type]. Shared checklist socket events
// invalidate only the ["checklists", tripId, "Shared"] query.
const checklistKey = (tripId, type) => ["checklists", tripId, type];

export const useChecklist = (tripId, type) =>
  useQuery({
    queryKey: checklistKey(tripId, type),
    queryFn: async () => {
      const res = await checklistService.getAll(tripId, type);
      return res.data.data;
    },
    enabled: !!tripId && !!type,
  });

export const useCreateChecklistItem = (tripId, type, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text) => checklistService.create(tripId, type, { text }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: checklistKey(tripId, type) });
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err?.response?.data?.message || "Failed to add item"),
  });
};

export const useUpdateChecklistItem = (tripId, type) => {
  const qc = useQueryClient();
  const key = checklistKey(tripId, type);
  return useMutation({
    mutationFn: ({ itemId, data }) => checklistService.update(tripId, itemId, data),
    // Optimistic update keeps toggles instant and responsive.
    onMutate: async ({ itemId, data }) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) =>
        old?.map((item) => (item._id === itemId ? { ...item, ...data } : item)),
      );
      return { previous };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      toast.error(err?.response?.data?.message || "Failed to update item");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};

export const useDeleteChecklistItem = (tripId, type) => {
  const qc = useQueryClient();
  const key = checklistKey(tripId, type);
  return useMutation({
    mutationFn: (itemId) => checklistService.delete(tripId, itemId),
    onMutate: async (itemId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);
      qc.setQueryData(key, (old) => old?.filter((item) => item._id !== itemId));
      return { previous };
    },
    onSuccess: () => toast.success("Item deleted"),
    onError: (err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(key, ctx.previous);
      toast.error(err?.response?.data?.message || "Failed to delete item");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: key }),
  });
};
