const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const eventController = require("../controllers/eventController");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: "uploads/event_posters/",
  filename: (req, file, cb) => {
    cb(null, `event-${req.params.eventId}-${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

router.post(
  "/:eventId/upload-poster",
  authenticateToken,
  authorizeRoles("ngo"),
  upload.single("posterImage"),
  eventController.uploadEventPoster
);

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
router.get(
  "/ngo/mine",
  authenticateToken,
  authorizeRoles("ngo"),
  eventController.getMyEvents
);

module.exports = router;
