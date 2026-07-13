import api from "@/lib/api";

export const commentService = {
  getTripComments: (tripId) => api.get(`/trips/${tripId}/comments`),
  createTripComment: (tripId, data) => api.post(`/trips/${tripId}/comments`, data),
  update: (tripId, commentId, data) => api.patch(`/trips/${tripId}/comments/${commentId}`, data),
  delete: (tripId, commentId) => api.delete(`/trips/${tripId}/comments/${commentId}`),
};
