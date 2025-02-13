const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const multer = require("multer");
const userController = require("../controllers/userController");

const storage = multer.diskStorage({
  destination: "uploads/profile_pictures/",
  filename: (req, file, cb) => {
    cb(null, `profile-${req.user.id}-${Date.now()}.jpg`);
  },
});
const upload = multer({ storage });

router.get("getUser/:userId", authenticateToken, userController.getUserById);

router.put("/update-email", authenticateToken, userController.updateEmail);

router.put(
  "/update-password",
  authenticateToken,
  userController.updatePassword
);

router.post(
  "/upload-profile-picture",
  authenticateToken,
  upload.single("profilePicture"),
  userController.uploadProfilePicture
);

router.delete(
  "/delete-profile-picture",
  authenticateToken,
  userController.deleteProfilePicture
);
module.exports = router;
