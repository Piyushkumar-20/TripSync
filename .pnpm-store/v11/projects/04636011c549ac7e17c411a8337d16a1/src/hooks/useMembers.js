import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { memberService } from "@/services/memberService";

export const useMembers = (tripId) =>
  useQuery({
    queryKey: ["members", tripId],
    queryFn: async () => {
      const res = await memberService.getAll(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useAddMember = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => memberService.add(tripId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", tripId] });
      toast.success("Member added successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to add member.")),
  });
};

export const useUpdateMemberRole = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }) =>
      memberService.updateRole(tripId, memberId, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", tripId] });
      toast.success("Role updated successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to update role.")),
  });
};

export const useRemoveMember = (tripId, onSuccess) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId) => memberService.remove(tripId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", tripId] });
      toast.success("Member removed successfully");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to remove member.")),
  });
};
