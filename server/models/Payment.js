const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
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
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    method: {
      type: String,
      enum: ["Cash", "bKash", "Nagad", "Bank", "Other"],
      default: "Cash",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 250,
      default: "",
    },
    date: {
      type: String,
      required: true,
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ messId: 1, memberId: 1, date: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
