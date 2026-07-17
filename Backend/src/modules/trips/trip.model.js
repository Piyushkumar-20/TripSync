import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: true,
      minlength: 5,
      maxlength: 50,
    },

    description: {
      type: String,
      trim: true,
      required: true,
      minlength: 10,
      maxlength: 300,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    shareLink: {
      token: {
        type: String,
        default: null,
      },
      role: {
        type: String,
        enum: ["Viewer", "Editor"],
        default: "Viewer",
      },
      isEnabled: {
        type: Boolean,
        default: false,
      },
      expiresAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

export default mongoose.model("Trip", tripSchema);
