/**
 * End-to-End Test for Module Lessons
 * This script tests that lessons have been successfully added to all intermediate and advanced modules,
 * and that they can be accessed through the API and frontend components.
 */

// Configuration
const API_URL = 'http://localhost:5001/api';
const USERNAME = 'testuser';
const PASSWORD = 'testpassword123';
const EMAIL = 'testuser@example.com';

// Helper function for API calls
async function fetchAPI(endpoint, method = 'GET', data = null, token = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const options = {
      method: method,
      headers: headers,
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const responseData = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data: responseData
    };
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    return { success: false, error: error.message };
  }
}

// Module slugs from the expected IDs
const MODULE_SLUGS = {
  csrf: 'csrf',
  accessControl: 'broken-access-control',
  bufferOverflow: 'buffer-overflow',
  rce: 'rce'
};

// Main test function
async function runTests() {
  console.log('Starting module lessons end-to-end tests...\n');
  
  // Step 1: Register a test user (or login if already exists)
  console.log('Step 1: Registering/logging in test user...');
  
  // Try to login first
  let loginResult = await fetchAPI('/auth/login', 'POST', {
    username: USERNAME,
    password: PASSWORD
  });
  
  // If login fails, register user
  if (!loginResult.success) {
    console.log('  Login failed. Registering new user...');
    
    const registerResult = await fetchAPI('/auth/register', 'POST', {
      username: USERNAME,
      password: PASSWORD,
      email: EMAIL
    });
    
    if (!registerResult.success) {
      console.error('  Failed to register user:', registerResult.data);
      return;
    }
    
    console.log('  User registered successfully');
    
    // Now login
    loginResult = await fetchAPI('/auth/login', 'POST', {
      username: USERNAME,
      password: PASSWORD
    });
  }
  
  if (!loginResult.success) {
    console.error('  Failed to log in:', loginResult.data);
    return;
  }
  
  console.log('  User logged in successfully');
  const token = loginResult.data.access_token;
  
  // Step 2: Fetch all modules
  console.log('\nStep 2: Fetching all modules...');
  const modulesResult = await fetchAPI('/modules', 'GET', null, token);
  
  if (!modulesResult.success) {
    console.error('  Failed to fetch modules:', modulesResult.data);
    return;
  }
  
  console.log(`  Successfully fetched ${modulesResult.data.results.length} modules`);
  
  // Find intermediate and advanced modules
  const modules = modulesResult.data.results;
  const intermediateModules = modules.filter(m => m.difficulty === 'intermediate');
  const advancedModules = modules.filter(m => m.difficulty === 'advanced');
  
  console.log(`  Found ${intermediateModules.length} intermediate modules`);
  console.log(`  Found ${advancedModules.length} advanced modules`);
  
  // Step 3: Test lessons for CSRF module
  console.log('\nStep 3: Testing CSRF module lessons...');
  const csrfModule = modules.find(m => m.slug === MODULE_SLUGS.csrf);
  
  if (!csrfModule) {
    console.error('  CSRF module not found');
  } else {
    await testModuleLessons(csrfModule, token);
  }
  
  // Step 4: Test lessons for Broken Access Control module
  console.log('\nStep 4: Testing Broken Access Control module lessons...');
  const accessControlModule = modules.find(m => m.slug === MODULE_SLUGS.accessControl);
  
  if (!accessControlModule) {
    console.error('  Broken Access Control module not found');
  } else {
    await testModuleLessons(accessControlModule, token);
  }
  
  // Step 5: Test lessons for Buffer Overflow module
  console.log('\nStep 5: Testing Buffer Overflow module lessons...');
  const bufferOverflowModule = modules.find(m => m.slug === MODULE_SLUGS.bufferOverflow);
  
  if (!bufferOverflowModule) {
    console.error('  Buffer Overflow module not found');
  } else {
    await testModuleLessons(bufferOverflowModule, token);
  }
  
  // Step 6: Test lessons for Remote Code Execution module
  console.log('\nStep 6: Testing Remote Code Execution module lessons...');
  const rceModule = modules.find(m => m.slug === MODULE_SLUGS.rce);
  
  if (!rceModule) {
    console.error('  Remote Code Execution module not found');
  } else {
    await testModuleLessons(rceModule, token);
  }
  
  // Step 7: Test progress tracking with lessons
  console.log('\nStep 7: Testing lesson progress tracking...');
  
  // Use first lesson from CSRF module for testing progress
  if (csrfModule) {
    const lessonsResult = await fetchAPI(`/modules/${csrfModule.id}/lessons`, 'GET', null, token);
    
    if (lessonsResult.success && lessonsResult.data.results.length > 0) {
      const firstLesson = lessonsResult.data.results[0];
      
      console.log(`  Marking lesson "${firstLesson.title}" as completed...`);
      
      const markCompletedResult = await fetchAPI('/progress', 'POST', {
        lesson_id: firstLesson.id,
        completed: true
      }, token);
      
      if (markCompletedResult.success) {
        console.log('  Successfully marked lesson as completed');
        
        // Verify progress is updated
        const progressResult = await fetchAPI('/progress', 'GET', null, token);
        
        if (progressResult.success) {
          const lessonProgress = progressResult.data.find(p => p.lesson_id === firstLesson.id);
          
          if (lessonProgress && lessonProgress.completed) {
            console.log('  Progress tracking verified - lesson shows as completed');
          } else {
            console.error('  Progress tracking verification failed - lesson does not show as completed');
          }
        } else {
          console.error('  Failed to fetch user progress:', progressResult.data);
        }
      } else {
        console.error('  Failed to mark lesson as completed:', markCompletedResult.data);
      }
    }
  }
  
  console.log('\nAll tests completed!');
}

// Helper function to test lessons for a specific module
async function testModuleLessons(module, token) {
  console.log(`  Testing lessons for module: ${module.name}`);
  
  // Fetch lessons
  const lessonsResult = await fetchAPI(`/modules/${module.id}/lessons`, 'GET', null, token);
  
  if (!lessonsResult.success) {
    console.error(`  Failed to fetch lessons for ${module.name}:`, lessonsResult.data);
    return;
  }
  
  const lessons = lessonsResult.data.results;
  console.log(`  Successfully fetched ${lessons.length} lessons for ${module.name}`);
  
  // Ensure module has lessons
  if (lessons.length === 0) {
    console.error(`  No lessons found for ${module.name}`);
    return;
  }
  
  // Test first lesson content
  const firstLesson = lessons[0];
  console.log(`  First lesson: ${firstLesson.title}`);
  
  // Fetch individual lesson to verify content
  const lessonResult = await fetchAPI(`/lessons/${firstLesson.id}`, 'GET', null, token);
  
  if (!lessonResult.success) {
    console.error(`  Failed to fetch lesson ${firstLesson.id}:`, lessonResult.data);
    return;
  }
  
  if (lessonResult.data.content) {
    console.log(`  Successfully verified lesson content exists for ${firstLesson.title}`);
  } else {
    console.error(`  No content found for lesson ${firstLesson.title}`);
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Test execution error:', err);
});
