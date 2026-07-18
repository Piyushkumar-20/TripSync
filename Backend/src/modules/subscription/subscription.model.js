import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    plan: {
      type: String,
      enum: ["Free", "Pro"],
      default: "Free",
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Cancelled", "Expired", "Pending"],
      default: "Pending",
      required: true,
    },

    provider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
    },

    customerId: {
      type: String,
      default: null,
    },

    subscriptionId: {
      type: String,
      default: null,
    },

    currentPeriodStart: {
      type: Date,
      default: null,
    },

    currentPeriodEnd: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Subscription", subscriptionSchema);