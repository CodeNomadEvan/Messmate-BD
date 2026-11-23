const express = require("express");
const {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} = require("../controllers/noticeController");
const {
  authMiddleware,
  managerOnly,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getNotices);
router.post("/", authMiddleware, managerOnly, createNotice);
router.put("/:id", authMiddleware, managerOnly, updateNotice);
router.delete("/:id", authMiddleware, managerOnly, deleteNotice);

module.exports = router;
