/* MongoDB connection, etc */
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
};

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGODB_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       serverSelectionTimeoutMS: 60000, // Increase timeout for hotspot
//       socketTimeoutMS: 45000,
//       connectTimeoutMS: 60000,
//       family: 4, // Force IPv4
//       maxPoolSize: 10,
//       bufferMaxEntries: 0,
//     });

//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
//   } catch (error) {
//     console.error(`❌ Database connection failed: ${error.message}`);
//     process.exit(1);
//   }
// };

module.exports = connectDB;
