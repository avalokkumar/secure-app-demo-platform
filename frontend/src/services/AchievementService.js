import axios from 'axios';
import { mockDelay } from './mockData';

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

// Mock achievements data (used when backend is unavailable)
const mockAchievements = [
  {
    id: 'ach-001',
    user_id: 'user-001',
    achievement_type: 'module_completed',
    entity_type: 'module',
    entity_id: 'mod-001',
    granted_at: '2025-06-28T14:30:00Z'
  },
  {
    id: 'ach-002',
    user_id: 'user-001',
    achievement_type: 'lesson_completed',
    entity_type: 'lesson',
    entity_id: 'les-001',
    granted_at: '2025-06-27T10:15:00Z'
  }
];

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

const AchievementService = {
  /**
   * Get all achievements for a user
   * 
   * @param {string} userId - User ID
   * @returns {Promise} Response with achievements data
   */
  getUserAchievements: async (userId) => {
    try {
      console.log(`Fetching achievements for user: ${userId}`);
      const response = await apiClient.get(`/achievements/user/${userId}`);
      console.log('User achievements received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for user achievements');
        await mockDelay();
        return { achievements: mockAchievements };
      }
      
      throw error;
    }
  },
  
  /**
   * Grant a new achievement to the current user
   * 
   * @param {Object} achievementData - Achievement data
   * @param {string} achievementData.achievement_type - Type of achievement (e.g., 'module_completed')
   * @param {string} achievementData.entity_type - Type of entity (e.g., 'module')
   * @param {string} achievementData.entity_id - ID of the entity
   * @returns {Promise} Response with granted achievement
   */
  grantAchievement: async (achievementData) => {
    try {
      console.log('Granting achievement:', achievementData);
      const response = await apiClient.post('/achievements/grant', achievementData);
      console.log('Achievement granted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error granting achievement:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for achievement granting');
        await mockDelay();
        
        // Create a mock achievement
        const newAchievement = {
          id: 'ach-' + Math.random().toString(36).substr(2, 9),
          user_id: 'current-user',
          achievement_type: achievementData.achievement_type,
          entity_type: achievementData.entity_type,
          entity_id: achievementData.entity_id,
          granted_at: new Date().toISOString()
        };
        
        mockAchievements.push(newAchievement);
        
        return { 
          message: 'Achievement granted successfully',
          achievement: newAchievement
        };
      }
      
      throw error;
    }
  },
  
  /**
   * Get all modules accessible to a user
   * 
   * @param {string} userId - User ID (optional, defaults to current user)
   * @returns {Promise} Response with accessible modules
   */
  getAccessibleModules: async (userId) => {
    try {
      console.log('Fetching accessible modules');
      const endpoint = userId ? `/module-access/user/${userId}` : '/module-access';
      const response = await apiClient.get(endpoint);
      console.log('Accessible modules received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching accessible modules:', error);
      
      // If the backend is unavailable, use mock data
      if (!error.response) {
        console.log('Using mock data for accessible modules');
        await mockDelay();
        
        // Return mock modules (first 2 modules are accessible)
        return { 
          modules: [
            {
              id: 'mod-001',
              name: 'Introduction to Web Security',
              slug: 'intro-web-security',
              description: 'Learn the basics of web security and common vulnerabilities',
              difficulty: 'beginner',
              order_index: 0,
              is_active: true,
              access_granted_at: null // Always accessible (intro module)
            },
            {
              id: 'mod-002',
              name: 'SQL Injection',
              slug: 'sql-injection',
              description: 'Understanding and preventing SQL injection attacks',
              difficulty: 'intermediate',
              order_index: 1,
              is_active: true,
              access_granted_at: '2025-06-25T08:00:00Z'
            }
          ]
        };
      }
      
      throw error;
    }
  }
};

export default AchievementService;
