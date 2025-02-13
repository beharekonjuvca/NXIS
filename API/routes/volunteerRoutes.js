const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const multer = require("multer");
const volunteerController = require("../controllers/volunteerController");

const storage = multer.diskStorage({
  destination: "uploads/resumes/",
  filename: (req, file, cb) => {
    cb(null, `resume-${req.user.id}-${Date.now()}.pdf`);
  },
});
const upload = multer({ storage });

router.get("/", volunteerController.getVolunteers);

router.post(
  "/upload-resume",
  authenticateToken,
  authorizeRoles("volunteer"),
  upload.single("resume"),
  volunteerController.uploadResume
);

router.put(
  "/update-profile",
  authenticateToken,
  authorizeRoles("volunteer"),
  upload.single("resume"),
  volunteerController.updateProfile
);
router.put(
  "/update-email",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerController.updateEmail
);

router.put(
  "/update-password",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerController.updatePassword
);
router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  volunteerController.getVolunteers
);
router.get(
  "/me",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerController.getMyProfile
);
router.get(
  "/getVolunteer/:volunteerId",
  authenticateToken,
  authorizeRoles("admin", "ngo", "volunteer"),
  volunteerController.getVolunteerById
);
router.delete(
  "/delete-resume",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerController.deleteResume
);
module.exports = router;
