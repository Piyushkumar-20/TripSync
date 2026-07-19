import Joi from "joi";
import BaseDto from "../../../common/dto/base-dto.js";

class createOrderDto extends BaseDto {
  static schema = Joi.object({
    plan: Joi.string().valid("Pro").required().messages({
      "string.base": "Subscription plan must be a string.",
      "string.empty": "Subscription plan is required.",
      "any.only": "Subscription plan must be Pro.",
      "any.required": "Subscription plan is required.",
    }),
  });
}

class verifyPaymentDto extends BaseDto {
  static schema = Joi.object({
    razorpay_order_id: Joi.string().trim().required().messages({
      "any.required": "Razorpay order ID is required.",
    }),

    razorpay_payment_id: Joi.string().trim().required().messages({
      "any.required": "Razorpay payment ID is required.",
    }),

    razorpay_signature: Joi.string().trim().hex().required().messages({
      "any.required": "Razorpay signature is required.",
    }),
  });
}

export { verifyPaymentDto, createOrderDto };
