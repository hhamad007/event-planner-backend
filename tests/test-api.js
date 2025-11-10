const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api'; // Changed from 5000 to 5001
let authToken = '';
let testEventId = '';
let testUser = {
  email: `test${Date.now()}@example.com`,
  password: 'password123'
};

// Helper function to make requests with better error handling
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
    
    console.log(`Making request: ${method} ${config.url}`);
    console.log('Data:', data);
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Full error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      url: error.config?.url
    });
    throw new Error(`${method.toUpperCase()} ${url}: ${error.response?.data?.message || error.message}`);
  }
}

async function testAPI() {
  console.log('🧪 Starting Event Planner API Tests...\n');
  console.log('=' .repeat(50));

  try {
    // 0. Test direct endpoint first
    console.log('\n🧪 0. Testing Direct Test Endpoint...');
    const testData = await makeRequest('POST', '/test-register', {
      name: 'Test User',
      email: testUser.email,
      password: testUser.password
    });
    console.log('✅ Direct test endpoint working');
    console.log('Response:', testData);

    // 1. Test User Registration
    console.log('\n📝 1. Testing User Registration...');
    const registerData = await makeRequest('POST', '/auth/register', {
      name: 'Test User',
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ User registered successfully');
    const userId = registerData.data?.user?.id;
    console.log(`   User ID: ${userId}`);

    // 2. Test User Login
    console.log('\n🔐 2. Testing User Login...');
    const loginData = await makeRequest('POST', '/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    
    authToken = loginData.data?.token;
    
    if (!authToken) {
      throw new Error('No token found in login response');
    }
    
    console.log('✅ User logged in successfully');
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // 3. Test Get All Events
    console.log('\n📋 3. Testing Get All Events...');
    const allEventsData = await makeRequest('GET', '/events');
    console.log('✅ Retrieved all events successfully');
    console.log(`   Response:`, allEventsData);

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 TESTS COMPLETED SUCCESSFULLY! 🎉');
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   ${error.message}`);
    console.error('\n🔧 Debug info above should help identify the issue.');
  }
}

// Main execution
async function main() {
  console.log('🔍 Checking server connection...');
  
  try {
    const response = await axios.get('http://localhost:5001/'); // Changed from 5000 to 5001
    console.log('✅ Server is responding');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('⚠️  Server connection check failed:', error.message);
    console.log('   Make sure your server is running on port 5001'); // Updated message
    return;
  }

  await testAPI();
}

// Run the tests
main();