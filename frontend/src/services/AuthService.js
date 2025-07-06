import axios from 'axios';
import { mockUsers, mockDelay, isBackendAvailable } from './mockData';

// Create an axios instance with default config
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Create axios instance for auth requests
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authorization header to requests when token is available
authAxios.interceptors.request.use(
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
authAxios.interceptors.response.use(
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

const AuthService = {
  /**
   * Log in a user with username and password
   * 
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise} Response with user data and tokens
   */
  login: async (username, password) => {
    try {
      console.log('Attempting to login with backend API');
      const response = await authAxios.post('/auth/login', {
        username,
        password
      });
      console.log('Login successful with backend API');
      return response.data;
    } catch (error) {
      console.error('Login error in AuthService:', error);
      
      // If we got a response from the server with an error
      if (error.response) {
        throw error; // Keep the original error structure
      } 
      
      // For network errors or other issues
      throw { 
        response: { 
          data: { 
            message: error.message || 'Login failed. Please check your connection and try again.'
          }, 
          status: error.status || 500 
        } 
      };
    }
  },
  
  /**
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise} Response with user data and tokens
   */
  register: async (userData) => {
    try {
      console.log('Attempting to register with backend API', userData);
      const response = await authAxios.post('/auth/register', userData);
      console.log('Registration successful with backend API');
      return response.data;
    } catch (error) {
      console.error('Registration error in AuthService:', error);
      
      // If we got a response from the server with an error
      if (error.response) {
        throw error; // Keep the original error structure
      } 
      
      // For network errors or other issues
      throw { 
        response: { 
          data: { 
            message: error.message || 'Registration failed. Please check your connection and try again.'
          }, 
          status: error.status || 500 
        } 
      };
    }
  },
  
  /**
   * Log out a user
   * 
   * @returns {Promise} Response with logout status
   */
  logout: async () => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await authAxios.post('/auth/logout');
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      return { message: 'Successfully logged out' };
    }
  },
  
  /**
   * Refresh the access token using refresh token
   * 
   * @param {string} refreshToken - The refresh token
   * @returns {Promise} Response with new access token
   */
  refreshToken: async (refreshToken) => {
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await axios.post(`${API_URL}/auth/refresh`, {}, {
        headers: {
          'Authorization': `Bearer ${refreshToken}`
        }
      });
      return response.data;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Simply generate a new mock token
      return {
        access_token: 'mock-access-token-' + Math.random().toString(36).substr(2, 10)
      };
    }
  },
  
  /**
   * Get current user data
   * 
   * @returns {Promise} Response with user data
   */
  getCurrentUser: async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return null;
    
    // Check if backend is available
    if (await isBackendAvailable()) {
      const response = await authAxios.get(`/users/${user.id}`);
      return response.data.user;
    } else {
      // Use mock data when backend is unavailable
      await mockDelay();  // Simulate network delay
      
      // Find user in mock data or return the stored user
      const mockUser = Object.values(mockUsers).find(u => u.id === user.id || u.username === user.username);
      return mockUser || user;
    }
  }
};

export default AuthService;
