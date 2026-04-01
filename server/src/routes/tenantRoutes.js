import express from "express";
import jwt from "jsonwebtoken";
import Property from "../models/propertyModel.js";
import Payment from "../models/paymentModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const router = express.Router();

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password_hash");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protect error:", error);
    res.status(401).json({ message: "Not authorized." });
  }
};

router.get("/property", protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      tenant_user_ids: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found for tenant." });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error("get tenant property error:", error);
    res.status(500).json({ message: "Failed to fetch property." });
  }
});

router.get("/payments", protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      tenant_user_ids: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found for tenant." });
    }

    const payments = await Payment.find({
      property_id: property._id,
    })
      .populate("property_id")
      .sort({ due_date: -1 });

    res.status(200).json(payments);
  } catch (error) {
    console.error("get tenant payments error:", error);
    res.status(500).json({ message: "Failed to fetch payments." });
  }
});

router.get("/messages", protect, async (req, res) => {
  try {
    const property = await Property.findOne({
      tenant_user_ids: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found for tenant." });
    }

    const messages = await Message.find({
      tenant_user_id: req.user._id,
      property_id: property._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("get tenant messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
});

router.post("/messages", protect, async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required." });
    }

    const property = await Property.findOne({
      tenant_user_ids: req.user._id,
    });

    if (!property) {
      return res.status(404).json({ message: "Property not found for tenant." });
    }

    const newMessage = await Message.create({
      property_id: property._id,
      tenant_user_id: req.user._id,
      subject,
      message,
      status: "open",
      repair_cost: 0,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("create tenant message error:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

export default router;