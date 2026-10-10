const mongoose = require("mongoose");

const messSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Mess name is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
    },
    address: {
      type: String,
      trim: true,
      default: "",
    },
    messCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cancellationDeadline: {
      type: String,
      default: "20:00",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Mess", messSchema);
