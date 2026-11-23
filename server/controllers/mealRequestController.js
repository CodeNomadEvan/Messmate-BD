const mealRequestModel = require("../models/mealRequestModel");
const mealModel = require("../models/mealModel");
const messModel = require("../models/messModel");

function pad(value) {
  return String(value).padStart(2, "0");
}

function dhakaNow() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());

  const get = (name) => parts.find((part) => part.type === name)?.value;

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

function timeToMinutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function dateRange(start, end) {
  const dates = [];
  const cursor = new Date(`${start}T00:00:00`);
  const last = new Date(`${end}T00:00:00`);

  while (cursor <= last) {
    dates.push(
      `${cursor.getFullYear()}-${pad(cursor.getMonth() + 1)}-${pad(cursor.getDate())}`
    );
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function monthEnd(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`;
}

async function applyRequest(request) {
  const endDate = request.action === "OFF"
    ? request.endDate
    : monthEnd(request.startDate);

  const dates = dateRange(request.startDate, endDate);

  for (const date of dates) {
    const memberId = request.memberId?._id || request.memberId;
    let meal = await mealModel.getMeal(request.messId, memberId, date);

    if (!meal) {
      meal = await mealModel.createMeal({
        messId: request.messId,
        memberId,
        date,
        breakfast: true,
        lunch: true,
        dinner: true,
      });
    }

    for (const slot of request.slots) {
      meal[slot] = request.action === "OFF" ? false : true;
    }

    await mealModel.updateMeal(meal._id, {
      breakfast: meal.breakfast,
      lunch: meal.lunch,
      dinner: meal.dinner,
    });
  }
}

function formatRequest(request) {
  return {
    id: request._id.toString(),
    messId: request.messId.toString(),
    memberId: request.memberId?._id?.toString() || request.memberId.toString(),
    memberName: request.memberId?.name || "Member",
    action: request.action,
    startDate: request.startDate,
    endDate: request.endDate,
    slots: request.slots,
    reason: request.reason,
    status: request.status,
    createdAt: request.createdAt,
    reviewedAt: request.reviewedAt,
  };
}

async function createMealRequest(req, res, next) {
  try {
    const { action, startDate, endDate, slots, reason } = req.body;

    if (!["OFF", "ON"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid request action." });
    }

    if (!startDate) {
      return res.status(400).json({ success: false, message: "Select a date." });
    }

    if (!Array.isArray(slots) || slots.length === 0) {
      return res.status(400).json({ success: false, message: "Select at least one meal." });
    }

    const validSlots = slots.every((slot) => ["breakfast", "lunch", "dinner"].includes(slot));
    if (!validSlots) {
      return res.status(400).json({ success: false, message: "Invalid meal selection." });
    }

    const today = dhakaNow();
    if (startDate < today.date) {
      return res.status(400).json({ success: false, message: "Past dates are not allowed." });
    }

    if (action === "OFF") {
      if (!endDate || endDate < startDate) {
        return res.status(400).json({ success: false, message: "Select a valid date range." });
      }

      const mess = await messModel.getMessById(req.user.messId);
      const includesToday = startDate <= today.date && endDate >= today.date;

      if (includesToday && today.minutes >= timeToMinutes(mess.cancellationDeadline)) {
        return res.status(400).json({
          success: false,
          message: `Today’s cancellation window closed at ${mess.cancellationDeadline}.`,
        });
      }
    }

    const request = await mealRequestModel.createRequest({
      messId: req.user.messId,
      memberId: req.user._id,
      action,
      startDate,
      endDate: action === "OFF" ? endDate : null,
      slots,
      reason: action === "OFF" ? (reason || "").trim() : "",
    });

    await request.populate("memberId", "name");

    res.status(201).json({ success: true, data: formatRequest(request) });
  } catch (error) {
    next(error);
  }
}

async function getMyRequests(req, res, next) {
  try {
    const requests = await mealRequestModel.getMyRequests(req.user.messId, req.user._id);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequest),
    });
  } catch (error) {
    next(error);
  }
}

async function getPendingRequests(req, res, next) {
  try {
    const requests = await mealRequestModel.getPendingRequests(req.user.messId);

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests.map(formatRequest),
    });
  } catch (error) {
    next(error);
  }
}

async function updateRequestStatus(req, res, next) {
  try {
    const { status } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid request status." });
    }

    const request = await mealRequestModel.getPendingRequest(req.params.id, req.user.messId);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request is no longer pending.",
      });
    }

    if (status === "Approved") {
      await applyRequest(request);
    }

    const updatedRequest = await mealRequestModel.updateRequest(request._id, {
      status,
      reviewedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: formatRequest(updatedRequest),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createMealRequest,
  getMyRequests,
  getPendingRequests,
  updateRequestStatus,
};
