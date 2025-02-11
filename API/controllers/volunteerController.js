const { VolunteerProfile, User } = require("../models");

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
