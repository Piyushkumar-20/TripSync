import * as subscriptionService from "./subscription.service.js";
import ApiResponse from "../../common/utils/api-response.js";

const createOrder = async (req, res) => {
  const order = await subscriptionService.createOrder({
    userId: req.user.id,
    plan: req.body.plan,
  });

  ApiResponse.created(res, "Subscription order created successfully!", order);
};

const verifyPayment = async (req, res) => {
  const subscription = await subscriptionService.verifyPayment({
    userId: req.user.id,
    razorpay_order_id: req.body.razorpay_order_id,
    razorpay_payment_id: req.body.razorpay_payment_id,
    razorpay_signature: req.body.razorpay_signature,
  });

  ApiResponse.ok(
    res,
    "Subscription activated successfully!",
    subscription,
  );
};

const getMySubscription = async (req, res) => {
  const subscription = await subscriptionService.getMySubscription({
    userId: req.user.id,
  });

  ApiResponse.ok(
    res,
    "Subscription fetched successfully!",
    subscription,
  );
};

export {
  createOrder,
  verifyPayment,
  getMySubscription,
};