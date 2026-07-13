import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { tripService } from "@/services/tripService";

export const useTrips = () =>
  useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await tripService.getAll();
      return res.data.data;
    },
  });

export const useCreateTrip = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => tripService.create(data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip created successfully");
      onSuccess?.(data);
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to create trip.")),
  });
};

export const useUpdateTrip = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ tripId, ...data }) => tripService.update(tripId, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip updated successfully");
      onSuccess?.(data);
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to update trip.")),
  });
};

export const useDeleteTrip = (onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tripId) => tripService.delete(tripId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip deleted successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to delete trip.")),
  });
};
