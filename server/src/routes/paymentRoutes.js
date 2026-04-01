import express from "express";
import Payment from "../models/paymentModel.js";
import Property from "../models/propertyModel.js";
import User from "../models/userModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("property_id")
      .populate("submitted_by_user_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("get payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
});

router.patch("/:id/mark-paid", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    payment.status = "paid";
    payment.paid_date = new Date();

    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error("mark paid error:", error);
    res.status(500).json({ message: "Failed to update payment." });
  }
});

router.patch("/:id/mark-unpaid", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found." });
    }

    payment.status = "unpaid";
    payment.paid_date = null;

    await payment.save();

    res.status(200).json(payment);
  } catch (error) {
    console.error("mark unpaid error:", error);
    res.status(500).json({ message: "Failed to update payment." });
  }
});

export default router;