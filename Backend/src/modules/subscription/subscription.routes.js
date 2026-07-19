import express from "express";

import * as subscriptionController from "./subscription.controller.js";
import authenticate from "../auth/auth.middleware.js"
import validate from "../../common/validators/validator.js";
import { verifyPaymentDto, createOrderDto } from "./dto/subscription.dto.js"
const router = express.Router();
const webhookRouter = express.Router();

router.get(
  "/me",
  authenticate,
  subscriptionController.getMySubscription,
);

router.post(
  "/create-order",
  authenticate,
  validate(createOrderDto),
  subscriptionController.createOrder,
);

router.post(
  "/verify",
  authenticate,
  validate(verifyPaymentDto),
  subscriptionController.verifyPayment,
);

router.post(
  "/verify-payment",
  authenticate,
  validate(verifyPaymentDto),
  subscriptionController.verifyPayment,
);

webhookRouter.post(
  "/",
  subscriptionController.handleWebhook,
);

export default router;
export { webhookRouter };
