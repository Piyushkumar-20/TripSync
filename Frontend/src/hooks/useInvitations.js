import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { invitationService } from "@/services/invitationService";

export const useInvitation = (token) =>
  useQuery({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const res = await invitationService.getByToken(token);
      return res.data.data;
    },
    enabled: !!token,
    retry: false,
  });

export const useCreateInvitation = (tripId, onSuccess) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data) => invitationService.create(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", tripId] });
      toast.success("Invitation email sent.");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to send invitation.")),
  });
};

export const useAcceptInvitation = (token, onSuccess) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => invitationService.accept(token),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Invitation accepted.");
      onSuccess?.(res.data.data);
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to accept invitation.")),
  });
};
