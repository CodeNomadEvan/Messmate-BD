const guestMealRequestModel = require("../models/guestMealRequestModel");
const guestMealModel = require("../models/guestMealModel");
const { isValidDate } = require("../utils/date");

function mealNumber(value) {
  const number = Number(value || 0);
  return Number.isInteger(number) && number >= 0 && number <= 50 ? number : null;
}

function formatRequest(request) {
  return {
    id: request._id.toString(),
    guestName: request.guestName,
    memberId: request.memberId?._id?.toString() || request.memberId?.toString(),
    memberName: request.memberId?.name || "Member",
    date: request.date,
    breakfast: request.breakfast,
    lunch: request.lunch,
    dinner: request.dinner,
    totalMeals: request.breakfast + request.lunch + request.dinner,
    note: request.note,
    status: request.status,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt,
  };
}

async function createGuestMealRequest(req, res, next) {
  try {
    const { guestName, date, breakfast, lunch, dinner, note } = req.body;
    const name = String(guestName || "").trim();
    const b = mealNumber(breakfast);
    const l = mealNumber(lunch);
    const d = mealNumber(dinner);

    if (!name || name.length > 80 || !isValidDate(date) || b === null || l === null || d === null || b + l + d === 0) {
      return res.status(400).json({ success: false, message: "Enter a guest name, valid date and at least one guest meal." });
    }
    if (date < new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" })) {
      return res.status(400).json({ success: false, message: "Past dates are not allowed." });
    }
    if (String(note || "").length > 500) {
      return res.status(400).json({ success: false, message: "Note cannot exceed 500 characters." });
    }

    const duplicate = await guestMealRequestModel.findDuplicatePending(req.user.messId, req.user._id, date);
    if (duplicate) {
      return res.status(409).json({ success: false, message: "You already have a pending guest meal request for this date." });
    }

    const request = await guestMealRequestModel.createRequest({
      messId: req.user.messId,
      memberId: req.user._id,
      guestName: name,
      date,
      breakfast: b,
      lunch: l,
      dinner: d,
      note: String(note || "").trim(),
    });
    await request.populate("memberId", "name");
    res.status(201).json({ success: true, data: formatRequest(request) });
  } catch (error) { next(error); }
}

async function getMyGuestMealRequests(req, res, next) {
  try {
    const requests = await guestMealRequestModel.getMyRequests(req.user.messId, req.user._id);
    res.status(200).json({ success: true, count: requests.length, data: requests.map(formatRequest) });
  } catch (error) { next(error); }
}

async function getPendingGuestMealRequests(req, res, next) {
  try {
    const requests = await guestMealRequestModel.getPendingRequests(req.user.messId);
    res.status(200).json({ success: true, count: requests.length, data: requests.map(formatRequest) });
  } catch (error) { next(error); }
}

async function reviewGuestMealRequest(req, res, next) {
  try {
    const { status } = req.body;
    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Choose Approved or Rejected." });
    }

    const updated = await guestMealRequestModel.claimPendingRequest(req.params.id, req.user.messId, status);
    if (!updated) return res.status(404).json({ success: false, message: "Request is no longer pending." });

    if (status === "Approved") {
      try {
        await guestMealModel.createGuestMeal({
          messId: updated.messId,
          guestName: updated.guestName,
          hostMemberId: updated.memberId._id,
          date: updated.date,
          breakfast: updated.breakfast,
          lunch: updated.lunch,
          dinner: updated.dinner,
          createdBy: req.user._id,
        });
      } catch (error) {
        // Restore pending status if the official record could not be created.
        await guestMealRequestModel.updateRequest(updated._id, { status: "Pending", reviewedAt: null });
        throw error;
      }
    }

    res.status(200).json({ success: true, data: formatRequest(updated) });
  } catch (error) { next(error); }
}

module.exports = { createGuestMealRequest, getMyGuestMealRequests, getPendingGuestMealRequests, reviewGuestMealRequest };
