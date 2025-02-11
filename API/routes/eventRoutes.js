const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

router.get("/", eventController.getAllEvents);
router.get("/:id", eventController.getEventById);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ngo"),
  eventController.createEvent
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ngo"),
  eventController.updateEvent
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ngo", "admin"),
  eventController.deleteEvent
);

router.post(
  "/:eventId/rsvp",
  authenticateToken,
  authorizeRoles("volunteer"),
  eventController.rsvpEvent
);

module.exports = router;
