const expenseModel = require("../models/expenseModel");
const guestMealModel = require("../models/guestMealModel");
const mealModel = require("../models/mealModel");

function countMeals(items) {
  return items.reduce(
    (total, item) =>
      total +
      Number(item.breakfast ? 1 : 0) +
      Number(item.lunch ? 1 : 0) +
      Number(item.dinner ? 1 : 0),
    0
  );
}

function countGuestMeals(items) {
  return items.reduce(
    (total, item) =>
      total +
      Number(item.breakfast || 0) +
      Number(item.lunch || 0) +
      Number(item.dinner || 0),
    0
  );
}

async function getMealRateSummary(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate || "") || !/^\d{4}-\d{2}-\d{2}$/.test(endDate || "")) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    const [expenses, meals, guestMeals] = await Promise.all([
      expenseModel.getExpenses(req.user.messId, startDate, endDate),
      mealModel.getMeals(req.user.messId, startDate, endDate),
      guestMealModel.getGuestMeals(req.user.messId, startDate, endDate),
    ]);

    const bazarExpenses = expenses.filter((expense) => expense.category === "Bazar");
    const utilityExpenses = expenses.filter((expense) => expense.category === "Utility");

    const bazarTotal = bazarExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
    const utilityTotal = utilityExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

    const memberMeals = countMeals(meals);
    const guestMealsCount = countGuestMeals(guestMeals);
    const totalMeals = memberMeals + guestMealsCount;
    const mealRate = totalMeals > 0 ? bazarTotal / totalMeals : 0;

    res.status(200).json({
      success: true,
      data: {
        startDate,
        endDate,
        bazarTotal,
        utilityTotal,
        totalExpense: bazarTotal + utilityTotal,
        memberMeals,
        guestMeals: guestMealsCount,
        totalMeals,
        mealRate: Number(mealRate.toFixed(2)),
        guestMealValue: Number((guestMealsCount * mealRate).toFixed(2)),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMealRateSummary };
