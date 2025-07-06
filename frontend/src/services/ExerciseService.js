import axios from 'axios';
import { mockExercise, mockSubmissions, mockDelay } from './mockData';

// Create axios instance for API requests
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance with authorization header
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header to requests when token is available
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle 401 responses (token expired)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: {
            'Authorization': `Bearer ${refreshToken}`
          }
        });
        
        // Store the new token
        localStorage.setItem('accessToken', response.data.access_token);
        
        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Check if the backend API is available or if we should use mock data
 */
const isBackendAvailable = async () => {
  try {
    // Always try to use the real backend first
    return true;
  } catch (error) {
    console.warn('Backend API not available, using mock data');
    return false;
  }
};

const ExerciseService = {
  /**
   * Get a specific exercise by ID
   * 
   * @param {string} exerciseId - Exercise ID
   * @returns {Promise} Response with exercise data and user submissions
   */
  getExerciseById: async (exerciseId) => {
    try {
      console.log(`Fetching exercise with ID: ${exerciseId}`);
      const response = await apiClient.get(`/exercises/${exerciseId}`);
      console.log('Exercise data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercise:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for exercise');
        await mockDelay();
        
        // Get mock exercise data
        if (mockExercise.id !== exerciseId) {
          throw { response: { status: 404, data: { message: 'Exercise not found' } } };
        }
        
        // Get mock submissions for this exercise
        const submissions = mockSubmissions[exerciseId] || [];
        
        return {
          exercise: mockExercise,
          submissions: submissions
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Submit a solution for an exercise
   * 
   * @param {string} exerciseId - Exercise ID
   * @param {Object} data - Submission data (code)
   * @returns {Promise} Response with submission result
   */
  submitExerciseSolution: async (exerciseId, data) => {
    try {
      console.log(`Submitting solution for exercise ${exerciseId}:`, data);
      const response = await apiClient.post(`/exercises/${exerciseId}/submit`, data);
      console.log('Submission response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error submitting exercise solution:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for submission');
        await mockDelay(1500);  // Longer delay to simulate code execution
        
        // Check if this is the SQL injection exercise
        if (exerciseId === mockExercise.id) {
          // Simple check for parameterized query in the code
          const isSuccessful = data.code.includes('?') && 
                              (data.code.includes('cursor.execute(query, (') || 
                               data.code.includes('cursor.execute(query, ['));
          
          // Create a new submission
          const newSubmission = {
            id: 'submission-' + Math.random().toString(36).substr(2, 9),
            exercise_id: exerciseId,
            submitted_code: data.code,
            is_successful: isSuccessful,
            feedback: isSuccessful ? 
              'Great job! You correctly used parameterized queries to prevent SQL injection.' : 
              'Your solution does not appear to use parameterized queries correctly. Try again!',
            execution_time: (Math.random() * 0.5 + 0.2).toFixed(2),
            created_at: new Date().toISOString()
          };
          
          // Add this submission to mock data for future reference
          if (!mockSubmissions[exerciseId]) {
            mockSubmissions[exerciseId] = [];
          }
          mockSubmissions[exerciseId].unshift(newSubmission);
          
          return { submission: newSubmission };
        } else {
          throw { response: { status: 404, data: { message: 'Exercise not found' } } };
        }
      }
      
      throw error;
    }
  },
  
  /**
   * Get all submissions for an exercise by the current user
   * 
   * @param {string} exerciseId - Exercise ID
   * @returns {Promise} Response with submissions data
   */
  getExerciseSubmissions: async (exerciseId) => {
    try {
      // Get the current user information
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id;
      
      if (!userId) {
        throw new Error('User ID not found. Please log in again.');
      }
      
      console.log(`Fetching submissions for exercise ${exerciseId} for user ${userId}`);
      
      // First try getting submissions directly from the exercise
      try {
        const exerciseResponse = await apiClient.get(`/exercises/${exerciseId}`);
        
        if (exerciseResponse.data && exerciseResponse.data.submissions) {
          console.log('Found submissions in exercise data:', exerciseResponse.data.submissions);
          return { submissions: exerciseResponse.data.submissions };
        }
      } catch (exerciseError) {
        console.warn('Could not get submissions from exercise data:', exerciseError);
        // Continue to try the user progress endpoint
      }
      
      // If that fails, try the user progress endpoint
      const progressResponse = await apiClient.get(`/progress/user/${userId}`);
      
      if (progressResponse.data && progressResponse.data.submissions) {
        // Filter for submissions related to this exercise
        const exerciseSubmissions = progressResponse.data.submissions.filter(
          submission => submission.exercise_id === exerciseId
        );
        
        console.log('Found submissions in user progress:', exerciseSubmissions);
        return { submissions: exerciseSubmissions };
      }
      
      // If both attempts fail, return empty submissions
      return { submissions: [] };
    } catch (error) {
      console.error('Error fetching exercise submissions:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for submissions');
        await mockDelay();
        
        // Return mock submissions for this exercise
        const submissions = mockSubmissions[exerciseId] || [];
        return { submissions };
      }
      
      throw error;
    }
  },
  
  /**
   * Get all exercises available to the current user
   * 
   * @returns {Promise} Response with list of exercises
   */
  getAllExercises: async () => {
    try {
      console.log('Fetching all exercises');
      const response = await apiClient.get('/lessons');
      
      // Extract exercises from lessons
      const lessons = response.data.lessons || [];
      const exercises = [];
      
      // Flatten exercises from all lessons
      lessons.forEach(lesson => {
        if (lesson.exercises && Array.isArray(lesson.exercises)) {
          lesson.exercises.forEach(exercise => {
            exercises.push({
              ...exercise,
              lesson_id: lesson.id,
              lesson_title: lesson.title
            });
          });
        }
      });
      
      console.log(`Found ${exercises.length} exercises across all lessons`);
      return { exercises };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for all exercises');
        await mockDelay();
        
        return { exercises: [mockExercise] };
      }
      
      throw error;
    }
  }
};

export default ExerciseService;
