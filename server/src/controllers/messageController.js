import Message from "../models/messageModel.js";

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("tenant_user_id", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error("getAllMessages error:", error);
    res.status(500).json({ message: "Failed to fetch messages." });
  }
};