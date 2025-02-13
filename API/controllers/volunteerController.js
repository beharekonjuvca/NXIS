const { VolunteerProfile, User } = require("../models");
const bcrypt = require("bcryptjs");
const fs = require("fs");
const path = require("path");

exports.getVolunteers = async (req, res) => {
  try {
    const volunteers = await VolunteerProfile.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });
    res.status(200).json({ volunteers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getVolunteerById = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;

    const volunteer = await VolunteerProfile.findOne({
      where: { id: volunteerId },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    if (!volunteer) {
      return res.status(404).json({ error: "Volunteer not found." });
    }

    res.status(200).json({ success: true, volunteer });
  } catch (error) {
    next(error);
  }
};
exports.getMyProfile = async (req, res, next) => {
  try {
    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: req.user.id },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    if (!volunteerProfile) {
      return res.status(404).json({ error: "Volunteer profile not found." });
    }

    res.status(200).json({ success: true, volunteerProfile });
  } catch (error) {
    next(error);
  }
};
exports.deleteProfile = async (req, res, next) => {
  try {
    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!volunteerProfile) {
      return res.status(404).json({ error: "Volunteer profile not found." });
    }

    await volunteerProfile.destroy();
    await User.destroy({ where: { id: req.user.id } });

    res.status(200).json({
      success: true,
      message: "Volunteer profile deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { skills, availability } = req.body;

    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!volunteerProfile) {
      return res.status(404).json({ error: "Volunteer profile not found." });
    }

    if (skills) volunteerProfile.skills = skills;
    if (availability) volunteerProfile.availability = availability;
    if (req.file) {
      volunteerProfile.resumePDF = `/uploads/resumes/${req.file.filename}`;
    }

    await volunteerProfile.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      profile: volunteerProfile,
    });
  } catch (error) {
    next(error);
  }
};

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!volunteerProfile) {
      return res.status(404).json({ error: "Volunteer profile not found." });
    }

    const newResumePath = `/uploads/resumes/${req.file.filename}`;

    if (volunteerProfile.resumePDF) {
      const oldResumePath = path.join(
        __dirname,
        `..${volunteerProfile.resumePDF}`
      );
      if (fs.existsSync(oldResumePath)) {
        fs.unlinkSync(oldResumePath);
      }
    }

    volunteerProfile.resumePDF = newResumePath;
    await volunteerProfile.save();

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully!",
      filePath: newResumePath,
    });
  } catch (error) {
    next(error);
  }
};
exports.deleteResume = async (req, res, next) => {
  try {
    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!volunteerProfile || !volunteerProfile.resumePDF) {
      return res.status(404).json({ error: "Resume not found." });
    }

    const resumePath = path.join(__dirname, `..${volunteerProfile.resumePDF}`);

    if (fs.existsSync(resumePath)) {
      fs.unlinkSync(resumePath);
    }

    volunteerProfile.resumePDF = null;
    await volunteerProfile.save();

    res
      .status(200)
      .json({ success: true, message: "Resume deleted successfully!" });
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
