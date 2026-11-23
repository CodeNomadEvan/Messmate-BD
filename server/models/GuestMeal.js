const mongoose = require("mongoose");

const guestMealSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    breakfast: {
      type: Number,
      default: 0,
      min: 0,
    },
    lunch: {
      type: Number,
      default: 0,
      min: 0,
    },
    dinner: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

guestMealSchema.index({ messId: 1, date: 1 });

module.exports = mongoose.model("GuestMeal", guestMealSchema);
