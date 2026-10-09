const User = require("./User");

async function getUserById(id) {
  return await User.findById(id);
}

async function getUserByEmailOrPhone(email, phone) {
  return await User.findOne({
    $or: [{ email }, { phone }],
  });
}

async function getUserByMessAndName(messId, name) {
  return await User.findOne({ messId, name });
}

async function getMembers(messId) {
  return await User.find({ messId }).sort({ name: 1 });
}

async function createUser(data) {
  return await User.create(data);
}

async function updateUser(id, data) {
  return await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

async function deleteUser(id) {
  return await User.findByIdAndDelete(id);
}

async function countManagers(messId) {
  return await User.countDocuments({ messId, role: "Manager" });
}

async function getNextManager(messId) {
  return await User.findOne({ messId, role: "Manager" }).sort({ createdAt: 1 });
}

module.exports = {
  getUserById,
  getUserByEmailOrPhone,
  getUserByMessAndName,
  getMembers,
  createUser,
  updateUser,
  deleteUser,
  countManagers,
  getNextManager,
};
