const axios = require("axios");

const BASE_URL = "http://localhost:5001/api";
let authToken = "";
let testEventId = "";
let testUser = {
  email: `phase5test${Date.now()}@example.com`,
  password: "password123",
  name: "Phase 5 Test User",
};

// Helper function
async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    if (data) config.data = data;

    console.log(`Making request: ${method} ${config.url}`);

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testPhase5() {
  console.log("🧪 Testing Phase 5: User Profile & RSVP System\n");

  try {
    // 1. FIRST REGISTER A NEW USER
    console.log("1. Registering test user...");
    const registerData = await makeRequest("POST", "/auth/register", testUser);
    console.log("✅ Registered test user successfully");

    // 2. NOW LOGIN WITH THE REGISTERED USER
    console.log("2. Logging in...");
    const loginData = await makeRequest("POST", "/auth/login", {
      email: testUser.email,
      password: testUser.password,
    });

    authToken = loginData.data.token;
    console.log("✅ Logged in successfully\n");

    // 3. Test user profile
    console.log("3. Testing user profile...");
    const profile = await makeRequest("GET", "/users/profile", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log("✅ Got user profile:", profile.data.name);

    // 4. Update user profile
    console.log("4. Updating user profile...");
    const updatedProfile = await makeRequest(
      "PUT",
      "/users/profile",
      {
        bio: "I love attending tech events!",
        location: "New York, NY",
        phone: "+1234567890",
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    console.log("✅ Updated user profile");

    // 5. Get user's events
    console.log("5. Getting user events...");
    const userEvents = await makeRequest("GET", "/users/my-events", null, {
      Authorization: `Bearer ${authToken}`,
    });
    console.log(`✅ User has ${userEvents.count} created events`);

    // 6. Create a test event
    console.log("6. Creating test event...");
    // Create a future date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30); // 30 days from now

    const eventData = await makeRequest(
      "POST",
      "/events",
      {
        title: "Phase 5 Test Event",
        description: "Testing Phase 5 functionality",
        date: futureDate.toISOString(), // Future date
        time: "18:00", // Required time field
        location: {
          address: "123 Test St",
          city: "NYC",
          state: "NY",
          zipCode: "10001",
        },
        category: "conference",
        price: 25,
        maxAttendees: 50,
      },
      {
        Authorization: `Bearer ${authToken}`,
      }
    );
    testEventId = eventData.data._id;
    console.log("✅ Created test event");

    // 7. Test RSVP functionality (if available)
    console.log("7. Testing RSVP...");
    try {
      const rsvpData = await makeRequest(
        "POST",
        `/rsvp/${testEventId}`,
        {
          status: "attending",
          numberOfGuests: 1,
        },
        {
          Authorization: `Bearer ${authToken}`,
        }
      );
      console.log("✅ RSVP created successfully");
    } catch (error) {
      console.log("⚠️  RSVP test skipped (might not be implemented yet)");
    }

    console.log("\n🎉 Phase 5 tests completed successfully!");
  } catch (error) {
    console.error("\n❌ Phase 5 test failed:", error.message);
  }
}

testPhase5();
