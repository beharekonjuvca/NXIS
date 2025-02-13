"use strict";
const {
  VolunteerApplication,
  VolunteerOpportunity,
  User,
  NGOProfile,
  VolunteerProfile,
} = require("../models");

exports.applyForOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ error: "Only volunteers can apply for opportunities." });
    }

    const opportunity = await VolunteerOpportunity.findByPk(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found." });
    }

    const existingApplication = await VolunteerApplication.findOne({
      where: { opportunityId, volunteerId: req.user.id },
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ error: "You have already applied for this opportunity." });
    }

    const application = await VolunteerApplication.create({
      opportunityId,
      volunteerId: req.user.id,
      status: "pending",
    });

    res
      .status(201)
      .json({ success: true, message: "Application submitted!", application });
  } catch (error) {
    next(error);
  }
};

exports.getApplicantsForOpportunity = async (req, res, next) => {
  const { opportunityId } = req.params;

  try {
    const applications = await VolunteerApplication.findAll({
      where: { opportunityId },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "username", "email"],
          include: [
            {
              model: VolunteerProfile,
              as: "volunteerProfile",
              attributes: ["skills", "availability", "resumePDF"],
            },
          ],
        },
      ],
    });

    res.status(200).json({
      success: true,
      applicants: applications.map((app) => ({
        id: app.volunteer.id,
        username: app.volunteer.username,
        email: app.volunteer.email,
        skills: app.volunteer.volunteerProfile?.skills,
        availability: app.volunteer.volunteerProfile?.availability,
        resume: app.volunteer.volunteerProfile?.resumePDF,
      })),
    });
  } catch (error) {
    next(error);
  }
};
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can update applications." });
    }

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    const opportunity = await VolunteerOpportunity.findByPk(
      application.opportunityId
    );
    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });

    if (opportunity.ngoId !== ngoProfile.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this application." });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status. Use 'approved' or 'rejected'." });
    }

    application.status = status;
    await application.save();

    res
      .status(200)
      .json({ success: true, message: `Application ${status}.`, application });
  } catch (error) {
    next(error);
  }
};

exports.deleteApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (req.user.role !== "admin" && req.user.id !== application.volunteerId) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this application." });
    }

    await application.destroy();

    res.status(200).json({ success: true, message: "Application deleted." });
  } catch (error) {
    next(error);
  }
};
