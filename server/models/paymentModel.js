const Payment = require("./Payment");

async function createPayment(data) {
  return await Payment.create(data);
}

async function getPayments(messId, startDate, endDate, memberId) {
  const query = {
    messId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (memberId) {
    query.memberId = memberId;
  }

  return await Payment.find(query)
    .populate("memberId", "name")
    .populate("recordedBy", "name")
    .sort({ date: -1, createdAt: -1 });
}

async function deletePayment(id, messId) {
  return await Payment.findOneAndDelete({ _id: id, messId });
}

module.exports = {
  createPayment,
  getPayments,
  deletePayment,
};
