"use strict";
const { VolunteerOpportunity, NGOProfile, User } = require("../models");
const { Op } = require("sequelize");

exports.createOpportunity = async (req, res, next) => {
  try {
    const { title, description, location, date, requirements } = req.body;

    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can create opportunities." });
    }

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });
    if (!ngoProfile) {
      return res.status(404).json({ error: "NGO profile not found." });
    }

    const opportunity = await VolunteerOpportunity.create({
      ngoId: ngoProfile.id,
      title,
      description,
      location,
      date,
      requirements,
    });

    res
      .status(201)
      .json({ success: true, message: "Opportunity created!", opportunity });
  } catch (error) {
    next(error);
  }
};

exports.getAllOpportunities = async (req, res, next) => {
  try {
    const { search, location, sortBy, order } = req.query;

    let whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (location) {
      whereClause.location = { [Op.iLike]: `%${location}%` };
    }

    const opportunities = await VolunteerOpportunity.findAll({
      where: whereClause,
      include: [
        {
          model: NGOProfile,
          as: "ngo",
          where: { status: "approved" },
          attributes: ["id", "name"],
        },
      ],
      order: [[sortBy || "date", order === "desc" ? "DESC" : "ASC"]],
    });

    res.status(200).json({ success: true, opportunities });
  } catch (error) {
    next(error);
  }
};

exports.getOpportunityById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const opportunity = await VolunteerOpportunity.findByPk(id, {
      include: [{ model: NGOProfile, as: "ngo", attributes: ["id", "name"] }],
    });

    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found." });
    }

    res.status(200).json({ success: true, opportunity });
  } catch (error) {
    next(error);
  }
};

exports.updateOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, location, date, requirements } = req.body;

    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can update opportunities." });
    }

    const opportunity = await VolunteerOpportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found." });
    }

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });
    if (opportunity.ngoId !== ngoProfile.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this opportunity." });
    }

    await opportunity.update({
      title,
      description,
      location,
      date,
      requirements,
    });

    res
      .status(200)
      .json({ success: true, message: "Opportunity updated.", opportunity });
  } catch (error) {
    next(error);
  }
};

exports.deleteOpportunity = async (req, res, next) => {
  try {
    const { id } = req.params;

    const opportunity = await VolunteerOpportunity.findByPk(id);
    if (!opportunity) {
      return res.status(404).json({ error: "Opportunity not found." });
    }

    if (req.user.role !== "admin") {
      const ngoProfile = await NGOProfile.findOne({
        where: { userId: req.user.id },
      });
      if (opportunity.ngoId !== ngoProfile.id) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this opportunity." });
      }
    }

    await opportunity.destroy();

    res.status(200).json({ success: true, message: "Opportunity deleted." });
  } catch (error) {
    next(error);
  }
};
