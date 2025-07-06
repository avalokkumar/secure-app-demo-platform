import axios from 'axios';
import { mockModules, mockLessons, mockDelay, isBackendAvailable } from './mockData';

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
    if (error.response.status === 401 && !originalRequest._retry) {
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

const ModuleService = {
  /**
   * Get all available modules
   * 
   * @param {Object} params - Query parameters (page, per_page, difficulty, is_active)
   * @returns {Promise} Response with modules data
   */
  getModules: async (params = {}) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get('/modules', { params });
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Filter modules based on difficulty if specified
      let filteredModules = [...mockModules];
      if (params.difficulty) {
        filteredModules = filteredModules.filter(
          m => m.difficulty.toLowerCase() === params.difficulty.toLowerCase()
        );
      }
      
      // Calculate pagination
      const page = parseInt(params.page) || 1;
      const perPage = parseInt(params.per_page) || 10;
      const total = filteredModules.length;
      const totalPages = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const items = filteredModules.slice(start, end);
      
      return {
        items,
        pagination: {
          page,
          per_page: perPage,
          total,
          total_pages: totalPages
        }
      };
    }
  },
  
  /**
   * Get a specific module by ID
   * 
   * @param {string} moduleId - Module ID
   * @returns {Promise} Response with module data
   */
  getModuleById: async (moduleId) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/modules/${moduleId}`);
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Find module by ID or throw error
      const module = mockModules.find(m => m.id === moduleId);
      if (!module) {
        throw { response: { status: 404, data: { message: 'Module not found' } } };
      }
      
      return { module };
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
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await apiClient.get(`/modules/${moduleId}/lessons`, { params });
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Find module by ID
      const module = mockModules.find(m => m.id === moduleId);
      if (!module) {
        throw { response: { status: 404, data: { message: 'Module not found' } } };
      }
      
      // Get lessons for this module
      let moduleLessons = [];
      Object.values(mockLessons).forEach(lessonArray => {
        lessonArray.forEach(lesson => {
          if (lesson.module_id === moduleId) {
            moduleLessons.push(lesson);
          }
        });
      });
      
      // Sort by order index
      moduleLessons.sort((a, b) => a.order_index - b.order_index);
      
      // Filter by content_type if specified
      if (params.content_type) {
        moduleLessons = moduleLessons.filter(
          l => l.content_type === params.content_type
        );
      }
      
      // Calculate pagination
      const page = parseInt(params.page) || 1;
      const perPage = parseInt(params.per_page) || 10;
      const total = moduleLessons.length;
      const totalPages = Math.ceil(total / perPage);
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const items = moduleLessons.slice(start, end);
      
      return {
        items,
        pagination: {
          page,
          per_page: perPage,
          total,
          total_pages: totalPages
        }
      };
    }
  },
  
  /**
   * Create a new module (admin only)
   * 
   * @param {Object} moduleData - Module data
   * @returns {Promise} Response with created module data
   */
  createModule: async (moduleData) => {
    const response = await apiClient.post('/modules', moduleData);
    return response.data;
  },
  
  /**
   * Update a module (admin only)
   * 
   * @param {string} moduleId - Module ID
   * @param {Object} moduleData - Updated module data
   * @returns {Promise} Response with updated module data
   */
  updateModule: async (moduleId, moduleData) => {
    const response = await apiClient.put(`/modules/${moduleId}`, moduleData);
    return response.data;
  },
  
  /**
   * Delete a module (admin only)
   * 
   * @param {string} moduleId - Module ID
   * @returns {Promise} Response with deletion status
   */
  deleteModule: async (moduleId) => {
    const response = await apiClient.delete(`/modules/${moduleId}`);
    return response.data;
  }
};

export default ModuleService;
