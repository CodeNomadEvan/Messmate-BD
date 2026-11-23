const Notice = require("./Notice");

async function getNotices(messId) {
  return await Notice.find({ messId })
    .populate("createdBy", "name")
    .sort({ pinned: -1, createdAt: -1 });
}

async function createNotice(data) {
  return await Notice.create(data);
}

async function updateNotice(id, messId, data) {
  return await Notice.findOneAndUpdate(
    { _id: id, messId },
    data,
    { new: true, runValidators: true }
  ).populate("createdBy", "name");
}

async function deleteNotice(id, messId) {
  return await Notice.findOneAndDelete({ _id: id, messId });
}

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
