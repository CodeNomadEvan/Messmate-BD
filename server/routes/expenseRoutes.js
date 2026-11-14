const express = require("express");
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const { authMiddleware, managerOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getExpenses);
router.post("/", authMiddleware, managerOnly, createExpense);
router.put("/:id", authMiddleware, managerOnly, updateExpense);
router.delete("/:id", authMiddleware, managerOnly, deleteExpense);

module.exports = router;
