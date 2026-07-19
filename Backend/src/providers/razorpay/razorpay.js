import Razorpay from "razorpay";
import { env } from "../../common/config/env.js";

let razorpayClient;
const getProviderStatusCode = (error) =>
  Number(error.statusCode || error.status) || 500;

const getRazorpayCredentials = () => ({
  keyId: env.razorpayKeyId,
  keySecret: env.razorpayKeySecret,
});

const getRazorpayClient = () => {
  if (!razorpayClient) {
    const credentials = getRazorpayCredentials();

    if (!credentials.keyId || !credentials.keySecret) {
      const error = new Error("Razorpay credentials are missing.");
      error.code = "RAZORPAY_CONFIG_MISSING";
      throw error;
    }

    razorpayClient = new Razorpay({
      key_id: credentials.keyId,
      key_secret: credentials.keySecret,
    });
  }

  return razorpayClient;
};

const createRazorpayOrder = async ({ amount, currency, receipt, notes }) => {
  try {
    return await getRazorpayClient().orders.create({
      amount,
      currency,
      receipt,
      notes,
    });
  } catch (error) {
    error.code = error.code || "RAZORPAY_ORDER_FAILED";
    error.statusCode = getProviderStatusCode(error);
    throw error;
  }
};

const getRazorpayPayment = async (paymentId) => {
  try {
    return await getRazorpayClient().payments.fetch(paymentId);
  } catch (error) {
    error.code = error.code || "RAZORPAY_PAYMENT_LOOKUP_FAILED";
    error.statusCode = getProviderStatusCode(error);
    throw error;
  }
};

export {
  createRazorpayOrder,
  getRazorpayCredentials,
  getRazorpayClient,
  getRazorpayPayment,
};
