const mealModel = require("../models/mealModel");
const userModel = require("../models/userModel");

function formatMeal(meal) {
  return {
    id: meal._id.toString(),
    messId: meal.messId.toString(),
    memberId: meal.memberId.toString(),
    date: meal.date,
    breakfast: meal.breakfast,
    lunch: meal.lunch,
    dinner: meal.dinner,
  };
}

async function getMeals(req, res, next) {
  try {
    const { startDate, endDate, memberId } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    let selectedMemberId = memberId;

    if (req.user.role === "Member") {
      selectedMemberId = req.user._id.toString();
    }

    if (selectedMemberId) {
      const member = await userModel.getUserById(selectedMemberId);

      if (!member || !member.messId || member.messId.toString() !== req.user.messId.toString()) {
        return res.status(404).json({
          success: false,
          message: "Member not found in this mess.",
        });
      }
    }

    const meals = await mealModel.getMeals(
      req.user.messId,
      startDate,
      endDate,
      selectedMemberId
    );

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals.map(formatMeal),
    });
  } catch (error) {
    next(error);
  }
}

async function saveMeal(req, res, next) {
  try {
    if (req.user.role !== "Manager") {
      return res.status(403).json({
        success: false,
        message: "Manager access required.",
      });
    }

    const { memberId, date, breakfast, lunch, dinner } = req.body;

    if (!memberId || !date) {
      return res.status(400).json({
        success: false,
        message: "Member and date are required.",
      });
    }

    const member = await userModel.getUserById(memberId);

    if (!member || !member.messId || member.messId.toString() !== req.user.messId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this mess.",
      });
    }

    let meal = await mealModel.getMeal(req.user.messId, memberId, date);

    if (!meal) {
      meal = await mealModel.createMeal({
        messId: req.user.messId,
        memberId,
        date,
        breakfast: breakfast !== false,
        lunch: lunch !== false,
        dinner: dinner !== false,
      });
    } else {
      meal = await mealModel.updateMeal(meal._id, {
        breakfast: breakfast !== false,
        lunch: lunch !== false,
        dinner: dinner !== false,
      });
    }

    res.status(200).json({
      success: true,
      data: formatMeal(meal),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMeals, saveMeal };
