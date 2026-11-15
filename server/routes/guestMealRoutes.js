const express = require("express");
const {
  getGuestMeals,
  createGuestMeal,
  updateGuestMeal,
  deleteGuestMeal,
} = require("../controllers/guestMealController");
const { authMiddleware, managerOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getGuestMeals);
router.post("/", authMiddleware, managerOnly, createGuestMeal);
router.put("/:id", authMiddleware, managerOnly, updateGuestMeal);
router.delete("/:id", authMiddleware, managerOnly, deleteGuestMeal);

module.exports = router;
