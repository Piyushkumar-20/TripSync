import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import {
  createRazorpayOrder,
  getRazorpayCredentials,
  getRazorpayPayment,
} from "../../providers/razorpay/razorpay.js";
import PLANS from "../../common/constants/plan.js";
import { logger } from "../../common/utils/logger.js";
import Payment from "./payment_history.model.js";
import Subscription from "./subscription.model.js";

const ensureFreeSubscription = async (userId) => {
  return await Subscription.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        plan: "Free",
        status: "Active",
        provider: "Razorpay",
        currentPeriodStart: new Date(),
        currentPeriodEnd: null,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );
};

const normalizeExpiredSubscription = async (subscription) => {
  if (
    subscription.plan === "Pro" &&
    subscription.status === "Active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd < new Date()
  ) {
    subscription.plan = "Free";
    subscription.status = "Expired";
    await subscription.save();
  }

  return subscription;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchRazorpayPaymentWithRetry = async (paymentId) => {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await getRazorpayPayment(paymentId);
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      await delay(500 * attempt);
    }
  }
};

const createOrder = async ({ userId, plan }) => {
  const planDetails = Object.values(PLANS).find((item) => item.name === plan);

  if (!planDetails) {
    throw ApiError.badRequest("Invalid subscription plan.");
  }

  if (!Number.isInteger(planDetails.amount) || planDetails.amount < 100) {
    throw ApiError.badRequest("Payment amount must be at least 100 paise.", {
      plan,
      amount: planDetails.amount,
    });
  }

  if (!/^[A-Z]{3}$/.test(planDetails.currency)) {
    throw ApiError.badRequest("Payment currency is invalid.", {
      plan,
      currency: planDetails.currency,
    });
  }

  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(userId),
  );

  const credentials = getRazorpayCredentials();
  if (!credentials.keyId || !credentials.keySecret) {
    throw ApiError.internal("Payment provider is not configured.");
  }

  if (
    subscription.plan === "Pro" &&
    subscription.status === "Active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date()
  ) {
    throw ApiError.conflict("You already have an active Pro subscription.");
  }

  const receipt = `rcpt_${crypto.randomBytes(12).toString("hex")}`;
  const razorpayRequest = {
    amount: planDetails.amount,
    currency: planDetails.currency,
    receipt,
    notes: {
      userId: userId.toString(),
      plan,
    },
  };

  logger.info("Creating Razorpay order.", {
    endpoint: "POST /api/v1/subscriptions/create-order",
    userId,
    requestBody: { plan },
    razorpayRequest,
  });

  let order;
  try {
    order = await createRazorpayOrder(razorpayRequest);
  } catch (error) {
    if (error.code === "RAZORPAY_CONFIG_MISSING") {
      throw ApiError.internal("Payment provider is not configured.");
    }

    if (error.statusCode === 401) {
      throw ApiError.unauthorized("Payment provider authentication failed.");
    }

    logger.error("Razorpay order creation failed.", {
      endpoint: "POST /api/v1/subscriptions/create-order",
      userId,
      requestBody: { plan },
      razorpayRequest,
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.stack,
    });

    throw ApiError.internal("Unable to create payment order. Please try again.");
  }

  logger.info("Razorpay order created.", {
    endpoint: "POST /api/v1/subscriptions/create-order",
    userId,
    razorpayResponse: {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    },
  });

  await Payment.create({
    userId,
    subscriptionId: subscription._id,
    provider: "Razorpay",
    plan,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt,
    status: "Pending",
  });

  return {
    key: credentials.keyId,
    order_id: order.id,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    receipt,
  };
};

const verifyPayment = async ({
  userId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw ApiError.badRequest("Missing payment verification details.");
  }

  const payment = await Payment.findOne({
    orderId: razorpay_order_id,
    userId,
  });

  if (!payment) {
    throw ApiError.notFound("Payment not found.");
  }

  // Already verified
  if (payment.status === "Paid") {
    throw ApiError.badRequest("Payment has already been verified.");
  }

  const credentials = getRazorpayCredentials();
  if (!credentials.keyId || !credentials.keySecret) {
    throw ApiError.internal("Payment provider is not configured.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", credentials.keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const generatedSignatureBuffer = Buffer.from(generatedSignature, "hex");
  const receivedSignatureBuffer = Buffer.from(razorpay_signature, "hex");
  const isValidSignature =
    generatedSignatureBuffer.length === receivedSignatureBuffer.length &&
    crypto.timingSafeEqual(generatedSignatureBuffer, receivedSignatureBuffer);

  if (!isValidSignature) {
    payment.status = "Failed";
    await payment.save();

    throw ApiError.badRequest("Invalid payment signature.");
  }

  let providerPayment = null;
  try {
    providerPayment = await fetchRazorpayPaymentWithRetry(razorpay_payment_id);
  } catch (error) {
    logger.error("Razorpay payment lookup failed.", {
      endpoint: "POST /api/v1/subscriptions/verify",
      userId,
      requestBody: {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      },
      code: error.code,
      statusCode: error.statusCode,
      message: error.message,
      stack: error.stack,
    });
  }

  if (providerPayment && providerPayment.order_id !== payment.orderId) {
    payment.status = "Failed";
    await payment.save();
    throw ApiError.badRequest("Payment order mismatch.");
  }

  if (providerPayment && providerPayment.amount !== payment.amount) {
    payment.status = "Failed";
    await payment.save();
    throw ApiError.badRequest("Payment amount mismatch.");
  }

  if (providerPayment && providerPayment.currency !== payment.currency) {
    payment.status = "Failed";
    await payment.save();
    throw ApiError.badRequest("Payment currency mismatch.");
  }

  if (
    providerPayment &&
    !["captured", "authorized"].includes(providerPayment.status)
  ) {
    payment.status = "Failed";
    await payment.save();
    throw ApiError.badRequest("Payment is not authorized.");
  }

  payment.paymentId = razorpay_payment_id;
  payment.status = "Paid";
  payment.paidAt = new Date();

  await payment.save();

  const subscription = await Subscription.findById(payment.subscriptionId);

  if (!subscription) {
    throw ApiError.notFound("Subscription not found.");
  }

  const currentDate = new Date();
  const periodEnd = new Date(currentDate);
  periodEnd.setMonth(periodEnd.getMonth() + PLANS.PRO.durationInMonths);

  subscription.plan = "Pro";
  subscription.status = "Active";
  subscription.provider = "Razorpay";
  subscription.currentPeriodStart = currentDate;
  subscription.currentPeriodEnd = periodEnd;

  await subscription.save();

  return {
    subscription,
  };
};

const getMySubscription = async ({ userId }) => {
  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(userId),
  );

  return subscription.toObject();
};
export {
  createOrder,
  verifyPayment,
  getMySubscription,
  ensureFreeSubscription,
  normalizeExpiredSubscription,
};
