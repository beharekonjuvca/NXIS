const { User } = require("../models");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "role", "profilePicture"],
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateEmail = async (req, res, next) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ error: "New email is required." });
    }

    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already in use." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.email = newEmail;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email updated successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.updatePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both old and new passwords are required." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect old password." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    next(error);
  }
};

exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const newProfilePicture = `/uploads/profile_pictures/${req.file.filename}`;

    if (user.profilePicture) {
      const oldPicturePath = path.join(__dirname, `..${user.profilePicture}`);
      if (fs.existsSync(oldPicturePath)) {
        fs.unlinkSync(oldPicturePath);
      }
    }
    user.profilePicture = newProfilePicture;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully!",
      profilePicture: newProfilePicture,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    if (!user.profilePicture) {
      return res.status(400).json({ error: "No profile picture to delete." });
    }

    const picturePath = path.join(__dirname, `..${user.profilePicture}`);
    if (fs.existsSync(picturePath)) {
      fs.unlinkSync(picturePath);
    }

    user.profilePicture = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully!",
    });
  } catch (error) {
    next(error);
  }
};
