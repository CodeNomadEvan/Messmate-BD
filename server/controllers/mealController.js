const mealModel = require("../models/mealModel");
const userModel = require("../models/userModel");

function formatMeal(meal) {
  if (!meal) return null;

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
    const query = { messId: req.user.messId };

    if (req.user.role === "Member") {
      query.memberId = req.user._id;
    } else if (req.query.memberId) {
      query.memberId = req.query.memberId;
    }

    if (req.query.date) {
      query.date = req.query.date;
    }

    if (req.query.startDate || req.query.endDate) {
      query.date = {};

      if (req.query.startDate) query.date.$gte = req.query.startDate;
      if (req.query.endDate) query.date.$lte = req.query.endDate;
    }

    const meals = await mealModel.getMeals(query);

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
    const { memberId, date, breakfast, lunch, dinner } = req.body;

    if (!memberId || !date) {
      return res.status(400).json({ success: false, message: "Member and date are required." });
    }

    const member = await userModel.getUserById(memberId).then((member) => (member && member.messId.toString() === req.user.messId.toString() ? member : null));

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    const meal = await mealModel.saveMeal(req.user.messId, memberId, date, {
      breakfast: Boolean(breakfast),
      lunch: Boolean(lunch),
      dinner: Boolean(dinner),
    });

    res.status(200).json({ success: true, data: formatMeal(meal) });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMeals, saveMeal };
