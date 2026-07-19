import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      default: null,
    },

    provider: {
      type: String,
      enum: ["Razorpay"],
      default: "Razorpay",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    paymentId: {
      type: String,
      default: undefined,
    },

    amount: {
      type: Number,
      required: true,
      min: 100,
    },

    currency: {
      type: String,
      default: "INR",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
      required: true,
    },

    receipt: {
      type: String,
      required: true,
      unique: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index(
  { paymentId: 1 },
  {
    unique: true,
    partialFilterExpression: { paymentId: { $type: "string" } },
  },
);

const Payment = mongoose.model("Payment", paymentSchema);

const ensurePaymentIndexes = async () => {
  const indexes = await Payment.collection.indexes();
  const paymentIdIndex = indexes.find((index) => index.name === "paymentId_1");
  const hasCorrectPartialIndex =
    paymentIdIndex?.unique === true &&
    paymentIdIndex?.partialFilterExpression?.paymentId?.$type === "string";

  if (paymentIdIndex && !hasCorrectPartialIndex) {
    await Payment.collection.dropIndex("paymentId_1");
  }

  await Payment.syncIndexes();
};

export { ensurePaymentIndexes };
export default Payment;
