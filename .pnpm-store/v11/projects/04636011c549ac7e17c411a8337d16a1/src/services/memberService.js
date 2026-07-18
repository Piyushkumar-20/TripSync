import api from "@/lib/api";

export const memberService = {
  getAll: (tripId) => api.get(`/trips/${tripId}/members`),
  add: (tripId, data) => api.post(`/trips/${tripId}/members`, data),
  updateRole: (tripId, memberId, data) =>
    api.patch(`/trips/${tripId}/members/${memberId}`, data),
  remove: (tripId, memberId) =>
    api.delete(`/trips/${tripId}/members/${memberId}`),
};
