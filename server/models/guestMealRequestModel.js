const GuestMealRequest = require("./GuestMealRequest");

async function createRequest(data) {
  return await GuestMealRequest.create(data);
}

async function getMyRequests(messId, memberId) {
  return await GuestMealRequest.find({ messId, memberId })
    .populate("memberId", "name")
    .sort({ createdAt: -1 });
}

async function getPendingRequests(messId) {
  return await GuestMealRequest.find({ messId, status: "Pending" })
    .populate("memberId", "name")
    .sort({ createdAt: 1 });
}

async function getPendingRequest(id, messId) {
  return await GuestMealRequest.findOne({ _id: id, messId, status: "Pending" })
    .populate("memberId", "name");
}

async function updateRequest(id, data) {
  return await GuestMealRequest.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  }).populate("memberId", "name");
}

async function claimPendingRequest(id, messId, status) {
  return await GuestMealRequest.findOneAndUpdate(
    { _id: id, messId, status: "Pending" },
    { status, reviewedAt: new Date() },
    { new: true, runValidators: true }
  ).populate("memberId", "name");
}

async function findDuplicatePending(messId, memberId, date) {
  return await GuestMealRequest.findOne({ messId, memberId, date, status: "Pending" });
}

module.exports = { createRequest, getMyRequests, getPendingRequests, getPendingRequest, updateRequest, findDuplicatePending, claimPendingRequest };
