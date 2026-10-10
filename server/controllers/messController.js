const messModel = require("../models/messModel");
const userModel = require("../models/userModel");

function formatMess(mess) {
  if (!mess) return null;

  return {
    id: mess._id.toString(),
    name: mess.name,
    area: mess.area,
    address: mess.address,
    messCode: mess.messCode,
    managerId: mess.managerId.toString(),
    cancellationDeadline: mess.cancellationDeadline,
  };
}

async function getMess(req, res, next) {
  try {
    const mess = await messModel.getMessById(req.user.messId);

    if (!mess) {
      return res.status(404).json({ success: false, message: "Mess not found." });
    }

    res.status(200).json({ success: true, data: formatMess(mess) });
  } catch (error) {
    next(error);
  }
}

async function updateMess(req, res, next) {
  try {
    const mess = await messModel.getMessById(req.user.messId);

    if (!mess) {
      return res.status(404).json({ success: false, message: "Mess not found." });
    }

    const { cancellationDeadline } = req.body;

    if (cancellationDeadline !== undefined) {
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(cancellationDeadline)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cancellation deadline.",
        });
      }

      mess.cancellationDeadline = cancellationDeadline;
    }

    const updatedMess = await messModel.updateMess(mess._id, {
      cancellationDeadline: mess.cancellationDeadline,
    });

    res.status(200).json({ success: true, data: formatMess(updatedMess) });
  } catch (error) {
    next(error);
  }
}

async function joinMess(req, res, next) {
  try {
    if (req.user.messId) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of a mess.",
      });
    }

    const code = String(req.body.messCode || "").trim().toUpperCase();

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Mess code is required.",
      });
    }

    const mess = await messModel.getMessByCode(code);

    if (!mess) {
      return res.status(404).json({
        success: false,
        message: "Mess code not found.",
      });
    }

    const updatedUser = await userModel.updateUser(req.user._id, {
      messId: mess._id,
      role: "Member",
    });

    res.status(200).json({
      success: true,
      data: {
        user: updatedUser,
        mess: formatMess(mess),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getMess, updateMess, joinMess };
