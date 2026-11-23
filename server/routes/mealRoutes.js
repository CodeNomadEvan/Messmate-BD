const express = require("express");
const { getMeals, saveMeal } = require("../controllers/mealController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMeals);
router.put("/", authMiddleware, saveMeal);

module.exports = router;
