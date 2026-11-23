const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const messModel = require("../models/messModel");

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function makeCode() {
  return `MM-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function getUniqueMessCode() {
  let code = makeCode();
  let exists = await messModel.getMessByCode(code);

  while (exists) {
    code = makeCode();
    exists = await messModel.getMessByCode(code);
  }

  return code;
}

async function makeToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      role: user.role,
      messId: user.messId ? user.messId.toString() : null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function formatUser(user, mess) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    messId: user.messId ? user.messId.toString() : null,
    messName: mess?.name || "",
    area: mess?.area || "",
    address: mess?.address || "",
    messCode: mess?.messCode || "",
  };
}

async function register(req, res, next) {
  try {
    const { name, email, phone, password, role, messCode, messName, area, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required." });
    }

    if (!email || !email.includes("@")) {
      return res.status(400).json({ success: false, message: "Enter a valid email." });
    }

    const cleanMobile = cleanPhone(phone);
    if (!/^01\d{9}$/.test(cleanMobile)) {
      return res.status(400).json({ success: false, message: "Enter a valid Bangladesh mobile number." });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    if (!["Manager", "Member"].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.getUserByEmailOrPhone(normalizedEmail, cleanMobile);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account already exists with this email or phone.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    if (role === "Manager") {
      if (!messName || !messName.trim()) {
        return res.status(400).json({ success: false, message: "Mess name is required." });
      }

      if (!area || !area.trim()) {
        return res.status(400).json({ success: false, message: "Area is required." });
      }

      const user = await userModel.createUser({
        name: name.trim(),
        email: normalizedEmail,
        phone: cleanMobile,
        passwordHash,
        role,
      });

      const mess = await messModel.createMess({
        name: messName.trim(),
        area: area.trim(),
        address: (address || "").trim(),
        messCode: await getUniqueMessCode(),
        managerId: user._id,
      });

      const updatedUser = await userModel.updateUser(user._id, { messId: mess._id });

      const token = await makeToken(user);
      return res.status(201).json({
        success: true,
        data: {
          token,
          user: formatUser(updatedUser, mess),
        },
      });
    }

    if (!messCode || !messCode.trim()) {
      return res.status(400).json({ success: false, message: "Mess code is required." });
    }

    const mess = await messModel.getMessByCode(messCode.trim().toUpperCase());
    if (!mess) {
      return res.status(404).json({ success: false, message: "Mess code not found." });
    }

    const messMembers = await userModel.getMembers(mess._id);
    const duplicateName = messMembers.some(
      (member) => member.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (duplicateName) {
      return res.status(409).json({
        success: false,
        message: "A member with this name already exists in this mess.",
      });
    }

    const user = await userModel.createUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: cleanMobile,
      passwordHash,
      role,
      messId: mess._id,
    });

    const token = await makeToken(user);
    return res.status(201).json({
      success: true,
      data: {
        token,
        user: formatUser(user, mess),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: "Email/phone and password are required." });
    }

    const email = identifier.trim().toLowerCase();
    const phone = cleanPhone(identifier);

    const user = await userModel.getUserByEmailOrPhone(email, phone);

    if (!user) {
      return res.status(401).json({ success: false, message: "Incorrect email/phone or password." });
    }

    const passwordOk = await bcrypt.compare(password, user.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ success: false, message: "Incorrect email/phone or password." });
    }

    const mess = user.messId ? await messModel.getMessById(user.messId) : null;
    const token = await makeToken(user);

    res.status(200).json({
      success: true,
      data: {
        token,
        user: formatUser(user, mess),
      },
    });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const mess = req.user.messId ? await messModel.getMessById(req.user.messId) : null;

    res.status(200).json({
      success: true,
      data: formatUser(req.user, mess),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
