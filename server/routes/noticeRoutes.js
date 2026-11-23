const express = require("express");
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getNotices);
router.post("/", protect, allowRoles("Manager"), createNotice);
router.put("/:id", protect, allowRoles("Manager"), updateNotice);
router.delete("/:id", protect, allowRoles("Manager"), deleteNotice);

module.exports = router;
