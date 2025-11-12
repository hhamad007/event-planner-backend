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
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [
      "http://localhost:3000", // Next.js default port
      "http://localhost:3001", // Alternative port
      "http://127.0.0.1:3000", // Alternative localhost
      "https://your-frontend-domain.vercel.app", // Add your deployed frontend URL
      "https://your-frontend-domain.netlify.app", // If using Netlify
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
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
  res.json({
    message: "Event Planner API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      events: "/api/events", 
      users: "/api/users",
      rsvp: "/api/rsvp",
      upload: "/api/upload"
    }
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Load routes safely
console.log("Loading routes...");

// Auth routes
try {
  const authRoutes = require("./routes/authRoutes");
  app.use("/api/auth", authRoutes);
  console.log("✅ Auth routes loaded");
} catch (error) {
  console.error("❌ Failed to load auth routes:", error.message);
}

// Event routes
try {
  const eventRoutes = require("./routes/eventRoutes");
  app.use("/api/events", eventRoutes);
  console.log("✅ Event routes loaded");
} catch (error) {
  console.error("❌ Failed to load event routes:", error.message);
}

// User routes
try {
  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded");
} catch (error) {
  console.error("❌ Failed to load user routes:", error.message);
}

// RSVP routes
try {
  const rsvpRoutes = require("./routes/rsvpRoutes");
  app.use("/api/rsvp", rsvpRoutes);
  console.log("✅ RSVP routes loaded");
} catch (error) {
  console.error("❌ Failed to load RSVP routes:", error.message);
}

// Upload routes - IMPORTANT: Load after other routes for proper middleware order
try {
  const uploadRoutes = require("./routes/uploadRoutes");
  app.use("/api/upload", uploadRoutes);
  console.log("✅ Upload routes loaded");
} catch (error) {
  console.error("❌ Failed to load upload routes:", error.message);
}

console.log("✅ All routes loaded successfully!");

// Error handling middleware - Must be after all routes
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: {
      auth: "/api/auth",
      events: "/api/events", 
      users: "/api/users",
      rsvp: "/api/rsvp",
      upload: "/api/upload",
      health: "/api/health"
    }
  });
});

console.log("✅ Server setup complete!");

// Export the app
module.exports = app;