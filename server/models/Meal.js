const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    messId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mess",
      required: true,
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    breakfast: {
      type: Boolean,
      default: true,
    },
    lunch: {
      type: Boolean,
      default: true,
    },
    dinner: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

mealSchema.index({ messId: 1, memberId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Meal", mealSchema);
