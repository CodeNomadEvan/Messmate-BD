const expenseModel = require("../models/expenseModel");
const guestMealModel = require("../models/guestMealModel");
const mealModel = require("../models/mealModel");
const userModel = require("../models/userModel");
const paymentModel = require("../models/paymentModel");
const { roundMoney, calculateMealRate, allocateUtilityShares, calculateMemberBalance } = require("../utils/finance");

function countMeals(meal) {
  return Number(Boolean(meal.breakfast)) + Number(Boolean(meal.lunch)) + Number(Boolean(meal.dinner));
}

function countGuestMeals(meal) {
  return Number(meal.breakfast || 0) + Number(meal.lunch || 0) + Number(meal.dinner || 0);
}

async function getMonthlyReport(req, res, next) {
  try {
    const { month } = req.query;
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month || "")) {
      return res.status(400).json({ success: false, message: "Select a valid report month (YYYY-MM)." });
    }

    const [year, monthNumber] = month.split("-").map(Number);
    const startDate = `${month}-01`;
    const endDate = `${month}-${String(new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()).padStart(2, "0")}`;

    const [expenses, meals, guestMeals, members, payments] = await Promise.all([
      expenseModel.getExpenses(req.user.messId, startDate, endDate),
      mealModel.getMeals(req.user.messId, startDate, endDate),
      guestMealModel.getGuestMeals(req.user.messId, startDate, endDate),
      userModel.getMembersForPeriod(req.user.messId, startDate, endDate),
      paymentModel.getPayments(req.user.messId, startDate, endDate),
    ]);

    const bazarTotal = expenses
      .filter((item) => item.category === "Bazar")
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const utilityTotal = expenses
      .filter((item) => item.category === "Utility")
      .reduce((sum, item) => sum + Number(item.amount), 0);

    const memberMealCount = meals.reduce((sum, item) => sum + countMeals(item), 0);
    const guestMealCount = guestMeals.reduce((sum, item) => sum + countGuestMeals(item), 0);
    const totalMealCount = memberMealCount + guestMealCount;
    const mealRate = calculateMealRate(bazarTotal, totalMealCount);
    const utilityShares = allocateUtilityShares(utilityTotal, members.length);

    const memberReports = members.map((member, index) => {
      const memberId = member._id.toString();
      const ownMeals = meals
        .filter((item) => item.memberId.toString() === memberId)
        .reduce((sum, item) => sum + countMeals(item), 0);
      const hostedGuestMeals = guestMeals
        .filter((item) => item.hostMemberId && item.hostMemberId._id.toString() === memberId)
        .reduce((sum, item) => sum + countGuestMeals(item), 0);
      const memberPayments = payments
        .filter((item) => item.memberId && item.memberId._id.toString() === memberId)
        .reduce((sum, item) => sum + Number(item.amount), 0);
      const balance = calculateMemberBalance({
        memberMealCount: ownMeals,
        guestMealCount: hostedGuestMeals,
        mealRate,
        utilityShare: utilityShares[index] || 0,
        totalPaid: memberPayments,
      });

      return {
        memberId,
        memberName: member.name,
        memberMealCount: ownMeals,
        guestMealCount: hostedGuestMeals,
        ...balance,
      };
    });

    const visibleReports = req.user.role === "Member"
      ? memberReports.filter((item) => item.memberId === req.user._id.toString())
      : memberReports;
    const unassignedGuestMeals = guestMeals
      .filter((item) => !item.hostMemberId)
      .reduce((sum, item) => sum + countGuestMeals(item), 0);

    const totalPaid = visibleReports.reduce((sum, item) => sum + item.totalPaid, 0);
    const totalCost = visibleReports.reduce((sum, item) => sum + item.totalCost, 0);
    const totalDue = visibleReports.reduce((sum, item) => sum + item.due, 0);
    const totalAdvance = visibleReports.reduce((sum, item) => sum + item.advance, 0);

    const categories = {};
    expenses.forEach((item) => {
      const category = item.type || item.category;
      categories[category] = (categories[category] || 0) + Number(item.amount);
    });
    const totalExpenses = bazarTotal + utilityTotal;
    const spendingInsights = Object.entries(categories)
      .map(([category, amount]) => ({
        category,
        amount: roundMoney(amount),
        percentage: totalExpenses > 0 ? roundMoney((amount / totalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    res.status(200).json({
      success: true,
      data: {
        month,
        startDate,
        endDate,
        memberCount: members.length,
        memberMeals: memberMealCount,
        guestMeals: guestMealCount,
        unassignedGuestMeals,
        totalMeals: totalMealCount,
        bazarTotal: roundMoney(bazarTotal),
        utilityTotal: roundMoney(utilityTotal),
        totalExpenses: roundMoney(totalExpenses),
        mealRate: roundMoney(mealRate),
        totalCost: roundMoney(totalCost),
        totalPaid: roundMoney(totalPaid),
        totalDue: roundMoney(totalDue),
        totalAdvance: roundMoney(totalAdvance),
        memberReports: visibleReports,
        spendingInsights,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMonthlyReport };
