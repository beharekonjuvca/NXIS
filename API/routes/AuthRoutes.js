const express = require("express");
const router = express.Router();
const {
  login,
  register,
  refreshToken,
} = require("../controllers/authController");
const { validateToken } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/validate", authenticateToken, validateToken);

router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

module.exports = router;
