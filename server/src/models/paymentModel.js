import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },

    submitted_by_user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    amount: {
      type: Number,
      required: true,
    },

    due_date: {
      type: Date,
      required: true,
    },

    paid_date: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["paid", "unpaid", "failed", "late"],
      required: true,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;