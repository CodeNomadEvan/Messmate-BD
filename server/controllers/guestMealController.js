const guestMealModel = require("../models/guestMealModel");

function formatGuestMeal(item) {
  return {
    id: item._id.toString(),
    messId: item.messId.toString(),
    guestName: item.guestName,
    date: item.date,
    breakfast: item.breakfast,
    lunch: item.lunch,
    dinner: item.dinner,
    totalMeals: Number(item.breakfast) + Number(item.lunch) + Number(item.dinner),
    createdBy: item.createdBy?._id?.toString() || item.createdBy?.toString() || null,
    createdByName: item.createdBy?.name || "",
    createdAt: item.createdAt,
  };
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || ""));
}

function mealNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

async function getGuestMeals(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!validDate(startDate) || !validDate(endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    const meals = await guestMealModel.getGuestMeals(
      req.user.messId,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      count: meals.length,
      data: meals.map(formatGuestMeal),
    });
  } catch (error) {
    next(error);
  }
}

async function createGuestMeal(req, res, next) {
  try {
    const { guestName, date, breakfast, lunch, dinner } = req.body;

    if (!String(guestName || "").trim()) {
      return res.status(400).json({ success: false, message: "Guest name is required." });
    }

    if (!validDate(date)) {
      return res.status(400).json({ success: false, message: "A valid date is required." });
    }

    const b = mealNumber(breakfast);
    const l = mealNumber(lunch);
    const d = mealNumber(dinner);

    if (b === null || l === null || d === null || b + l + d === 0) {
      return res.status(400).json({
        success: false,
        message: "Add at least one guest meal.",
      });
    }

    const meal = await guestMealModel.createGuestMeal({
      messId: req.user.messId,
      guestName: String(guestName).trim(),
      date,
      breakfast: b,
      lunch: l,
      dinner: d,
      createdBy: req.user._id,
    });

    await meal.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      data: formatGuestMeal(meal),
    });
  } catch (error) {
    next(error);
  }
}

async function updateGuestMeal(req, res, next) {
  try {
    const { guestName, date, breakfast, lunch, dinner } = req.body;
    const b = mealNumber(breakfast);
    const l = mealNumber(lunch);
    const d = mealNumber(dinner);

    if (!String(guestName || "").trim() || !validDate(date) || b === null || l === null || d === null) {
      return res.status(400).json({ success: false, message: "Enter valid guest meal information." });
    }

    if (b + l + d === 0) {
      return res.status(400).json({ success: false, message: "Add at least one guest meal." });
    }

    const meal = await guestMealModel.updateGuestMeal(req.params.id, req.user.messId, {
      guestName: String(guestName).trim(),
      date,
      breakfast: b,
      lunch: l,
      dinner: d,
    });

    if (!meal) {
      return res.status(404).json({ success: false, message: "Guest meal not found." });
    }

    res.status(200).json({
      success: true,
      data: formatGuestMeal(meal),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteGuestMeal(req, res, next) {
  try {
    const meal = await guestMealModel.deleteGuestMeal(req.params.id, req.user.messId);

    if (!meal) {
      return res.status(404).json({ success: false, message: "Guest meal not found." });
    }

    res.status(200).json({
      success: true,
      message: "Guest meal deleted.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGuestMeals,
  createGuestMeal,
  updateGuestMeal,
  deleteGuestMeal,
};
