import axios from 'axios';
import { mockProgress, mockUsers, mockDelay, isBackendAvailable } from './mockData';

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

const ProgressService = {
  /**
   * Get progress for a specific user
   * 
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters (module_id)
   * @returns {Promise} Response with progress data
   */
  getUserProgress: async (userId, params = {}) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/progress/user/${userId}`, { params });
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Get mock progress for the current user
      // For demo, we're using the standard user's progress data
      const progress = mockProgress.user.moduleProgress;
      
      // Filter by module_id if specified
      const filteredProgress = params.module_id
        ? progress.filter(p => p.module.id === params.module_id)
        : progress;
      
      return { progress: filteredProgress };
    }
  },
  
  /**
   * Get progress for a specific module
   * 
   * @param {string} userId - User ID
   * @param {string} moduleId - Module ID
   * @returns {Promise} Response with module progress data
   */
  getModuleProgress: async (userId, moduleId) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/progress/user/${userId}`, { 
        params: { module_id: moduleId } 
      });
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Get specific module progress
      const progress = mockProgress.user.moduleProgress.find(p => p.module.id === moduleId);
      
      if (!progress) {
        return { 
          progress: {
            module: null,
            total_lessons: 0,
            completed_lessons: 0,
            completion_percentage: 0,
            progress_details: []
          } 
        };
      }
      
      return { progress };
    }
  },
  
  /**
   * Update progress for a lesson
   * 
   * @param {string} lessonId - Lesson ID
   * @param {Object} progressData - Progress data (status, score)
   * @returns {Promise} Response with updated progress
   */
  updateLessonProgress: async (lessonId, progressData) => {
    try {
      console.log(`Updating progress for lesson ${lessonId}:`, progressData);
      const response = await apiClient.post(`/progress/lesson/${lessonId}`, progressData);
      console.log('Progress updated:', response.data);
      
      // If the lesson was completed, grant an achievement
      if (progressData.status === 'completed') {
        try {
          // We need to dynamically import to avoid circular dependencies
          const AchievementService = (await import('./AchievementService')).default;
          
          // Grant a lesson completion achievement
          await AchievementService.grantAchievement({
            achievement_type: 'lesson_completed',
            entity_type: 'lesson',
            entity_id: lessonId
          });
          
          // Check if all lessons in the module are completed
          // This is handled by the backend achievement system
        } catch (achievementError) {
          console.error('Error granting achievement:', achievementError);
          // We don't want to fail the progress update if achievement fails
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for lesson progress update');
        await mockDelay();  // Simulate network delay
      
        // Find the lesson in progress data
        let moduleFound = null;
        let lessonFound = false;
        
        // For demo purposes, work with the first module's progress
        const userModuleProgress = mockProgress.user.moduleProgress[0];
        
        // Find if lesson progress exists
        const lessonProgress = userModuleProgress.progress_details.find(p => p.lesson_id === lessonId);
        
        // Create updated progress
        let updatedProgress;
        
        if (lessonProgress) {
          // Update existing progress
          updatedProgress = {
            ...lessonProgress,
            status: progressData.status,
            score: progressData.score || lessonProgress.score,
            attempts: lessonProgress.attempts + 1,
            last_attempt_at: new Date().toISOString(),
            completed_at: progressData.status === 'completed' ? new Date().toISOString() : lessonProgress.completed_at
          };
        } else {
          // Create new progress entry
          updatedProgress = {
            lesson_id: lessonId,
            status: progressData.status,
            score: progressData.score || null,
            attempts: 1,
            last_attempt_at: new Date().toISOString(),
            completed_at: progressData.status === 'completed' ? new Date().toISOString() : null
          };
        }
        
        // Update completed_lessons count in the module progress
        if (progressData.status === 'completed' && (!lessonProgress || lessonProgress.status !== 'completed')) {
          userModuleProgress.completed_lessons++;
        }
        
        // Update completion percentage
        userModuleProgress.completion_percentage = Math.round(
          (userModuleProgress.completed_lessons / userModuleProgress.total_lessons) * 100
        );
        
        return { progress: updatedProgress };
      }
      
      throw error;
    }
  }
};

export default ProgressService;
