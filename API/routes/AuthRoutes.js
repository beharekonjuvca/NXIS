const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

// Protected Route Example
router.get("/admin", authenticateToken, authorizeRoles("admin"), (req, res) => {
  res.send("Welcome Admin!");
});

module.exports = router;
