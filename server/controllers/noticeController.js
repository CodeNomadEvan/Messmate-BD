const noticeModel = require("../models/noticeModel");

const NOTICE_CATEGORIES = ["General", "Meal", "Payment", "Maintenance", "Event"];

function formatNotice(notice) {
  return {
    id: notice._id.toString(),
    title: notice.title,
    description: notice.description,
    category: notice.category,
    pinned: notice.pinned,
    createdBy: notice.createdBy?._id?.toString() || notice.createdBy?.toString(),
    createdByName: notice.createdBy?.name || "",
    createdAt: notice.createdAt,
    updatedAt: notice.updatedAt,
  };
}

function validateNotice(title, description, category) {
  if (!String(title || "").trim() || !String(description || "").trim()) {
    return "Title and description are required.";
  }

  if (String(title).trim().length > 120 || String(description).trim().length > 2000) {
    return "Title or description exceeds the allowed length.";
  }

  if (!NOTICE_CATEGORIES.includes(category || "General")) {
    return "Select a valid notice category.";
  }

  return null;
}

async function getNotices(req, res, next) {
  try {
    const notices = await noticeModel.getNotices(req.user.messId);

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices.map(formatNotice),
    });
  } catch (error) {
    next(error);
  }
}

async function createNotice(req, res, next) {
  try {
    const { title, description, category, pinned } = req.body;
    const validationError = validateNotice(title, description, category);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (pinned !== undefined && typeof pinned !== "boolean") {
      return res.status(400).json({ success: false, message: "Pinned must be true or false." });
    }

    const notice = await noticeModel.createNotice({
      messId: req.user.messId,
      title: title.trim(),
      description: description.trim(),
      category: category || "General",
      pinned: pinned === true,
      createdBy: req.user._id,
    });

    await notice.populate("createdBy", "name");

    res.status(201).json({
      success: true,
      data: formatNotice(notice),
    });
  } catch (error) {
    next(error);
  }
}

async function updateNotice(req, res, next) {
  try {
    const { title, description, category, pinned } = req.body;
    const validationError = validateNotice(title, description, category);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (pinned !== undefined && typeof pinned !== "boolean") {
      return res.status(400).json({ success: false, message: "Pinned must be true or false." });
    }

    const notice = await noticeModel.updateNotice(req.params.id, req.user.messId, {
      title: title.trim(),
      description: description.trim(),
      category: category || "General",
      pinned: pinned === true,
    });

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found." });
    }

    res.status(200).json({
      success: true,
      data: formatNotice(notice),
    });
  } catch (error) {
    next(error);
  }
}

async function deleteNotice(req, res, next) {
  try {
    const notice = await noticeModel.deleteNotice(req.params.id, req.user.messId);

    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found." });
    }

    res.status(200).json({ success: true, message: "Notice deleted." });
  } catch (error) {
    next(error);
  }
}

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
