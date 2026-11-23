const paymentModel = require("../models/paymentModel");
const userModel = require("../models/userModel");
const { isValidDateRange, isValidDate } = require("../utils/date");

const PAYMENT_METHODS = ["Cash", "bKash", "Nagad", "Bank", "Other"];

function formatPayment(payment) {
  return {
    id: payment._id.toString(),
    memberId: payment.memberId?._id?.toString() || payment.memberId?.toString(),
    memberName: payment.memberId?.name || "",
    amount: payment.amount,
    method: payment.method,
    note: payment.note,
    date: payment.date,
    recordedBy: payment.recordedBy?._id?.toString() || payment.recordedBy?.toString(),
    recordedByName: payment.recordedBy?.name || "",
    createdAt: payment.createdAt,
  };
}

async function getPayments(req, res, next) {
  try {
    const { startDate, endDate, memberId } = req.query;

    if (!isValidDateRange(startDate, endDate)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid date range.",
      });
    }

    const selectedMember = req.user.role === "Member" ? req.user._id : memberId;
    const payments = await paymentModel.getPayments(
      req.user.messId,
      startDate,
      endDate,
      selectedMember
    );

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments.map(formatPayment),
    });
  } catch (error) {
    next(error);
  }
}

async function createPayment(req, res, next) {
  try {
    const { memberId, amount, method, note, date } = req.body;

    if (!memberId || !isValidDate(date)) {
      return res.status(400).json({
        success: false,
        message: "Member and valid date are required.",
      });
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid payment amount.",
      });
    }

    const paymentMethod = method || "Cash";
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid payment method.",
      });
    }

    if (String(note || "").length > 250) {
      return res.status(400).json({
        success: false,
        message: "Payment note cannot exceed 250 characters.",
      });
    }

    const member = await userModel.getUserById(memberId);
    if (!member || member.isActive === false || !member.messId || member.messId.toString() !== req.user.messId.toString()) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this mess.",
      });
    }

    const payment = await paymentModel.createPayment({
      messId: req.user.messId,
      memberId,
      amount: numericAmount,
      method: paymentMethod,
      note: String(note || "").trim(),
      date,
      recordedBy: req.user._id,
    });

    await payment.populate("memberId", "name");
    await payment.populate("recordedBy", "name");

    res.status(201).json({
      success: true,
      data: formatPayment(payment),
    });
  } catch (error) {
    next(error);
  }
}

async function deletePayment(req, res, next) {
  try {
    const payment = await paymentModel.deletePayment(req.params.id, req.user.messId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment record not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment record deleted.",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getPayments, createPayment, deletePayment };
