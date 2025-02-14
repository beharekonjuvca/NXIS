const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const volunteerApplicationController = require("../controllers/volunteerApplicationController");

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin", "ngo"),
  volunteerApplicationController.getAllApplications
);

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
router.put(
  "/:applicationId/approve",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.approveApplication
);

router.put(
  "/:applicationId/reject",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.rejectApplication
);
router.put(
  "/:applicationId/assign-hours",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.assignHours
);

router.put(
  "/:applicationId/update-hours",
  authenticateToken,
  authorizeRoles("ngo"),
  volunteerApplicationController.updateHours
);

router.get(
  "/:opportunityId/hours",
  authenticateToken,
  authorizeRoles("admin", "ngo"),
  volunteerApplicationController.getHoursByOpportunity
);

router.get(
  "/:applicationId/hours",
  authenticateToken,
  authorizeRoles("admin", "ngo", "volunteer"),
  volunteerApplicationController.getHoursByApplication
);
router.get(
  "/my-applications",
  authenticateToken,
  authorizeRoles("volunteer"),
  volunteerApplicationController.getMyApplications
);

module.exports = router;
