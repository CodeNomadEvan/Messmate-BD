const express = require("express");
const { getMess, updateMess, joinMess } = require("../controllers/messController");
const { authMiddleware, managerOnly, memberOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/current", authMiddleware, getMess);
router.put("/current", authMiddleware, managerOnly, updateMess);
router.post("/join", authMiddleware, memberOnly, joinMess);

module.exports = router;
