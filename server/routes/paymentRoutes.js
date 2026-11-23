const express = require("express");
const {
  getPayments,
  createPayment,
  deletePayment,
} = require("../controllers/paymentController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getPayments);
router.post("/", protect, allowRoles("Manager"), createPayment);
router.delete("/:id", protect, allowRoles("Manager"), deletePayment);

module.exports = router;
