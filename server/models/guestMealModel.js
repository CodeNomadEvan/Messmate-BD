const GuestMeal = require("./GuestMeal");

async function createGuestMeal(data) {
  return await GuestMeal.create(data);
}

async function getGuestMeals(messId, startDate, endDate) {
  return await GuestMeal.find({
    messId,
    date: { $gte: startDate, $lte: endDate },
  })
    .populate("createdBy", "name")
    .sort({ date: -1, createdAt: -1 });
}

async function getGuestMealById(id, messId) {
  return await GuestMeal.findOne({ _id: id, messId }).populate("createdBy", "name");
}

async function updateGuestMeal(id, messId, data) {
  return await GuestMeal.findOneAndUpdate(
    { _id: id, messId },
    data,
    { new: true, runValidators: true }
  ).populate("createdBy", "name");
}

async function deleteGuestMeal(id, messId) {
  return await GuestMeal.findOneAndDelete({ _id: id, messId });
}

module.exports = {
  createGuestMeal,
  getGuestMeals,
  getGuestMealById,
  updateGuestMeal,
  deleteGuestMeal,
};
