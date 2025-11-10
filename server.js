// Load environment variables FIRST (before anything else)
require("dotenv").config();

// Import app and database connection
const app = require("./app");
const connectDB = require("./config/db");

// Get port from environment variables
const PORT = process.env.PORT || 5001;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Access your API at: http://localhost:${PORT}`);
  console.log(`📊 MongoDB Status: ${process.env.MONGODB_URI ? 'Connected' : 'No URI provided'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});