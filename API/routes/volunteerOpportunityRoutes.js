const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const volunteerOpportunityController = require("../controllers/volunteerOpportunityController");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/opportunities/",
  filename: (req, file, cb) => {
    cb(
      null,
      `opportunity-${req.params.opportunityId}-${Date.now()}${path.extname(
        file.originalname
      )}`
    );
  },
});
const upload = multer({ storage });

router.post(
  "/:opportunityId/upload-picture",
  authenticateToken,
  authorizeRoles("ngo"),
  upload.single("picture"),
  volunteerOpportunityController.uploadOpportunityPicture
);

router.get("/", volunteerOpportunityController.getAllOpportunities);
router.get("/:id", volunteerOpportunityController.getOpportunityById);

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerOpportunityController.createOpportunity
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerOpportunityController.updateOpportunity
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles("ngo", "admin"),
  volunteerOpportunityController.deleteOpportunity
);

module.exports = router;
