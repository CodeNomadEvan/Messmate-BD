const MealRequest = require("./MealRequest");

async function createRequest(data) {
  return await MealRequest.create(data);
}

async function getMyRequests(messId, memberId) {
  return await MealRequest.find({ messId, memberId })
    .populate("memberId", "name")
    .sort({ createdAt: -1 });
}

async function getPendingRequests(messId) {
  return await MealRequest.find({ messId, status: "Pending" })
    .populate("memberId", "name")
    .sort({ createdAt: -1 });
}

async function getPendingRequest(id, messId) {
  return await MealRequest.findOne({
    _id: id,
    messId,
    status: "Pending",
  }).populate("memberId", "name");
}

async function updateRequest(id, data) {
  return await MealRequest.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("memberId", "name");
}

module.exports = {
  createRequest,
  getMyRequests,
  getPendingRequests,
  getPendingRequest,
  updateRequest,
};
