import express from "express";

import * as subscriptionController from "./subscription.controller.js";
import authenticate from "../../middlewares/authenticate.js";

const router = express.Router();

router.get(
  "/me",
  authenticate,
  subscriptionController.getMySubscription,
);

router.post(
  "/create-order",
  authenticate,
  subscriptionController.createOrder,
);

router.post(
  "/verify",
  authenticate,
  subscriptionController.verifyPayment,
);

export default router;