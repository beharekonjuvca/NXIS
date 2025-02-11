const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { User, NGOProfile, VolunteerProfile } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { Op } = require("sequelize");

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

exports.register = async (req, res, next) => {
  const {
    username,
    email,
    password,
    role,
    name,
    description,
    skills,
    availability,
  } = req.body;

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({
        error: "Username is already taken. Please choose a different one.",
      });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({
        error: "Email is already registered. Try logging in instead.",
      });
    }

    const normalizedRole = role.toLowerCase();
    if (!["volunteer", "ngo", "admin"].includes(normalizedRole)) {
      return res.status(400).json({
        error: "Invalid role. Allowed roles: 'volunteer', 'ngo', 'admin'.",
      });
    }

    let user;
    try {
      user = await User.create({
        username,
        email,
        password,
        role: normalizedRole,
      });
    } catch (error) {
      return next(error);
    }

    try {
      if (normalizedRole === "ngo") {
        if (!name || !description) {
          return res
            .status(400)
            .json({ error: "NGO name and description are required." });
        }
        await NGOProfile.create({
          userId: user.id,
          name,
          description,
          approved: false,
        });
      } else if (normalizedRole === "volunteer") {
        await VolunteerProfile.create({
          userId: user.id,
          skills,
          availability,
        });
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: normalizedRole,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({
      where: { email },
      include: [
        { model: NGOProfile, as: "ngoProfile" },
        { model: VolunteerProfile, as: "volunteerProfile" },
      ],
    });

    if (!user) {
      return res
        .status(404)
        .json({ error: "User not found. Please register." });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        ngoProfile: user.ngoProfile,
        volunteerProfile: user.volunteerProfile,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = (req, res) => {
  const { token } = req.body;
  if (!token)
    return res.status(401).json({ error: "Refresh token is required." });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid refresh token." });

    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(403).json({ error: "User not found." });

    const newAccessToken = generateAccessToken(user);
    res.status(200).json({ accessToken: newAccessToken });
  });
};

exports.approveNGO = async (req, res, next) => {
  const { ngoId } = req.params;

  try {
    const ngo = await NGOProfile.findByPk(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: "NGO not found." });
    }

    ngo.status = "approved";
    await ngo.save();

    res
      .status(200)
      .json({ success: true, message: "NGO approved successfully." });
  } catch (error) {
    next(error);
  }
};

exports.rejectNGO = async (req, res, next) => {
  const { ngoId } = req.params;

  try {
    const ngo = await NGOProfile.findByPk(ngoId);
    if (!ngo) {
      return res.status(404).json({ error: "NGO not found." });
    }

    ngo.status = "rejected";
    await ngo.save();

    res
      .status(200)
      .json({ success: true, message: "NGO rejected successfully." });
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { search, role, sortBy, order } = req.query;

    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (role) {
      whereClause.role = role;
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ["id", "username", "email", "role"],
      order: [[sortBy || "username", order === "desc" ? "DESC" : "ASC"]],
    });

    res.status(200).json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await user.destroy();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};
