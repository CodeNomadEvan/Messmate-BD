const express = require("express");
const { getMeals, saveMeal } = require("../controllers/mealController");
const { authMiddleware, managerOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMeals);
router.put("/", authMiddleware, managerOnly, saveMeal);

module.exports = router;
