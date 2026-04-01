import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";

async function createUser() {
  try {
    await connectDB();

    const name = "TenantGuy5"; // CHANGE THIS
    const email = "tenant5@gmail.com";
    const plainPassword = "123";
    const role = "tenant";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists.");
      process.exit(0);
    }

    const password_hash = await bcrypt.hash(plainPassword, 10);

    const user = await User.create({
      name,
      email,
      password_hash,
      role,
    });

    console.log("User created:");
    console.log({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
  } finally {
    process.exit();
  }
}

createUser();

// be in server directory
// node src/scripts/createUser.js