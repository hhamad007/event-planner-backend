const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get("/", (req, res) => {
  res.json({
    message: "Event Planner API is running!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

module.exports = app;
