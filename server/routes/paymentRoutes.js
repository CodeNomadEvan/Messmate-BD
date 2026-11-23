const express = require("express");
const {
  getPayments,
  createPayment,
  deletePayment,
} = require("../controllers/paymentController");
const {
  authMiddleware,
  managerOnly,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getPayments);
router.post("/", authMiddleware, managerOnly, createPayment);
router.delete("/:id", authMiddleware, managerOnly, deletePayment);

module.exports = router;
