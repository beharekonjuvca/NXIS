"use strict";
const {
  VolunteerApplication,
  VolunteerOpportunity,
  User,
  NGOProfile,
  VolunteerProfile,
} = require("../models");
const { Op } = require("sequelize");

exports.getAllApplications = async (req, res, next) => {
  try {
    const { status, search, dateFrom, dateTo, sortBy, order } = req.query;

    let whereClause = {};

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { "$volunteer.username$": { [Op.iLike]: `%${search}%` } },
        { "$opportunity.title$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        whereClause.createdAt[Op.gte] = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.createdAt[Op.lte] = new Date(dateTo);
      }
    }

    const applications = await VolunteerApplication.findAll({
      where: whereClause,
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
        {
          model: VolunteerOpportunity,
          as: "opportunity",
          attributes: ["id", "title", "description", "location", "date"],
          include: [
            {
              model: NGOProfile,
              as: "ngo",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [[sortBy || "createdAt", order === "desc" ? "DESC" : "ASC"]],
    });

    res.status(200).json({ success: true, applications });
  } catch (error) {
    next(error);
  }
};

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
exports.approveApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can approve applications." });
    }

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    application.status = "approved";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application approved successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};
exports.rejectApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can reject applications." });
    }

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    application.status = "rejected";
    await application.save();

    res.status(200).json({
      success: true,
      message: "Application rejected successfully.",
      application,
    });
  } catch (error) {
    next(error);
  }
};
exports.assignHours = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { hoursWorked } = req.body;

    if (req.user.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can assign hours." });
    }

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Application must be approved first." });
    }

    if (!hoursWorked || isNaN(hoursWorked) || hoursWorked < 0) {
      return res
        .status(400)
        .json({ error: "Please provide a valid number of hours." });
    }

    application.hoursWorked = hoursWorked;
    await application.save();

    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: application.volunteerId },
    });

    if (volunteerProfile) {
      const totalHours = await VolunteerApplication.sum("hoursWorked", {
        where: { volunteerId: application.volunteerId, status: "approved" },
      });

      volunteerProfile.totalHours = totalHours;
      await volunteerProfile.save();
    }

    res.status(200).json({
      success: true,
      message: "Hours assigned successfully.",
      application,
      totalHours: volunteerProfile.totalHours,
    });
  } catch (error) {
    next(error);
  }
};
exports.updateHours = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { hoursWorked } = req.body;

    if (req.user.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can update hours." });
    }

    const application = await VolunteerApplication.findByPk(applicationId);
    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    if (application.status !== "approved") {
      return res
        .status(400)
        .json({ error: "Application must be approved first." });
    }

    if (!hoursWorked || isNaN(hoursWorked) || hoursWorked < 0) {
      return res
        .status(400)
        .json({ error: "Please provide a valid number of hours." });
    }

    application.hoursWorked = hoursWorked;
    await application.save();

    const volunteerProfile = await VolunteerProfile.findOne({
      where: { userId: application.volunteerId },
    });

    if (volunteerProfile) {
      const totalHours = await VolunteerApplication.sum("hoursWorked", {
        where: { volunteerId: application.volunteerId, status: "approved" },
      });

      volunteerProfile.totalHours = totalHours;
      await volunteerProfile.save();
    }

    res.status(200).json({
      success: true,
      message: "Hours updated successfully.",
      application,
      totalHours: volunteerProfile.totalHours,
    });
  } catch (error) {
    next(error);
  }
};
exports.getHoursByOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;

    const totalHours = await VolunteerApplication.sum("hoursWorked", {
      where: { opportunityId, status: "approved" },
    });

    res.status(200).json({
      success: true,
      opportunityId,
      totalHours: totalHours || 0,
    });
  } catch (error) {
    next(error);
  }
};
exports.getHoursByApplication = async (req, res, next) => {
  try {
    const { applicationId } = req.params;

    const application = await VolunteerApplication.findByPk(applicationId, {
      attributes: ["id", "hoursWorked", "status"],
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "username", "email"],
        },
        {
          model: VolunteerOpportunity,
          as: "opportunity",
          attributes: ["id", "title"],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found." });
    }

    res.status(200).json({
      success: true,
      application,
    });
  } catch (error) {
    next(error);
  }
};
exports.getMyApplications = async (req, res, next) => {
  try {
    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ error: "Only volunteers can view their applications." });
    }

    const applications = await VolunteerApplication.findAll({
      where: { volunteerId: req.user.id },
      include: [
        {
          model: VolunteerOpportunity,
          as: "opportunity",
          attributes: ["id", "title", "description", "location", "date"],
          include: [
            {
              model: NGOProfile,
              as: "ngo",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      applications: applications.map((app) => ({
        id: app.id,
        status: app.status,
        hoursWorked: app.hoursWorked || 0,
        appliedAt: app.createdAt,
        opportunity: {
          id: app.opportunity.id,
          title: app.opportunity.title,
          description: app.opportunity.description,
          location: app.opportunity.location,
          date: app.opportunity.date,
          ngo: app.opportunity.ngo,
        },
      })),
    });
  } catch (error) {
    next(error);
  }
};
