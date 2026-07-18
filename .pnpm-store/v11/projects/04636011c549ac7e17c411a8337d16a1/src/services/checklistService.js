import api from "@/lib/api";

// Checklist routes are mounted at /api/v1/trips/checklists on the backend.
// `type` is the checklist type ("Packing" | "Shared").
export const checklistService = {
  getAll: (tripId, type)         => api.get(`/trips/checklists/${tripId}/${type}`),
  create: (tripId, type, data)   => api.post(`/trips/checklists/${tripId}/${type}`, data),
  update: (tripId, itemId, data) => api.patch(`/trips/checklists/${tripId}/${itemId}`, data),
  delete: (tripId, itemId)       => api.delete(`/trips/checklists/${tripId}/${itemId}`),
};
