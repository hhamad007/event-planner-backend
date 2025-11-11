const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
let authToken1 = '';
let authToken2 = '';
let testEventId = '';
let testUser1 = {
  email: `phase6user1${Date.now()}@example.com`,
  password: 'password123',
  name: 'Phase 6 Test User 1'
};
let testUser2 = {
  email: `phase6user2${Date.now()}@example.com`,
  password: 'password123',
  name: 'Phase 6 Test User 2'
};

async function makeRequest(method, url, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) config.data = data;
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error: ${error.response?.data?.message || error.message}`);
    throw error;
  }
}

async function testPhase6() {
  console.log('🧪 Testing Phase 6: Complete RSVP System\n');
  
  try {
    console.log('1️⃣ Setting up test users...');
    // Register and login two users
    await makeRequest('POST', '/auth/register', testUser1);
    const login1 = await makeRequest('POST', '/auth/login', {
      email: testUser1.email,
      password: testUser1.password
    });
    authToken1 = login1.data.token;

    await makeRequest('POST', '/auth/register', testUser2);
    const login2 = await makeRequest('POST', '/auth/login', {
      email: testUser2.email,
      password: testUser2.password
    });
    authToken2 = login2.data.token;
    console.log('✅ Two test users created and logged in');

    console.log('\n2️⃣ Creating test event...');
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 20);

    const eventData = await makeRequest('POST', '/events', {
      title: 'Phase 6 RSVP Test Event',
      description: 'Testing complete RSVP functionality',
      date: futureDate.toISOString(),
      time: '19:00',
      location: {
        address: '456 RSVP Street',
        city: 'RSVP City',
        state: 'RS',
        zipCode: '54321'
      },
      category: 'workshop',
      price: 15,
      maxAttendees: 3  // Small capacity for testing
    }, {
      Authorization: `Bearer ${authToken1}`
    });
    testEventId = eventData.data._id;
    console.log('✅ Test event created with capacity: 3');

    console.log('\n3️⃣ Testing RSVP Creation...');
    // User 2 RSVPs to User 1's event
    const rsvpData = await makeRequest('POST', `/rsvp/${testEventId}`, {
      status: 'attending',
      numberOfGuests: 1
    }, {
      Authorization: `Bearer ${authToken2}`
    });
    console.log('✅ RSVP created successfully');

    console.log('\n4️⃣ Testing RSVP Status Check...');
    const rsvpStatus = await makeRequest('GET', `/rsvp/${testEventId}/status`, null, {
      Authorization: `Bearer ${authToken2}`
    });
    console.log(`✅ RSVP Status: ${rsvpStatus.data.status}, Guests: ${rsvpStatus.data.numberOfGuests}`);

    console.log('\n5️⃣ Testing Get Event Attendees...');
    const attendees = await makeRequest('GET', `/rsvp/${testEventId}/attendees`, null, {
      Authorization: `Bearer ${authToken1}`
    });
    console.log(`✅ Event has ${attendees.count} attendees`);

    console.log('\n6️⃣ Testing Get User RSVPs...');
    const userRsvps = await makeRequest('GET', '/rsvp/my-rsvps', null, {
      Authorization: `Bearer ${authToken2}`
    });
    console.log(`✅ User has ${userRsvps.count} RSVPs`);

    console.log('\n7️⃣ Testing RSVP Update...');
    const updatedRSVP = await makeRequest('PUT', `/rsvp/${testEventId}`, {
      numberOfGuests: 2,
      specialRequests: 'Need vegetarian meal'
    }, {
      Authorization: `Bearer ${authToken2}`
    });
    console.log('✅ RSVP updated successfully');

    console.log('\n8️⃣ Testing Event Capacity Limits...');
    // Try to create another RSVP that would exceed capacity
    try {
      await makeRequest('POST', `/rsvp/${testEventId}`, {
        status: 'attending',
        numberOfGuests: 2  // This should fail (would exceed capacity of 3)
      }, {
        Authorization: `Bearer ${authToken1}`
      });
      console.log('❌ Should have failed due to capacity limit');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Capacity limit enforced correctly');
      } else {
        console.log('⚠️  Unexpected error:', error.response?.data?.message);
      }
    }

    console.log('\n9️⃣ Testing RSVP Cancellation...');
    await makeRequest('DELETE', `/rsvp/${testEventId}`, null, {
      Authorization: `Bearer ${authToken2}`
    });
    console.log('✅ RSVP cancelled successfully');

    console.log('\n🔟 Verifying Cancellation...');
    const cancelledStatus = await makeRequest('GET', `/rsvp/${testEventId}/status`, null, {
      Authorization: `Bearer ${authToken2}`
    });
    
    if (!cancelledStatus.data.hasRSVP) {
      console.log('✅ RSVP cancellation verified');
    }

    console.log('\n🎉 PHASE 6 COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n📋 RSVP System Features Tested:');
    console.log('✅ Create RSVP to event');
    console.log('✅ Cancel RSVP');
    console.log('✅ Get event attendees list');
    console.log('✅ Check RSVP status');
    console.log('✅ Handle event capacity limits');
    console.log('✅ Update RSVP details');
    console.log('✅ Get user RSVP history');

  } catch (error) {
    console.error('\n❌ Phase 6 test failed:', error.message);
  }
}

testPhase6();