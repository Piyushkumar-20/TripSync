import Joi from "joi";
import BaseDto from "../../../common/dto/base-dto.js";

class createOrderDto extends BaseDto {
  static schema = Joi.object({
    plan: Joi.string().valid("Pro").required().messages({
      "string.base": "Razorpay order ID must be a string.",
      "string.empty": "Razorpay order ID is required.",
      "any.required": "Razorpay order ID is required.",
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

    razorpay_signature: Joi.string().trim().required().messages({
      "any.required": "Razorpay signature is required.",
    }),
  });
}

export { verifyPaymentDto, createOrderDto };
