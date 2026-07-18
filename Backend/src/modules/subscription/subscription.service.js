import crypto from "crypto";
import ApiError from "../../common/utils/api-error.js";
import getRazorpayClient from "../../providers/razorpay/razorpay.js";
import PLANS from "../../common/constants/plan.js";
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

const createOrder = async ({ userId, plan }) => {
  const planDetails = Object.values(PLANS).find((item) => item.name === plan);

  if (!planDetails) {
    throw ApiError.badRequest("Invalid subscription plan.");
  }

  if (planDetails.amount < 100) {
    throw ApiError.badRequest("Payment amount must be at least 100 paise.");
  }

  const subscription = await normalizeExpiredSubscription(
    await ensureFreeSubscription(userId),
  );

  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw ApiError.badGateway("Payment provider is not configured.");
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    throw ApiError.badGateway("Payment provider is not configured.");
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

  let order;
  try {
    order = await razorpay.orders.create({
      amount: planDetails.amount,
      currency: planDetails.currency,
      receipt,
      notes: {
        userId: userId.toString(),
        plan,
      },
    });
  } catch {
    throw ApiError.badGateway("Unable to create payment order. Please try again.");
  }

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
    key: process.env.RAZORPAY_KEY_ID,
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

  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    payment.status = "Failed";
    await payment.save();

    throw ApiError.badRequest("Invalid payment signature.");
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
