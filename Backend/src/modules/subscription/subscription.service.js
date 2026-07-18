import crypto from "crypto";
import ApiError from "../.././common/utils/api-error.js"

const createOrder = async ({ userId, plan }) => {
  // Validate Plan
  const planDetails = Object.values(PLANS).find((item) => item.name === plan);

  if (!planDetails) {
    throw new ApiError.badGateway("Invalid subscription plan.")
  }

  // Find existing subscription
  const subscription = await Subscription.findOne({ userId });

  if (!subscription) {
    throw new ApiError.notFound("Subscription not found.");
  }

  if (
    subscription.plan === "Pro" &&
    subscription.status === "Active" &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd > new Date()
  ) {
    throw new ApiError.conflict("You have already a Pro Subscription");
  }

  // Create unique receipt
  const receipt = `receipt_${crypto.randomUUID()}`;

  // Create Razorpay Order
  const order = await razorpay.orders.create({
    amount: planDetails.amount,
    currency: planDetails.currency,
    receipt,
    notes: {
      userId: userId.toString(),
      plan,
    },
  });

  // Save pending payment
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
  // Find payment
  const payment = await Payment.findOne({
    orderId: razorpay_order_id,
    userId,
  });

  if (!payment) {
    throw new ApiError.notFound("Payment not found.");
  }

  // Already verified
  if (payment.status === "Paid") {
    throw new ApiError.badRequest("Payment has already been verified.");
  }

  // Generate Signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  // Verify Signature
  if (generatedSignature !== razorpay_signature) {
    payment.status = "Failed";
    await payment.save();

    throw new ApiError.badRequest("Invalid payment signature.");
  }

  // Update Payment
  payment.paymentId = razorpay_payment_id;
  payment.status = "Paid";
  payment.paidAt = new Date();

  await payment.save();

  // Find Subscription
  const subscription = await Subscription.findById(payment.subscriptionId);

  if (!subscription) {
    throw new ApiError.notFound("Payment not found.");
  }

  const currentDate = new Date();

  subscription.plan = "Pro";
  subscription.status = "Active";
  subscription.provider = "Razorpay";
  subscription.currentPeriodStart = currentDate;
  subscription.currentPeriodEnd = new Date(
    currentDate.setMonth(currentDate.getMonth() + 1),
  );

  await subscription.save();

  return {
    message: "Subscription activated successfully.",
  };
};

export { createOrder, verifyPayment };