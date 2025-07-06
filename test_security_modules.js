// Test script for Security Modules, Achievements, and Progress functionality
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
let testUserId = null;
let testModuleId = null;
let testLessonId = null;

// Login to get authentication token
async function login() {
  console.log('Logging in to get auth token...');
  
  const result = await fetchAPI('/auth/login', 'POST', testCredentials);
  
  if (result.success) {
    console.log('Login successful');
    authToken = result.data.access_token;
    testUserId = result.data.user.id;
    console.log(`Auth token obtained, user ID: ${testUserId}`);
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
      testUserId = registerResult.data.user.id;
      console.log(`Auth token obtained, user ID: ${testUserId}`);
      return true;
    } else {
      console.error('Registration also failed:', registerResult.data);
      return false;
    }
  }
}

// Test getting all modules
async function testGetModules() {
  console.log('\nTesting getModules functionality...');
  
  const result = await fetchAPI('/modules', 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched modules');
    console.log(`Total modules retrieved: ${result.data.modules ? result.data.modules.length : 0}`);
    
    // Store first module ID for further testing if available
    if (result.data.modules && result.data.modules.length > 0) {
      testModuleId = result.data.modules[0].id;
      console.log(`Selected module ID for further testing: ${testModuleId}`);
    }
    
    return true;
  } else {
    console.error('Failed to fetch modules:', result);
    return false;
  }
}

// Test getting a specific module by ID
async function testGetModuleById() {
  if (!testModuleId) {
    console.log('\nSkipping getModuleById test - no module ID available');
    return false;
  }
  
  console.log(`\nTesting getModuleById functionality for ID: ${testModuleId}...`);
  
  const result = await fetchAPI(`/modules/${testModuleId}`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched module details');
    console.log('Module name:', result.data.module.name);
    console.log('Module difficulty:', result.data.module.difficulty);
    return true;
  } else {
    console.error('Failed to fetch module details:', result);
    return false;
  }
}

// Test getting lessons for a module
async function testGetModuleLessons() {
  if (!testModuleId) {
    console.log('\nSkipping getModuleLessons test - no module ID available');
    return false;
  }
  
  console.log(`\nTesting getModuleLessons functionality for module ID: ${testModuleId}...`);
  
  const result = await fetchAPI(`/modules/${testModuleId}/lessons`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched module lessons');
    console.log(`Total lessons retrieved: ${result.data.lessons ? result.data.lessons.length : 0}`);
    
    // Store first lesson ID for further testing if available
    if (result.data.lessons && result.data.lessons.length > 0) {
      testLessonId = result.data.lessons[0].id;
      console.log(`Selected lesson ID for further testing: ${testLessonId}`);
    }
    
    return true;
  } else {
    console.error('Failed to fetch module lessons:', result);
    return false;
  }
}

// Test updating lesson progress
async function testUpdateLessonProgress() {
  if (!testLessonId) {
    console.log('\nSkipping updateLessonProgress test - no lesson ID available');
    return false;
  }
  
  console.log(`\nTesting updateLessonProgress functionality for lesson ID: ${testLessonId}...`);
  
  const progressData = {
    status: 'completed',
    score: 100
  };
  
  const result = await fetchAPI(`/progress/lesson/${testLessonId}`, 'POST', progressData, authToken);
  
  if (result.success) {
    console.log('Successfully updated lesson progress');
    console.log('Progress status:', result.data.progress.status);
    console.log('Progress score:', result.data.progress.score);
    return true;
  } else {
    console.error('Failed to update lesson progress:', result);
    return false;
  }
}

// Test granting an achievement
async function testGrantAchievement() {
  if (!testLessonId) {
    console.log('\nSkipping grantAchievement test - no lesson ID available');
    return false;
  }
  
  console.log(`\nTesting grantAchievement functionality...`);
  
  const achievementData = {
    achievement_type: 'lesson_completed',
    entity_type: 'lesson',
    entity_id: testLessonId
  };
  
  const result = await fetchAPI('/achievements/grant', 'POST', achievementData, authToken);
  
  if (result.success) {
    console.log('Successfully granted achievement');
    console.log('Achievement type:', result.data.achievement.achievement_type);
    console.log('Achievement entity:', result.data.achievement.entity_type);
    return true;
  } else {
    console.error('Failed to grant achievement:', result);
    return false;
  }
}

// Test getting user achievements
async function testGetUserAchievements() {
  if (!testUserId) {
    console.log('\nSkipping getUserAchievements test - no user ID available');
    return false;
  }
  
  console.log(`\nTesting getUserAchievements functionality for user ID: ${testUserId}...`);
  
  const result = await fetchAPI(`/achievements/user/${testUserId}`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched user achievements');
    console.log(`Total achievements retrieved: ${result.data.achievements ? result.data.achievements.length : 0}`);
    return true;
  } else {
    console.error('Failed to fetch user achievements:', result);
    return false;
  }
}

// Test getting user progress
async function testGetUserProgress() {
  if (!testUserId) {
    console.log('\nSkipping getUserProgress test - no user ID available');
    return false;
  }
  
  console.log(`\nTesting getUserProgress functionality for user ID: ${testUserId}...`);
  
  const result = await fetchAPI(`/progress/user/${testUserId}`, 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched user progress');
    console.log(`User progress data retrieved: ${JSON.stringify(result.data, null, 2)}`);
    return true;
  } else {
    console.error('Failed to fetch user progress:', result);
    return false;
  }
}

// Test getting module access
async function testGetModuleAccess() {
  console.log(`\nTesting getModuleAccess functionality...`);
  
  const result = await fetchAPI('/module-access', 'GET', null, authToken);
  
  if (result.success) {
    console.log('Successfully fetched module access');
    console.log(`Total accessible modules: ${result.data.modules ? result.data.modules.length : 0}`);
    return true;
  } else {
    console.error('Failed to fetch module access:', result);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Starting Security Modules tests...');
  console.log('===============================');
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.error('Authentication failed, cannot proceed with tests');
    return;
  }
  
  // Run all tests
  await testGetModules();
  await testGetModuleById();
  await testGetModuleLessons();
  await testUpdateLessonProgress();
  await testGrantAchievement();
  await testGetUserAchievements();
  await testGetUserProgress();
  await testGetModuleAccess();
  
  console.log('\n===============================');
  console.log('Security modules tests completed!');
}

// Execute tests
runTests();
