const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Simple CORS configuration
app.use(
  cors({
    origin: true, // Allow all origins for now
    methods: ["GET", "POST", "PUT", "DELETE"],
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

// Event routes - NOW USING PROPER ROUTES INSTEAD OF INLINE
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

// Admin routes (optional)
try {
  console.log("Loading admin routes...");
  const adminRoutes = require("./routes/adminRoutes");
  app.use("/api/admin", adminRoutes);
  console.log("✅ Admin routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load admin routes:", error.message);
}

// User routes (optional)
try {
  console.log("Loading user routes...");
  const userRoutes = require("./routes/userRoutes");
  app.use("/api/users", userRoutes);
  console.log("✅ User routes loaded successfully");
} catch (error) {
  console.error("❌ Failed to load user routes:", error.message);
}

console.log("✅ Server setup complete!");

module.exports = app;
