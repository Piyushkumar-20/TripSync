import api from "@/lib/api";

export const subscriptionService = {
  getMine: () => api.get("/subscriptions/me"),
  createOrder: (data) => api.post("/subscriptions/create-order", data),
  verifyPayment: (data) => api.post("/subscriptions/verify", data),
};
