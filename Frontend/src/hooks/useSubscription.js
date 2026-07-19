import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserErrorMessage } from "@/lib/errors";
import { subscriptionService } from "@/services/subscriptionService";

const RAZORPAY_SCRIPT_ID = "razorpay-checkout-js";

function getRazorpayKey(order) {
  return order?.key;
}

function assertValidOrder(order) {
  const key = getRazorpayKey(order);
  const orderId = order?.order_id || order?.orderId;

  if (!key) {
    throw new Error("Payment key is missing. Please contact support.");
  }

  if (!orderId || !order?.amount || !order?.currency) {
    throw new Error("Payment order is incomplete. Please try again.");
  }

  return { key, orderId };
}

function loadRazorpayScript() {
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existingScript = document.getElementById(RAZORPAY_SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), { once: true });
      existingScript.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = RAZORPAY_SCRIPT_ID;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const useSubscription = () =>
  useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const res = await subscriptionService.getMine();
      return res.data.data;
    },
  });

export const useUpgradeSubscription = ({ user } = {}) => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const orderRes = await subscriptionService.createOrder({ plan: "Pro" });
      const order = orderRes.data.data;
      const { key, orderId } = assertValidOrder(order);

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Payment checkout could not be loaded.");
      }

      return await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key,
          amount: order.amount,
          currency: order.currency,
          name: "TripSync",
          description: "Pro subscription",
          order_id: orderId,
          prefill: {
            name: user?.fullName || "",
            email: user?.email || "",
          },
          theme: {
            color: "#ff6b35",
          },
          handler: async (response) => {
            try {
              const verifyRes = await subscriptionService.verifyPayment({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              });
              resolve(verifyRes.data.data);
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled.")),
          },
        });

        checkout.on("payment.failed", (response) => {
          reject(new Error(response?.error?.description || "Payment failed."));
        });

        checkout.open();
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription"] });
      qc.invalidateQueries({ queryKey: ["trips"] });
      qc.invalidateQueries({ queryKey: ["members"] });
      toast.success("Your Pro subscription is active.");
    },
    onError: (err) => {
      const message = /cancelled/i.test(err?.message ?? "")
        ? "Payment was cancelled."
        : getUserErrorMessage(err, "Payment failed. Please try again.");
      toast.error(message);
    },
  });
};
