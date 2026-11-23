const guestMealModel = require("../models/guestMealModel");
const userModel = require("../models/userModel");
const { isValidDate, isValidDateRange } = require("../utils/date");

function formatGuestMeal(item) {
  return {
    id: item._id.toString(),
    messId: item.messId.toString(),
    guestName: item.guestName,
    hostMemberId: item.hostMemberId?._id?.toString() || item.hostMemberId?.toString() || null,
    hostMemberName: item.hostMemberId?.name || "",
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

function mealNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) && number >= 0 && number <= 50 ? number : null;
}

async function getGuestMeals(req, res, next) {
  try {
    const { startDate, endDate } = req.query;

    if (!isValidDateRange(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: "Start date and end date are required.",
      });
    }

    let meals = await guestMealModel.getGuestMeals(
      req.user.messId,
      startDate,
      endDate
    );

    // Members can only view guest meals charged to their own account.
    if (req.user.role === "Member") {
      meals = meals.filter((meal) =>
        meal.hostMemberId && meal.hostMemberId._id.toString() === req.user._id.toString()
      );
    }

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
    const { guestName, hostMemberId, date, breakfast, lunch, dinner } = req.body;

    if (!String(guestName || "").trim() || String(guestName).trim().length > 80) {
      return res.status(400).json({ success: false, message: "Guest name is required." });
    }

    if (!isValidDate(date)) {
      return res.status(400).json({ success: false, message: "A valid date is required." });
    }

    if (!hostMemberId) {
      return res.status(400).json({ success: false, message: "Select the member who hosted the guest." });
    }

    const hostMember = await userModel.getUserById(hostMemberId);
    if (!hostMember || hostMember.isActive === false || !hostMember.messId || hostMember.messId.toString() !== req.user.messId.toString()) {
      return res.status(404).json({ success: false, message: "Host member not found in this mess." });
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
      hostMemberId,
      date,
      breakfast: b,
      lunch: l,
      dinner: d,
      createdBy: req.user._id,
    });

    await meal.populate("createdBy", "name");
    await meal.populate("hostMemberId", "name");

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
    const { guestName, hostMemberId, date, breakfast, lunch, dinner } = req.body;
    const b = mealNumber(breakfast);
    const l = mealNumber(lunch);
    const d = mealNumber(dinner);

    if (!String(guestName || "").trim() || String(guestName).trim().length > 80 || !hostMemberId || !isValidDate(date) || b === null || l === null || d === null) {
      return res.status(400).json({ success: false, message: "Enter valid guest meal information." });
    }

    if (b + l + d === 0) {
      return res.status(400).json({ success: false, message: "Add at least one guest meal." });
    }

    const hostMember = await userModel.getUserById(hostMemberId);
    if (!hostMember || hostMember.isActive === false || !hostMember.messId || hostMember.messId.toString() !== req.user.messId.toString()) {
      return res.status(404).json({ success: false, message: "Host member not found in this mess." });
    }

    const meal = await guestMealModel.updateGuestMeal(req.params.id, req.user.messId, {
      guestName: String(guestName).trim(),
      hostMemberId,
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
