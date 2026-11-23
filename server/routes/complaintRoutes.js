const express = require("express");
const {
  getComplaints,
  createComplaint,
  updateComplaintStatus,
} = require("../controllers/complaintController");
const {
  authMiddleware,
  managerOnly,
  memberOnly,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getComplaints);
router.post("/", authMiddleware, memberOnly, createComplaint);
router.put("/:id/status", authMiddleware, managerOnly, updateComplaintStatus);

module.exports = router;
