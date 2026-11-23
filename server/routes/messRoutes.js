const express = require("express");
const { getMess, updateMess, joinMess } = require("../controllers/messController");
const { protect, allowRoles } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/current", protect, getMess);
router.put("/current", protect, allowRoles("Manager"), updateMess);
router.post("/join", protect, allowRoles("Member"), joinMess);

module.exports = router;
