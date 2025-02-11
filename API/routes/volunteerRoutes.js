const express = require("express");
const router = express.Router();
const { getVolunteers } = require("../controllers/volunteerController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.get("/", authenticateToken, getVolunteers);

module.exports = router;
