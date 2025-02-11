const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const eventAttendeeController = require("../controllers/eventAttendeeController");

router.post(
  "/:eventId/rsvp",
  authenticateToken,
  authorizeRoles("volunteer"),
  eventAttendeeController.rsvpForEvent
);

router.get(
  "/:eventId/attendees",
  authenticateToken,
  authorizeRoles("ngo"),
  eventAttendeeController.getEventAttendees
);

router.delete(
  "/:attendeeId",
  authenticateToken,
  authorizeRoles("ngo"),
  eventAttendeeController.removeAttendee
);

router.delete(
  "/:eventId/cancel",
  authenticateToken,
  authorizeRoles("volunteer"),
  eventAttendeeController.cancelRSVP
);

module.exports = router;
