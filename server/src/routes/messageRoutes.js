import express from "express";
import Message from "../models/messageModel.js";
import { getAllMessages } from "../controllers/messageController.js";

const router = express.Router();

router.get("/", getAllMessages);

router.patch("/:id/status", async (req, res) => {
  try {
    const { status, repair_cost } = req.body;

    if (!["open", "in_progress", "resolved"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    message.status = status;

    if (repair_cost !== undefined) {
      message.repair_cost = Number(repair_cost) || 0;
    }

    await message.save();

    res.status(200).json(message);
  } catch (error) {
    console.error("update message status error:", error);
    res.status(500).json({ message: "Failed to update message status." });
  }
});

export default router;