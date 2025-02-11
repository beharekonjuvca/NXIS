const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const volunteerOpportunityController = require("../controllers/volunteerOpportunityController");

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
