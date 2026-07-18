import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { documentService } from "@/services/documentService";

export const useDocuments = (tripId) =>
  useQuery({
    queryKey: ["documents", tripId],
    queryFn: async () => {
      const res = await documentService.getAll(tripId);
      return res.data.data;
    },
    enabled: !!tripId,
  });

export const useUploadDocument = (tripId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData) => documentService.upload(tripId, formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", tripId] });
      toast.success("Document uploaded");
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Upload failed.")),
  });
};

export const useDeleteDocument = (tripId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (docId) => documentService.delete(tripId, docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["documents", tripId] });
      toast.success("Document deleted");
    },
    onError: (err) =>
      toast.error(getUserErrorMessage(err, "Failed to delete document.")),
  });
};
