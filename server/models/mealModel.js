const Meal = require("./Meal");

async function getMeals(query) {
  return await Meal.find(query).sort({ date: 1 });
}

async function getMeal(messId, memberId, date) {
  return await Meal.findOne({ messId, memberId, date });
}

async function saveMeal(messId, memberId, date, data) {
  return await Meal.findOneAndUpdate(
    { messId, memberId, date },
    { $set: data },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );
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
  getMeals,
  getMeal,
  saveMeal,
  createMeal,
  updateMeal,
};
