import api from "@/lib/api";

export const documentService = {
  getAll:  (tripId)        => api.get(`/trips/${tripId}/documents`),
  upload:  (tripId, formData) =>
    api.post(`/trips/${tripId}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete:  (tripId, docId) => api.delete(`/trips/${tripId}/documents/${docId}`),
};
