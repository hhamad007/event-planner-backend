const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS configuration for frontend connection
app.use(
  cors({
    origin: [
      "http://localhost:3000", // Next.js default port
      "http://localhost:3001", // Alternative port
      "http://127.0.0.1:3000", // Alternative localhost
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: false }));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Test route
app.get("/", (req, res) => {
  res.json({ message: "Event Planner API is running!" });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test auth endpoint (keep this for debugging)
app.post("/api/test-register", (req, res) => {
  console.log("Direct test register route hit!");
  console.log("Body received:", req.body);
  res.json({
    success: true,
    message: "Direct test registration working!",
    receivedData: req.body,
  });
});

// Load routes safely
console.log("Loading routes...");

// Auth routes
try {
  console.log("Loading auth routes...");
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load auth routes:", error.message);
}

// Event routes
try {
  console.log("Loading event routes...");
  const eventRoutes = require("./routes/eventRoutes");
  app.use("/api/events", eventRoutes);
  console.log("✅ Event routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load event routes:", error.message);
  console.error("Using fallback inline routes...");

  // Fallback inline routes if loading fails
  app.get("/api/events", (req, res) => {
    res.json({
      success: true,
      message: "Events endpoint working (fallback)!",
      data: [],
    });
  });

  app.post("/api/events", (req, res) => {
    res.json({
      success: true,
      message: "Create event endpoint working (fallback)!",
      data: req.body,
    });
  });
}

// User routes
try {
  console.log("Loading user routes...");
  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load user routes:", error.message);
}

// RSVP routes
try {
  console.log("Loading RSVP routes...");
  const rsvpRoutes = require("./routes/rsvpRoutes");
  app.use("/api/rsvp", rsvpRoutes);
  console.log("✅ RSVP routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load RSVP routes:", error.message);
}

// Upload routes - IMPORTANT: Load after other routes for proper middleware order
try {
  console.log("Loading upload routes...");
  const uploadRoutes = require("./routes/uploadRoutes");
  app.use("/api/upload", uploadRoutes);
  console.log("✅ Upload routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load upload routes:", error.message);
  console.error("Upload functionality will not be available");
}

console.log("✅ Server setup complete!");

// Export the app
module.exports = app;