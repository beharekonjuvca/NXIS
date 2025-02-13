const express = require("express");
const router = express.Router();
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const ngoController = require("../controllers/ngoController");

router.get("/", ngoController.getAllNGOs);

router.get("/:ngoId", ngoController.getNGOById);

router.put(
  "/update-profile",
  authenticateToken,
  authorizeRoles("ngo"),
  ngoController.updateNGOProfile
);

router.delete(
  "/:ngoId",
  authenticateToken,
  authorizeRoles("ngo", "admin"),
  ngoController.deleteNGOProfile
);
router.get(
  "/approved",
  authenticateToken,
  authorizeRoles("volunteer", "admin", "ngo"),
  ngoController.getApprovedNGOs
);

module.exports = router;
