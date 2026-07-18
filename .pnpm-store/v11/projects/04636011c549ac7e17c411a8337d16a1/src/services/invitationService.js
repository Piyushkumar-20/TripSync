import api from "@/lib/api";

export const invitationService = {
  create: (tripId, data) => api.post(`/trips/${tripId}/invitations`, data),
  getByToken: (token) => api.get(`/trips/invitations/${token}`),
  accept: (token) => api.post(`/trips/invitations/${token}/accept`),
};
