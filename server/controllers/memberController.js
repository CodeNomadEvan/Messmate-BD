const userModel = require("../models/userModel");
const messModel = require("../models/messModel");

function formatUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    messId: user.messId?.toString() || null,
  };
}

async function getMembers(req, res, next) {
  try {
    const members = await userModel.getMembers(req.user.messId);

    res.status(200).json({
      success: true,
      count: members.length,
      data: members.map(formatUser),
    });
  } catch (error) {
    next(error);
  }
}

async function updateMemberRole(req, res, next) {
  try {
    const { role } = req.body;

    if (!["Manager", "Member"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot change your own role here." });
    }

    const member = await userModel.getUserById(req.params.id).then((member) => (member && member.messId.toString() === req.user.messId.toString() ? member : null));

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (member.role === role) {
      return res.status(200).json({ success: true, data: formatUser(member) });
    }

    if (member.role === "Manager" && role === "Member") {
      const managerCount = await userModel.countManagers(req.user.messId);

      if (managerCount === 1) {
        return res.status(400).json({
          success: false,
          message: "Keep at least one manager in the mess.",
        });
      }
    }

    member.role = role;
    await userModel.updateUser(member._id, { role });

    if (role === "Manager") {
      await messModel.updateMess(req.user.messId, { managerId: member._id });
    }

    if (role === "Member") {
      const nextManager = await userModel.getNextManager(req.user.messId);

      if (nextManager) {
        await messModel.updateMess(req.user.messId, { managerId: nextManager._id });
      }
    }

    res.status(200).json({ success: true, data: formatUser(member) });
  } catch (error) {
    next(error);
  }
}

async function removeMember(req, res, next) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot remove your own account." });
    }

    const member = await userModel.getUserById(req.params.id).then((member) => (member && member.messId.toString() === req.user.messId.toString() ? member : null));

    if (!member) {
      return res.status(404).json({ success: false, message: "Member not found." });
    }

    if (member.role === "Manager") {
      const managerCount = await userModel.countManagers(req.user.messId);

      if (managerCount === 1) {
        return res.status(400).json({
          success: false,
          message: "Keep at least one manager in the mess.",
        });
      }
    }

    await userModel.deleteUser(member._id);

    if (member.role === "Manager") {
      const nextManager = await userModel.getNextManager(req.user.messId);

      if (nextManager) {
        await messModel.updateMess(req.user.messId, { managerId: nextManager._id });
      }
    }

    res.status(200).json({
      success: true,
      message: "Member removed",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMembers, updateMemberRole, removeMember };
