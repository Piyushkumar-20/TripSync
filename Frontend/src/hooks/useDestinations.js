import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { destinationService } from "@/services/destinationService";

export const useDestinations = (tripId) =>
  useQuery({
    queryKey: ["destinations", tripId],
    queryFn: async () => {
      const res = await destinationService.getAll(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useCreateDestination = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => destinationService.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations", tripId] });
      toast.success("Destination added successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to add destination.")),
  });
};

export const useUpdateDestination = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ destinationId, ...data }) =>
      destinationService.update(tripId, destinationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations", tripId] });
      toast.success("Destination updated successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to update destination.")),
  });
};

export const useDeleteDestination = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (destinationId) =>
      destinationService.delete(tripId, destinationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["destinations", tripId] });
      toast.success("Destination removed successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to remove destination.")),
  });
};
