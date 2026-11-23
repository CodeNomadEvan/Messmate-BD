const expenseModel = require("../models/expenseModel");

function formatExpense(expense) {
  return {
    id: expense._id.toString(),
    messId: expense.messId.toString(),
    category: expense.category,
    type: expense.type,
    description: expense.description,
    amount: expense.amount,
    date: expense.date,
    createdBy: expense.createdBy?._id?.toString() || expense.createdBy?.toString() || null,
    createdByName: expense.createdBy?.name || "",
    createdAt: expense.createdAt,
  };
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

async function getExpenses(req, res, next) {
  try {
    const { startDate, endDate, category } = req.query;

    if (!validDate(startDate) || !validDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    const expenses = await expenseModel.getExpenses(
      req.user.messId,
      startDate,
      endDate,
      category
    );

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses.map(formatExpense),
    });
  } catch (error) {
    next(error);
  }
}

async function createExpense(req, res, next) {
  try {
    const { category, type, description, amount, date } = req.body;

    if (!["Bazar", "Utility"].includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid expense category." });
    }

    if (!validDate(date)) {
      return res.status(400).json({ success: false, message: "A valid date is required." });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Enter a valid amount." });
    }

    if (category === "Bazar" && !String(type || "").trim()) {
      return res.status(400).json({ success: false, message: "Bazar type is required." });
    }

    if (category === "Utility" && !String(type || "").trim()) {
      return res.status(400).json({ success: false, message: "Utility type is required." });
    }

    const expense = await expenseModel.createExpense({
      messId: req.user.messId,
      category,
      type: String(type || "").trim(),
      description: String(description || "").trim(),
      amount: numericAmount,
      date,
      createdBy: req.user._id,
    });

    await expense.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      data: formatExpense(expense),
    });
  } catch (error) {
    next(error);
  }
}

async function updateExpense(req, res, next) {
  try {
    const { category, type, description, amount, date } = req.body;

    if (!["Bazar", "Utility"].includes(category)) {
      return res.status(400).json({ success: false, message: "Invalid expense category." });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ success: false, message: "Enter a valid amount." });
    }

    const expense = await expenseModel.updateExpense(req.params.id, req.user.messId, {
      category,
      type: String(type || "").trim(),
      description: String(description || "").trim(),
      amount: numericAmount,
      date,
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    res.status(200).json({
      success: true,
      data: formatExpense(expense),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteExpense(req, res, next) {
  try {
    const expense = await expenseModel.deleteExpense(req.params.id, req.user.messId);

    if (!expense) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
};
