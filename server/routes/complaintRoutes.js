const express = require("express");
const {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getComplaints);
router.post("/", protect, allowRoles("Member"), createComplaint);
router.put("/:id/status", protect, allowRoles("Manager"), updateComplaintStatus);

module.exports = router;
