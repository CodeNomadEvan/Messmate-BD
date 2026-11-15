const express = require("express");
const { getMealRateSummary } = require("../controllers/mealRateController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/summary", authMiddleware, getMealRateSummary);

module.exports = router;
