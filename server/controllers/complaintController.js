const complaintModel = require("../models/complaintModel");

const COMPLAINT_CATEGORIES = ["Food", "Cleanliness", "Utility", "Member", "Other"];
const COMPLAINT_STATUSES = ["Pending", "In Progress", "Resolved"];

function formatComplaint(complaint) {
  return {
    id: complaint._id.toString(),
    title: complaint.title,
    description: complaint.description,
    category: complaint.category,
    status: complaint.status,
    managerNote: complaint.managerNote,
    submittedBy: complaint.submittedBy?._id?.toString() || complaint.submittedBy?.toString(),
    submittedByName: complaint.submittedBy?.name || "",
    resolvedAt: complaint.resolvedAt,
    createdAt: complaint.createdAt,
    updatedAt: complaint.updatedAt,
  };
}

function validateComplaint(title, description, category) {
  if (!String(title || "").trim() || !String(description || "").trim()) {
    return "Title and description are required.";
  }

  if (String(title).trim().length > 120 || String(description).trim().length > 2000) {
    return "Title or description exceeds the allowed length.";
  }

  if (!COMPLAINT_CATEGORIES.includes(category || "Other")) {
    return "Select a valid complaint category.";
  }

  return null;
}

async function getComplaints(req, res, next) {
  try {
    const memberId = req.user.role === "Member" ? req.user._id : null;
    const complaints = await complaintModel.getComplaints(req.user.messId, memberId);

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints.map(formatComplaint),
    });
  } catch (error) {
    next(error);
  }
}

async function createComplaint(req, res, next) {
  try {
    const { title, description, category } = req.body;
    const validationError = validateComplaint(title, description, category);

    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    const complaint = await complaintModel.createComplaint({
      messId: req.user.messId,
      submittedBy: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category || "Other",
    });

    await complaint.populate("submittedBy", "name");

    res.status(201).json({
      success: true,
      data: formatComplaint(complaint),
    });
  } catch (error) {
    next(error);
  }
}

async function updateComplaintStatus(req, res, next) {
  try {
    const { status, managerNote } = req.body;

    if (!COMPLAINT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid complaint status.",
      });
    }

    if (String(managerNote || "").length > 500) {
      return res.status(400).json({
        success: false,
        message: "Manager note cannot exceed 500 characters.",
      });
    }

    const complaint = await complaintModel.updateComplaint(req.params.id, req.user.messId, {
      status,
      managerNote: String(managerNote || "").trim(),
      resolvedAt: status === "Resolved" ? new Date() : null,
    });

    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }

    res.status(200).json({
      success: true,
      data: formatComplaint(complaint),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getComplaints, createComplaint, updateComplaintStatus };
