const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const volunteerApplicationController = require("../controllers/volunteerApplicationController");

router.post(
  "/:opportunityId/apply",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerApplicationController.applyForOpportunity
);

router.get(
  "/:opportunityId/applicants",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.getApplicantsForOpportunity
);

router.put(
  "/:applicationId/status",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.updateApplicationStatus
);

router.delete(
  "/:applicationId",
  authenticateToken,
  authorizeRoles("volunteer", "admin"),
  volunteerApplicationController.deleteApplication
);

module.exports = router;
