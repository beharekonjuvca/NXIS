const { NGOProfile, User } = require("../models");

exports.getAllNGOs = async (req, res, next) => {
  try {
    const ngos = await NGOProfile.findAll({
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    res.status(200).json({ success: true, ngos });
  } catch (error) {
    next(error);
  }
};

exports.getNGOById = async (req, res, next) => {
  try {
    const { ngoId } = req.params;
    const ngo = await NGOProfile.findByPk(ngoId, {
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    if (!ngo) return res.status(404).json({ error: "NGO not found." });

    res.status(200).json({ success: true, ngo });
  } catch (error) {
    next(error);
  }
};

exports.updateNGOProfile = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });

    if (!ngoProfile) {
      return res.status(404).json({ error: "NGO profile not found." });
    }

    if (name) ngoProfile.name = name;
    if (description) ngoProfile.description = description;

    await ngoProfile.save();

    res.status(200).json({
      success: true,
      message: "NGO profile updated successfully!",
      profile: ngoProfile,
    });
  } catch (error) {
    next(error);
  }
};
exports.getApprovedNGOs = async (req, res, next) => {
  try {
    const ngos = await NGOProfile.findAll({
      where: { status: "approved" },
      include: [
        { model: User, as: "user", attributes: ["id", "username", "email"] },
      ],
    });

    res.status(200).json({ success: true, ngos });
  } catch (error) {
    next(error);
  }
};

exports.deleteNGOProfile = async (req, res, next) => {
  try {
    const { ngoId } = req.params;

    const ngoProfile = await NGOProfile.findByPk(ngoId);
    if (!ngoProfile) {
      return res.status(404).json({ error: "NGO profile not found." });
    }

    if (req.user.role !== "admin" && req.user.id !== ngoProfile.userId) {
      return res.status(403).json({ error: "Unauthorized action." });
    }

    await ngoProfile.destroy();

    res.status(200).json({
      success: true,
      message: "NGO profile deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};
exports.getMyNGOProfile = async (req, res, next) => {
  try {
    const ngo = await NGOProfile.findOne({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email", "profilePicture"],
        },
      ],
    });

    if (!ngo) return res.status(404).json({ error: "NGO not found." });

    res.status(200).json({ success: true, ngo });
  } catch (error) {
    next(error);
  }
};
