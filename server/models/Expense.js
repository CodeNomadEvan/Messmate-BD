const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    category: {
      type: String,
      enum: ["Bazar", "Utility"],
      required: true,
    },
    type: {
      type: String,
      enum: ["Groceries", "Vegetables", "Fish & Meat", "Rice & Lentils", "Electricity", "Gas", "Water", "Internet", "Maid", "Cleaning", "Other"],
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    date: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

expenseSchema.index({ messId: 1, date: 1 });

module.exports = mongoose.model("Expense", expenseSchema);
