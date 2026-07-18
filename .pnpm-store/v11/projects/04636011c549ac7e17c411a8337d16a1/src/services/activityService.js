import api from "@/lib/api";

export const activityService = {
  getAll: (tripId, destinationId) =>
    api.get(`/trips/${tripId}/destinations/${destinationId}/activities`),
  create: (tripId, destinationId, data) =>
    api.post(`/trips/${tripId}/destinations/${destinationId}/activities`, data),
  update: (tripId, destinationId, activityId, data) =>
    api.patch(`/trips/${tripId}/destinations/${destinationId}/activities/${activityId}`, data),
  reorder: (tripId, destinationId, activities) =>
    api.patch(`/trips/${tripId}/destinations/${destinationId}/activities/reorder`, { activities }),
  delete: (tripId, destinationId, activityId) =>
    api.delete(`/trips/${tripId}/destinations/${destinationId}/activities/${activityId}`),
};
