import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import {
  createRazorpayOrder,
  getRazorpayCredentials,
  getRazorpayPayment,
} from "../../providers/razorpay/razorpay.js";
import { env } from "../../common/config/env.js";
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

const verifySignature = ({ payload, signature, secret }) => {
  if (!signature) {
    throw ApiError.badRequest("Missing Razorpay signature.");
  }

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const generatedSignatureBuffer = Buffer.from(generatedSignature, "hex");
  const receivedSignatureBuffer = Buffer.from(signature, "hex");

  return (
    generatedSignatureBuffer.length === receivedSignatureBuffer.length &&
    crypto.timingSafeEqual(generatedSignatureBuffer, receivedSignatureBuffer)
  );
};

const activateSubscription = async (subscriptionId) => {
  const subscription = await Subscription.findById(subscriptionId);

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

  return subscription;
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

  if (payment.status === "Paid") {
    return {
      subscription: await activateSubscription(payment.subscriptionId),
    };
  }

  const credentials = getRazorpayCredentials();
  if (!credentials.keyId || !credentials.keySecret) {
    throw ApiError.internal("Payment provider is not configured.");
  }

  const isValidSignature = verifySignature({
    payload: `${razorpay_order_id}|${razorpay_payment_id}`,
    signature: razorpay_signature,
    secret: credentials.keySecret,
  });

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

  const subscription = await activateSubscription(payment.subscriptionId);

  return {
    subscription,
  };
};

const parseWebhookBody = (rawBody) => {
  const body = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody;

  if (!body) {
    throw ApiError.badRequest("Webhook body is empty.");
  }

  try {
    return {
      payload: body,
      event: typeof body === "string" ? JSON.parse(body) : body,
    };
  } catch {
    throw ApiError.badRequest("Webhook body is invalid JSON.");
  }
};

const markWebhookPaymentFailed = async ({ orderId, paymentId }) => {
  const payment = await Payment.findOne({ orderId });

  if (!payment) {
    logger.error("Webhook payment record not found.", {
      orderId,
      paymentId,
    });
    return null;
  }

  if (payment.status !== "Paid") {
    payment.status = "Failed";
    await payment.save();
  }

  return payment;
};

const markWebhookPaymentPaid = async ({ orderId, paymentId, amount, currency }) => {
  const payment = await Payment.findOne({ orderId });

  if (!payment) {
    logger.error("Webhook payment record not found.", {
      orderId,
      paymentId,
      amount,
      currency,
    });
    return null;
  }

  if (payment.amount !== amount || payment.currency !== currency) {
    payment.status = "Failed";
    await payment.save();

    throw ApiError.badRequest("Webhook payment details do not match order.");
  }

  if (payment.status !== "Paid") {
    payment.paymentId = paymentId;
    payment.status = "Paid";
    payment.paidAt = new Date();
    await payment.save();
  }

  await activateSubscription(payment.subscriptionId);

  return payment;
};

const handleWebhook = async ({ signature, rawBody }) => {
  if (!env.razorpayWebhookSecret) {
    throw ApiError.internal("Razorpay webhook secret is not configured.");
  }

  const { payload, event } = parseWebhookBody(rawBody);
  const isValidSignature = verifySignature({
    payload,
    signature,
    secret: env.razorpayWebhookSecret,
  });

  if (!isValidSignature) {
    throw ApiError.badRequest("Invalid Razorpay webhook signature.");
  }

  const entity = event?.payload?.payment?.entity;
  const orderId = entity?.order_id;
  const paymentId = entity?.id;

  logger.info("Razorpay webhook received.", {
    event: event?.event,
    orderId,
    paymentId,
  });

  if (!orderId || !paymentId) {
    logger.info("Ignoring Razorpay webhook without order/payment id.", {
      event: event?.event,
    });
    return { ignored: true };
  }

  if (["payment.captured", "payment.authorized"].includes(event.event)) {
    await markWebhookPaymentPaid({
      orderId,
      paymentId,
      amount: entity.amount,
      currency: entity.currency,
    });
  } else if (event.event === "payment.failed") {
    await markWebhookPaymentFailed({ orderId, paymentId });
  } else {
    logger.info("Ignoring unsupported Razorpay webhook event.", {
      event: event.event,
      orderId,
      paymentId,
    });
  }

  return { processed: true };
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
  handleWebhook,
  ensureFreeSubscription,
  normalizeExpiredSubscription,
};
