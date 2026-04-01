import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    property_name: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    rent_amount: {
      type: Number,
      required: true,
    },

    rent_due_day: {
      type: Number,
      required: true,
      min: 1,
      max: 31,
    },

    estimated_value: {
      type: Number,
      default: 0,
    },

    tenant_user_ids: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;