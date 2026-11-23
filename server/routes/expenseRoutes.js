const express = require("express");
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getExpenses);
router.post("/", protect, allowRoles("Manager"), createExpense);
router.put("/:id", protect, allowRoles("Manager"), updateExpense);
router.delete("/:id", protect, allowRoles("Manager"), deleteExpense);

module.exports = router;
