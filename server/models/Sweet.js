import mongoose from "mongoose";

const sweetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Sweet name is required"],
      trim: true,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Sweet = mongoose.model("Sweet", sweetSchema);

export default Sweet;

