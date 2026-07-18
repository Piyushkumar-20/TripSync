import api from "@/lib/api";

export const tripService = {
  getAll:  ()             => api.get("/trips/getAllTrips"),
  create:  (data)         => api.post("/trips/create-trip", data),
  update:  (tripId, data) => api.patch(`/trips/${tripId}`, data),
  delete:  (tripId)       => api.delete(`/trips/${tripId}`),
  generateShareLink: (tripId) => api.post(`/trips/${tripId}/share-link`),
};
