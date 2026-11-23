const mongoose = require("mongoose");

const guestMealRequestSchema = new mongoose.Schema(
  {
    messId: { type: mongoose.Schema.Types.ObjectId, ref: "Mess", required: true },
    memberId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    guestName: { type: String, required: true, trim: true, maxlength: 80 },
    date: { type: String, required: true },
    breakfast: { type: Number, default: 0, min: 0, max: 50 },
    lunch: { type: Number, default: 0, min: 0, max: 50 },
    dinner: { type: Number, default: 0, min: 0, max: 50 },
    note: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

guestMealRequestSchema.index({ messId: 1, memberId: 1, date: 1, status: 1 });

module.exports = mongoose.model("GuestMealRequest", guestMealRequestSchema);
