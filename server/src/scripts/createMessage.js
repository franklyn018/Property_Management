import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";
import Message from "../models/messageModel.js";

async function createMessage() {
  try {
    await connectDB();

    const tenantEmail = "tenant1@gmail.com"; // CHANGE THIS

    const tenant = await User.findOne({ email: tenantEmail });
    if (!tenant) {
      console.log("Tenant not found.");
      process.exit(0);
    }

    const property = await Property.findOne({
      tenant_user_ids: tenant._id,
    });

    if (!property) {
      console.log("Property not found for this tenant.");
      process.exit(0);
    }

    const message = await Message.create({
      property_id: property._id,
      tenant_user_id: tenant._id,
      subject: "Floor Tile Destroyed", // CHANGE THIS
      message: "Floor tile is destroyed", // CHANGE THIS
      status: "open", // open, in_progress, resolved
    });

    console.log("Message created:");
    console.log({
      id: message._id.toString(),
      property_id: message.property_id.toString(),
      tenant_user_id: message.tenant_user_id.toString(),
      subject: message.subject,
      message: message.message,
      status: message.status,
      createdAt: message.createdAt,
    });
  } catch (error) {
    console.error("Error creating message:", error);
  } finally {
    process.exit();
  }
}

createMessage();

// be in server directory
// node src/scripts/createMessage.js