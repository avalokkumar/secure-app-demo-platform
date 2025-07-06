// Base URL for the API
const API_URL = 'http://localhost:5001/api';

// Helper function for API calls
async function fetchAPI(endpoint, method, data) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        status: response.status,
        data: responseData
      };
    }
    
    return {
      success: true,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Test user credentials
const testCredentials = {
  username: 'testuser',
  password: 'testpassword123'
};

// Test login function
async function testLogin(credentials = testCredentials) {
  console.log('Testing login functionality...');
  console.log('Credentials:', credentials);
  
  const result = await fetchAPI('/auth/login', 'POST', credentials);
  
  if (result.success) {
    console.log('Login successful!');
    console.log('Response:', result.data);
    return result.data;
  } else {
    console.error('Login failed!');
    console.error('Error status:', result.status);
    console.error('Error data:', result.data);
    return null;
  }
}

// Test registration function
async function testRegistration() {
  console.log('Testing registration functionality...');
  
  const testUser = {
    username: `testuser_${Math.floor(Math.random() * 1000)}`,
    email: `testuser_${Math.floor(Math.random() * 1000)}@example.com`,
    password: 'testpassword123',
    first_name: 'Test',
    last_name: 'User'
  };
  
  console.log('Registration data:', testUser);
  const result = await fetchAPI('/auth/register', 'POST', testUser);
  
  if (result.success) {
    console.log('Registration successful!');
    console.log('Response:', result.data);
    return { ...result.data, credentials: { username: testUser.username, password: testUser.password } };
  } else {
    console.error('Registration failed!');
    console.error('Error status:', result.status);
    console.error('Error data:', result.data);
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting authentication tests...');
  console.log('-------------------------------');
  
  // Test registration first
  const registrationResult = await testRegistration();
  
  // If registration was successful, test login with the new credentials
  if (registrationResult && registrationResult.credentials) {
    console.log('\n-------------------------------');
    console.log('Testing login with newly registered user...');
    // Test login with the registered user
    await testLogin(registrationResult.credentials);
  } else {
    console.log('\n-------------------------------');
    console.log('Testing login with default test credentials...');
    // Try logging in with default test credentials
    await testLogin();
  }
  
  console.log('\n-------------------------------');
  console.log('Tests completed!');
}

// Run the tests
runTests();
