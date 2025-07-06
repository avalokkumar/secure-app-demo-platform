import axios from 'axios';
import { mockLessons, mockCodeSnippets, mockDelay, isBackendAvailable } from './mockData';

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

const LessonService = {
  /**
   * Get a specific lesson by ID
   * 
   * @param {string} lessonId - Lesson ID
   * @returns {Promise} Response with lesson data
   */
  getLessonById: async (lessonId) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/lessons/${lessonId}`);
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Find lesson by ID
      let foundLesson = null;
      Object.values(mockLessons).forEach(lessonArray => {
        const lesson = lessonArray.find(l => l.id === lessonId);
        if (lesson) foundLesson = lesson;
      });
      
      if (!foundLesson) {
        throw { response: { status: 404, data: { message: 'Lesson not found' } } };
      }
      
      return { lesson: foundLesson };
    }
  },
  
  /**
   * Get lessons for a specific module
   * 
   * @param {string} moduleId - Module ID
   * @param {Object} params - Query parameters (page, per_page, content_type, is_active)
   * @returns {Promise} Response with lessons data
   */
  getModuleLessons: async (moduleId, params = {}) => {
    const response = await apiClient.get(`/modules/${moduleId}/lessons`, { params });
    return response.data;
  },
  
  /**
   * Get code snippets for a specific lesson
   * 
   * @param {string} lessonId - Lesson ID
   * @returns {Promise} Response with code snippets data
   */
  getLessonCodeSnippets: async (lessonId) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/lessons/${lessonId}/code-snippets`);
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Find code snippets for this lesson
      const snippets = mockCodeSnippets.filter(s => s.lesson_id === lessonId);
      return { code_snippets: snippets };
    }
  },
  
  /**
   * Create a new lesson (admin only)
   * 
   * @param {string} moduleId - Module ID
   * @param {Object} lessonData - Lesson data
   * @returns {Promise} Response with created lesson data
   */
  createLesson: async (moduleId, lessonData) => {
    const response = await apiClient.post(`/modules/${moduleId}/lessons`, lessonData);
    return response.data;
  },
  
  /**
   * Update a lesson (admin only)
   * 
   * @param {string} lessonId - Lesson ID
   * @param {Object} lessonData - Updated lesson data
   * @returns {Promise} Response with updated lesson data
   */
  updateLesson: async (lessonId, lessonData) => {
    const response = await apiClient.put(`/lessons/${lessonId}`, lessonData);
    return response.data;
  },
  
  /**
   * Delete a lesson (admin only)
   * 
   * @param {string} lessonId - Lesson ID
   * @returns {Promise} Response with deletion status
   */
  deleteLesson: async (lessonId) => {
    const response = await apiClient.delete(`/lessons/${lessonId}`);
    return response.data;
  }
};

export default LessonService;
