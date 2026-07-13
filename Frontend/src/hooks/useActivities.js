import { useEffect } from "react";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSocket } from "@/context/SocketContext";
import { getUserErrorMessage } from "@/lib/errors";
import { activityService } from "@/services/activityService";

export const activityQueryKey = (tripId, destinationId) => [
  "activities",
  tripId,
  destinationId,
];

export const useActivities = (tripId, destinationId) =>
  useQuery({
    queryKey: activityQueryKey(tripId, destinationId),
    queryFn: async () => {
      const res = await activityService.getAll(tripId, destinationId);
      return res.data.data;
    },
    enabled: !!tripId && !!destinationId,
  });

export const useDestinationActivityCounts = (tripId, destinations = []) => {
  const queries = useQueries({
    queries: destinations.map((destination) => ({
      queryKey: activityQueryKey(tripId, destination._id),
      queryFn: async () => {
        const res = await activityService.getAll(tripId, destination._id);
        return res.data.data;
      },
      enabled: !!tripId && !!destination?._id,
    })),
  });

  return destinations.reduce((counts, destination, index) => {
    counts[destination._id] = queries[index]?.data?.length ?? 0;
    return counts;
  }, {});
};

export const useCreateActivity = (tripId, destinationId, onSuccess) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => activityService.create(tripId, destinationId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityQueryKey(tripId, destinationId) });
      toast.success("Activity added successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to add activity.")),
  });
};

export const useUpdateActivity = (tripId, destinationId, onSuccess) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, ...data }) =>
      activityService.update(tripId, destinationId, activityId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityQueryKey(tripId, destinationId) });
      toast.success("Activity updated successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to update activity.")),
  });
};

export const useDeleteActivity = (tripId, destinationId, onSuccess) => {
  const qc = useQueryClient();
  const queryKey = activityQueryKey(tripId, destinationId);

  return useMutation({
    mutationFn: (activityId) => activityService.delete(tripId, destinationId, activityId),
    onSuccess: (_, activityId) => {
      qc.setQueryData(queryKey, (current = []) =>
        current.filter((activity) => activity._id !== activityId),
      );
      qc.invalidateQueries({ queryKey });
      toast.success("Activity deleted successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to delete activity.")),
  });
};

export const useReorderActivities = (tripId, destinationId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (activities) => activityService.reorder(tripId, destinationId, activities),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityQueryKey(tripId, destinationId) });
    },
  });
};

export const useActivitySocket = (tripId, destinationId) => {
  const { socket } = useSocket();
  const qc = useQueryClient();

  useEffect(() => {
    if (!socket || !tripId || !destinationId) return;

    const rejoin = () => socket.emit("join-trip", tripId);
    const invalidateActivities = () => {
      qc.invalidateQueries({ queryKey: activityQueryKey(tripId, destinationId) });
    };

    rejoin();
    socket.on("connect", rejoin);
    socket.on("activity:created", invalidateActivities);
    socket.on("activity:updated", invalidateActivities);
    socket.on("activity:deleted", invalidateActivities);
    socket.on("activity:orderUpdated", invalidateActivities);

    return () => {
      socket.off("connect", rejoin);
      socket.off("activity:created", invalidateActivities);
      socket.off("activity:updated", invalidateActivities);
      socket.off("activity:deleted", invalidateActivities);
      socket.off("activity:orderUpdated", invalidateActivities);
    };
  }, [socket, tripId, destinationId, qc]);
};
