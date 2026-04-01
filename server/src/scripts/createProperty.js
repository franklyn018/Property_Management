import { connectDB } from "../config/db.js";
import User from "../models/userModel.js";
import Property from "../models/propertyModel.js";

async function createProperty() {
  try {
    await connectDB();

    // const tenantEmails = ["tenant1@gmail.com", "tenant2@gmail.com"]; // CHANGE THIS
    const tenantEmails = ["tenant5@gmail.com"]; // CHANGE THIS

    const tenants = await User.find({ email: { $in: tenantEmails } });

    if (tenants.length === 0) {
      console.log("No tenants found.");
      process.exit(0);
    }

    const tenantIds = tenants.map((tenant) => tenant._id);

    const property = await Property.create({ // CHANGE THIS
      property_name: "Property D",
      address: "Diamond Bar",
      rent_amount: 2000,
      rent_due_day: 30,
      estimated_value: 400000,
      tenant_user_ids: tenantIds,
    });

    console.log("Property created:");
    console.log(property);
  } catch (error) {
    console.error("Error creating property:", error);
  } finally {
    process.exit();
  }
}

createProperty();

// be in server directory
// node src/scripts/createProperty.js