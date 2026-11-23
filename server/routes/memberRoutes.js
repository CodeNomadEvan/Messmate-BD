const express = require("express");
const { getMembers, updateMemberRole, removeMember } = require("../controllers/memberController");
const { authMiddleware, managerOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getMembers);
router.put("/:id/role", authMiddleware, managerOnly, updateMemberRole);
router.delete("/:id", authMiddleware, managerOnly, removeMember);

module.exports = router;
