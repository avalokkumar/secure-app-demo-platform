/**
 * Service for interacting with the Cross-Site Scripting (XSS) module API endpoints
 */
import axios from 'axios';

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
        
        // Store new token
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
 * Get XSS module information
 * @returns {Promise<Object>} Module information
 */
const getModuleInfo = async () => {
  try {
    const response = await apiClient.get(`/modules/xss/info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching XSS module info:', error);
    throw error;
  }
};

/**
 * Setup XSS demo environment
 * @returns {Promise<Object>} Setup result
 */
const setupEnvironment = async () => {
  try {
    const response = await apiClient.post(`/modules/xss/setup`, {});
    return response.data;
  } catch (error) {
    console.error('Error setting up XSS demo environment:', error);
    throw error;
  }
};

/**
 * Post a comment with potentially vulnerable XSS content
 * @param {string} content - Comment content to test
 * @param {string} name - Commenter name
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Post result with vulnerability demonstration
 */
const postComment = async (content, name, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/xss/reflected`, {
      content,
      name,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in XSS comment demo:', error);
    throw error;
  }
};

/**
 * Store user input with potentially vulnerable XSS content
 * @param {string} content - Content to store
 * @param {string} title - Title for the content
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Store result with vulnerability demonstration
 */
const storeContent = async (content, title, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/xss/stored`, {
      content,
      title,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in XSS stored content demo:', error);
    throw error;
  }
};

/**
 * Get previously stored content that may contain XSS
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Stored content with potential XSS
 */
const getStoredContent = async (type = 'vulnerable') => {
  try {
    const response = await apiClient.get(`/modules/xss/stored?type=${type}`);
    return response.data;
  } catch (error) {
    console.error('Error getting stored XSS content:', error);
    throw error;
  }
};

/**
 * Test DOM-based XSS vulnerability
 * @param {string} input - User input to test for DOM-based XSS
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Test result with vulnerability demonstration
 */
const testDOMBasedXSS = async (input, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/xss/dom-based`, {
      input,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in DOM-based XSS test:', error);
    throw error;
  }
};

const XSSService = {
  getModuleInfo,
  setupEnvironment,
  postComment,
  storeContent,
  getStoredContent,
  testDOMBasedXSS
};

export default XSSService;
