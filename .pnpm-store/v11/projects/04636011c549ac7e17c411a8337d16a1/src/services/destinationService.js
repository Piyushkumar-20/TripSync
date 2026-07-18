import api from "@/lib/api";

export const destinationService = {
  getAll: (tripId) => api.get(`/trips/${tripId}/destinations`),
  create: (tripId, data) => api.post(`/trips/${tripId}/destinations`, data),
  update: (tripId, destinationId, data) =>
    api.patch(`/trips/${tripId}/destinations/${destinationId}`, data),
  delete: (tripId, destinationId) =>
    api.delete(`/trips/${tripId}/destinations/${destinationId}`),
};
