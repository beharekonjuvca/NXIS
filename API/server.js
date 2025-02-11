const express = require("express");
const cors = require("cors");
require("dotenv").config();
const errorHandler = require("./middleware/errorHandler");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/AuthRoutes");
app.use("/api/auth", authRoutes);

const volunteerRoutes = require("./routes/volunteerRoutes");
app.use("/api/volunteers", volunteerRoutes);

const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);

const volunteerOpportunityRoutes = require("./routes/volunteerOpportunityRoutes");
app.use("/api/volunteer-opportunities", volunteerOpportunityRoutes);

const volunteerApplicationRoutes = require("./routes/volunteerApplicationRoutes");
app.use("/api/volunteer-applications", volunteerApplicationRoutes);

const eventRoutes = require("./routes/eventRoutes");
app.use("/api/events", eventRoutes);

const eventAttendeeRoutes = require("./routes/eventAttendeeRoutes");
app.use("/api/event-attendees", eventAttendeeRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
