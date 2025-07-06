// Test script for ExerciseService functionality
const API_URL = 'http://localhost:5001/api';

// Helper function for API calls
async function fetchAPI(endpoint, method, data, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: method,
      headers: headers,
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseData = await response.json();
    
    return {
      success: response.ok,
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

// Variables to store test data
let authToken = null;
let testExerciseId = null;

// Login to get authentication token
async function login() {
  console.log('Logging in to get auth token...');
  
  const result = await fetchAPI('/auth/login', 'POST', testCredentials);
  
  if (result.success) {
    console.log('Login successful');
    authToken = result.data.access_token;
    console.log('Auth token obtained');
    return true;
  } else {
    console.error('Login failed:', result.data);
    
    // If login failed, try to register a new test user
    console.log('Attempting to register new test user...');
    const registerData = {
      username: `testuser_${Math.floor(Math.random() * 1000)}`,
      email: `testuser_${Math.floor(Math.random() * 1000)}@example.com`,
      password: 'testpassword123',
      first_name: 'Test',
      last_name: 'User'
    };
    
    const registerResult = await fetchAPI('/auth/register', 'POST', registerData);
    
    if (registerResult.success) {
      console.log('Registration successful');
      testCredentials.username = registerData.username;
      testCredentials.password = registerData.password;
      authToken = registerResult.data.access_token;
      console.log('Auth token obtained');
      return true;
    } else {
      console.error('Registration also failed:', registerResult.data);
      return false;
    }
  }
}

// Test getting all lessons (which contain exercises)
async function testGetAllLessons() {
  console.log('\nTesting getAllLessons functionality (which contain exercises)...');
  
  const result = await fetchAPI('/lessons', 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched all exercises');
    console.log(`Total exercises retrieved: ${result.data.exercises ? result.data.exercises.length : 0}`);
    
    // Store first exercise ID for further testing if available
    if (result.data.exercises && result.data.exercises.length > 0) {
      testExerciseId = result.data.exercises[0].id;
      console.log(`Selected exercise ID for further testing: ${testExerciseId}`);
    }
    
    return true;
  } else {
    console.error('Failed to fetch exercises:', result);
    return false;
  }
}

// Test getting a specific exercise by ID
async function testGetExerciseById() {
  if (!testExerciseId) {
    console.log('\nSkipping getExerciseById test - no exercise ID available');
    return false;
  }
  
  console.log(`\nTesting getExerciseById functionality for ID: ${testExerciseId}...`);
  
  const result = await fetchAPI(`/exercises/${testExerciseId}`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched exercise details');
    console.log('Exercise title:', result.data.exercise.title);
    console.log('Exercise type:', result.data.exercise.type);
    return true;
  } else {
    console.error('Failed to fetch exercise details:', result);
    return false;
  }
}

// Test submitting an exercise solution
async function testSubmitExerciseSolution() {
  if (!testExerciseId) {
    console.log('\nSkipping submitExerciseSolution test - no exercise ID available');
    return false;
  }
  
  console.log(`\nTesting submitExerciseSolution functionality for ID: ${testExerciseId}...`);
  
  // Sample solution data - should be adjusted based on the exercise type
  const solutionData = {
    code: "SELECT * FROM users WHERE id = ?; -- Using parameterized query"
  };
  
  const result = await fetchAPI(`/exercises/${testExerciseId}/submit`, 'POST', solutionData, authToken);
  
  if (result.success) {
    console.log('Successfully submitted exercise solution');
    console.log('Submission result:', result.data.submission.is_correct ? 'Correct' : 'Incorrect');
    console.log('Feedback:', result.data.submission.feedback);
    return true;
  } else {
    console.error('Failed to submit exercise solution:', result);
    return false;
  }
}

// Test getting exercise submissions via user progress
async function testGetExerciseSubmissions() {
  if (!testExerciseId) {
    console.log('\nSkipping getExerciseSubmissions test - no exercise ID available');
    return false;
  }
  
  console.log(`\nTesting getExerciseSubmissions via user progress API for exercise ID: ${testExerciseId}...`);
  
  // First, we need to get the current user ID from a valid session
  const userResult = await fetchAPI('/auth/current', 'GET', null, authToken);
  
  if (!userResult.success) {
    console.error('Failed to get current user information');
    return false;
  }
  
  const userId = userResult.data.user.id;
  console.log(`Got user ID: ${userId}`);
  
  // Now get the user's progress which includes submissions
  const result = await fetchAPI(`/progress/user/${userId}`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched exercise submissions');
    console.log(`Total submissions retrieved: ${result.data.submissions ? result.data.submissions.length : 0}`);
    return true;
  } else {
    console.error('Failed to fetch exercise submissions:', result);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting ExerciseService tests...');
  console.log('===============================');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Authentication failed, cannot proceed with tests');
    return;
  }
  
  // Run all tests
  await testGetAllLessons();
  await testGetExerciseById();
  await testSubmitExerciseSolution();
  await testGetExerciseSubmissions();
  
  console.log('\n===============================');
  console.log('Exercise service tests completed!');
}

// Execute tests
runTests();
