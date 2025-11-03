const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5001;

// Load environment variables
require("dotenv").config();

// Connect to database
connectDB();

app.get("/", (req, res) => {});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
});
