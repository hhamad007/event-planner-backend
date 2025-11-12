const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";

async function getRealCredentials() {
  try {
    console.log("🔑 Getting Real Credentials for Testing...\n");

    // Create test user
    const testUser = {
      email: `imagetest${Date.now()}@example.com`,
      password: "password123",
      name: "Image Test User",
    };

    console.log("1️⃣ Registering test user...");
    await axios.post(`${BASE_URL}/auth/register`, testUser);

    console.log("2️⃣ Logging in...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });

    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;

    console.log("3️⃣ Creating test event...");
    const eventResponse = await axios.post(
      `${BASE_URL}/events`,
      {
        title: "Image Upload Test Event",
        description: "Testing image upload functionality",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        time: "19:00",
        location: {
          address: "123 Test Street",
          city: "Test City",
          state: "TC",
          zipCode: "12345",
        },
        category: "workshop",
        price: 25,
        maxAttendees: 100,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const eventId = eventResponse.data.data._id;

    console.log("\n✅ SUCCESS! Here are your real credentials:\n");
    console.log("📧 Email:", testUser.email);
    console.log("🔒 Password:", testUser.password);
    console.log("🆔 User ID:", user.id);
    console.log("🎪 Event ID:", eventId);
    console.log("🔑 JWT Token:", token);

    console.log("\n📋 Use these EXACT values in your API client:\n");
    console.log("🔗 Event Image Upload URL:");
    console.log(`   POST http://localhost:5001/api/upload/event/${eventId}`);
    console.log("\n🔗 Avatar Upload URL:");
    console.log(`   POST http://localhost:5001/api/upload/avatar`);
    console.log("\n🎫 Authorization Header:");
    console.log(`   Authorization: Bearer ${token}`);

    console.log("\n🧪 Test endpoints first:");
    console.log(`   GET http://localhost:5001/api/events/${eventId}`);

    return { token, user, eventId, email: testUser.email };
  } catch (error) {
    console.error("❌ Error:", error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.error("Response data:", error.response.data);
    }
  }
}

getRealCredentials();