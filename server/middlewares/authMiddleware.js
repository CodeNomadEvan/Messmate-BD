const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.getUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

function managerOnly(req, res, next) {
  if (req.user.role !== "Manager") {
    return res.status(403).json({
      success: false,
      message: "Manager access required",
    });
  }

  next();
}

function memberOnly(req, res, next) {
  if (req.user.role !== "Member") {
    return res.status(403).json({
      success: false,
      message: "Member access required",
    });
  }

  next();
}

module.exports = { authMiddleware, managerOnly, memberOnly };
