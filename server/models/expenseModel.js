const Expense = require("./Expense");

async function createExpense(data) {
  return await Expense.create(data);
}

async function getExpenses(messId, startDate, endDate, category) {
  const query = {
    messId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (category) {
    query.category = category;
  }

  return await Expense.find(query)
    .populate("createdBy", "name")
    .sort({ date: -1, createdAt: -1 });
}

async function getExpenseById(id, messId) {
  return await Expense.findOne({ _id: id, messId }).populate("createdBy", "name");
}

async function updateExpense(id, messId, data) {
  return await Expense.findOneAndUpdate(
    { _id: id, messId },
    data,
    { new: true, runValidators: true }
  ).populate("createdBy", "name");
}

async function deleteExpense(id, messId) {
  return await Expense.findOneAndDelete({ _id: id, messId });
}

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
