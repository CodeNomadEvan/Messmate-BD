const User = require("./User");

async function getUserById(id) {
  return await User.findById(id);
}

async function getUserByEmailOrPhone(email, phone, includePassword = false) {
  const query = User.findOne({ $or: [{ email }, { phone }] });

  if (includePassword) {
    query.select("+passwordHash");
  }

  return await query;
}

async function getUserByMessAndName(messId, name) {
  return await User.findOne({ messId, name });
}

async function getMembers(messId) {
  return await User.find({ messId, isActive: { $ne: false } }).sort({ name: 1 });
}

async function getMembersForPeriod(messId, startDate, endDate) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T23:59:59.999Z`);

  return await User.find({
    messId,
    createdAt: { $lte: end },
    $or: [
      { leftAt: null },
      { leftAt: { $gte: start } },
    ],
  }).sort({ name: 1 });
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
  return await User.countDocuments({ messId, role: "Manager", isActive: { $ne: false } });
}

async function getNextManager(messId) {
  return await User.findOne({ messId, role: "Manager", isActive: { $ne: false } }).sort({ createdAt: 1 });
}

module.exports = {
  getUserById,
  getUserByEmailOrPhone,
  getUserByMessAndName,
  getMembers,
  getMembersForPeriod,
  createUser,
  updateUser,
  deleteUser,
  countManagers,
  getNextManager,
};
