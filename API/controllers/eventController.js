"use strict";
const { Event, EventAttendee, NGOProfile, User } = require("../models");
const { Op } = require("sequelize");

exports.createEvent = async (req, res, next) => {
  try {
    const { title, description, location, date } = req.body;

    if (req.user.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can create events." });
    }

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });
    if (!ngoProfile) {
      return res.status(404).json({ error: "NGO profile not found." });
    }

    const event = await Event.create({
      ngoId: ngoProfile.id,
      title,
      description,
      location,
      date,
    });

    res.status(201).json({ success: true, message: "Event created!", event });
  } catch (error) {
    next(error);
  }
};

exports.getAllEvents = async (req, res, next) => {
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

    const events = await Event.findAll({
      where: whereClause,
      include: [{ model: NGOProfile, as: "ngo", attributes: ["id", "name"] }],
      order: [[sortBy || "date", order === "desc" ? "DESC" : "ASC"]],
    });

    res.status(200).json({ success: true, events });
  } catch (error) {
    next(error);
  }
};

exports.getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id, {
      include: [{ model: NGOProfile, as: "ngo", attributes: ["id", "name"] }],
    });

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    next(error);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, location, date } = req.body;

    if (req.user.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can update events." });
    }

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });
    if (event.ngoId !== ngoProfile.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update this event." });
    }

    await event.update({ title, description, location, date });

    res.status(200).json({ success: true, message: "Event updated.", event });
  } catch (error) {
    next(error);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findByPk(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (req.user.role !== "admin") {
      const ngoProfile = await NGOProfile.findOne({
        where: { userId: req.user.id },
      });
      if (event.ngoId !== ngoProfile.id) {
        return res
          .status(403)
          .json({ error: "Unauthorized to delete this event." });
      }
    }

    await event.destroy();

    res.status(200).json({ success: true, message: "Event deleted." });
  } catch (error) {
    next(error);
  }
};

exports.rsvpEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ error: "Only volunteers can RSVP for events." });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const existingRSVP = await EventAttendee.findOne({
      where: { eventId, volunteerId: req.user.id },
    });
    if (existingRSVP) {
      return res
        .status(400)
        .json({ error: "You have already RSVP'd for this event." });
    }

    const rsvp = await EventAttendee.create({
      eventId,
      volunteerId: req.user.id,
      status: "attending",
    });

    res.status(201).json({ success: true, message: "RSVP successful!", rsvp });
  } catch (error) {
    next(error);
  }
};
