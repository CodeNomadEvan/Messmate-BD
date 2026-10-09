const express = require("express");
const {
  createMealRequest,
  getMyRequests,
  getPendingRequests,
  updateRequestStatus,
} = require("../controllers/mealRequestController");
const { authMiddleware, managerOnly, memberOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, memberOnly, createMealRequest);
router.get("/my", authMiddleware, memberOnly, getMyRequests);
router.get("/pending", authMiddleware, managerOnly, getPendingRequests);
router.put("/:id/status", authMiddleware, managerOnly, updateRequestStatus);

module.exports = router;
