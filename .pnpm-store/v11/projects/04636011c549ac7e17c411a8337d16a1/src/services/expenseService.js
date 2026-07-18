import api from "@/lib/api";

export const expenseService = {
  getAll:      (tripId)               => api.get(`/trips/${tripId}/expenses`),
  create:      (tripId, data)         => api.post(`/trips/${tripId}/expenses`, data),
  update:      (tripId, expenseId, data) => api.patch(`/trips/${tripId}/expenses/${expenseId}`, data),
  delete:      (tripId, expenseId)    => api.delete(`/trips/${tripId}/expenses/${expenseId}`),
  getBalances: (tripId)               => api.get(`/trips/${tripId}/expenses/balances`),
};
