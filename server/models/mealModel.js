const Meal = require("./Meal");

async function getMeal(messId, memberId, date) {
  return await Meal.findOne({ messId, memberId, date });
}

async function getMeals(messId, startDate, endDate, memberId) {
  const query = {
    messId,
    date: { $gte: startDate, $lte: endDate },
  };

  if (memberId) {
    query.memberId = memberId;
  }

  return await Meal.find(query).sort({ date: 1 });
}

async function createMeal(data) {
  return await Meal.create(data);
}

async function updateMeal(id, data) {
  return await Meal.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
}

module.exports = {
  getMeal,
  getMeals,
  createMeal,
  updateMeal,
};
