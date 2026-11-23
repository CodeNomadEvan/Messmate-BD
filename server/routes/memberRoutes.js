const express = require("express");
const { getMembers, updateMemberRole, removeMember } = require("../controllers/memberController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", protect, getMembers);
router.put("/:id/role", protect, allowRoles("Manager"), updateMemberRole);
router.delete("/:id", protect, allowRoles("Manager"), removeMember);

module.exports = router;
