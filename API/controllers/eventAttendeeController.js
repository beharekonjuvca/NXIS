"use strict";
const { EventAttendee, Event, User, NGOProfile } = require("../models");

exports.rsvpForEvent = async (req, res, next) => {
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

exports.getEventAttendees = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (req.user.role !== "ngo") {
      return res
        .status(403)
        .json({ error: "Only NGOs can view event attendees." });
    }

    const event = await Event.findByPk(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });
    if (event.ngoId !== ngoProfile.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to view attendees for this event." });
    }

    const attendees = await EventAttendee.findAll({
      where: { eventId },
      include: [
        {
          model: User,
          as: "volunteer",
          attributes: ["id", "username", "email"],
        },
      ],
    });

    res.status(200).json({ success: true, attendees });
  } catch (error) {
    next(error);
  }
};

exports.removeAttendee = async (req, res, next) => {
  try {
    const { attendeeId } = req.params;

    if (req.user.role !== "ngo") {
      return res.status(403).json({ error: "Only NGOs can remove attendees." });
    }

    const attendee = await EventAttendee.findByPk(attendeeId);
    if (!attendee) {
      return res.status(404).json({ error: "Attendee not found." });
    }

    const event = await Event.findByPk(attendee.eventId);
    const ngoProfile = await NGOProfile.findOne({
      where: { userId: req.user.id },
    });

    if (event.ngoId !== ngoProfile.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to remove this attendee." });
    }

    await attendee.destroy();

    res
      .status(200)
      .json({ success: true, message: "Attendee removed from event." });
  } catch (error) {
    next(error);
  }
};

exports.cancelRSVP = async (req, res, next) => {
  try {
    const { eventId } = req.params;

    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ error: "Only volunteers can cancel their RSVP." });
    }

    const rsvp = await EventAttendee.findOne({
      where: { eventId, volunteerId: req.user.id },
    });

    if (!rsvp) {
      return res
        .status(404)
        .json({ error: "You have not RSVP'd for this event." });
    }

    await rsvp.destroy();

    res.status(200).json({ success: true, message: "RSVP canceled." });
  } catch (error) {
    next(error);
  }
};
