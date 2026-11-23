const express = require("express");
const {
  createGuestMealRequest,
  getMyGuestMealRequests,
  getPendingGuestMealRequests,
  reviewGuestMealRequest,
} = require("../controllers/guestMealRequestController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();
router.post("/", protect, allowRoles("Member"), createGuestMealRequest);
router.get("/my", protect, allowRoles("Member"), getMyGuestMealRequests);
router.get("/pending", protect, allowRoles("Manager"), getPendingGuestMealRequests);
router.put("/:id/status", protect, allowRoles("Manager"), reviewGuestMealRequest);
module.exports = router;
