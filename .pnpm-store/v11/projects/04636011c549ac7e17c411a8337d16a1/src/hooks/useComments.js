import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { commentService } from "@/services/commentService";

export const tripCommentsKey = (tripId) => ["comments", tripId];

export const useTripComments = (tripId) =>
  useQuery({
    queryKey: tripCommentsKey(tripId),
    queryFn: async () => {
      const res = await commentService.getTripComments(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useCreateTripComment = (tripId) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (content) => commentService.createTripComment(tripId, { content }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: tripCommentsKey(tripId) });
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to add comment.")),
  });
};
