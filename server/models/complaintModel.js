const Complaint = require("./Complaint");

async function getComplaints(messId, memberId) {
  const query = { messId };

  if (memberId) {
    query.submittedBy = memberId;
  }

  return await Complaint.find(query)
    .populate("submittedBy", "name")
    .sort({ createdAt: -1 });
}

async function createComplaint(data) {
  return await Complaint.create(data);
}

async function updateComplaint(id, messId, data) {
  return await Complaint.findOneAndUpdate(
    { _id: id, messId },
    data,
    { new: true, runValidators: true }
  ).populate("submittedBy", "name");
}

module.exports = { getComplaints, createComplaint, updateComplaint };
