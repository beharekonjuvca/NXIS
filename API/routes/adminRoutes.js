const express = require("express");
const router = express.Router();
const {
  approveNGO,
  getAllUsers,
  deleteUser,
  rejectNGO,
} = require("../controllers/adminController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.patch(
  "/approve-ngo/:ngoId",
  authenticateToken,
  authorizeRoles("admin"),
  approveNGO
);
router.patch(
  "/reject-ngo/:ngoId",
  authenticateToken,
  authorizeRoles("admin"),
  rejectNGO
);
router.get("/users", authenticateToken, authorizeRoles("admin"), getAllUsers);
router.delete(
  "/user/:userId",
  authenticateToken,
  authorizeRoles("admin"),
  deleteUser
);

module.exports = router;
