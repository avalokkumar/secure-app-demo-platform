/**
 * Service for interacting with the SQL Injection module API endpoints
 */
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const MODULE_URL = `${API_URL}/modules/sql-injection`;

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

/**
 * Get SQL Injection module information
 * @returns {Promise<Object>} Module information
 */
const getModuleInfo = async () => {
  try {
    const response = await apiClient.get(`/modules/sql-injection/info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching SQL injection module info:', error);
    throw error;
  }
};

/**
 * Initialize the SQL Injection demo database
 * @returns {Promise<Object>} Setup result
 */
const setupDatabase = async () => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/setup`, {});
    return response.data;
  } catch (error) {
    console.error('Error setting up SQL injection demo database:', error);
    throw error;
  }
};

/**
 * Attempt login with potentially vulnerable SQL injection
 * @param {string} username - Username to test
 * @param {string} password - Password to test
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Login result with vulnerability demonstration
 */
const attemptLogin = async (username, password, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/login`, {
      username,
      password,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in SQL injection login demo:', error);
    throw error;
  }
};

/**
 * Search user data with potentially vulnerable SQL injection
 * @param {string} query - Search query
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Search results with vulnerability demonstration
 */
const searchUsers = async (query, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/search`, {
      query,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in SQL injection search demo:', error);
    throw error;
  }
};

/**
 * Update user profile with potentially vulnerable SQL injection
 * @param {number} userId - User ID
 * @param {Object} profileData - Profile data to update
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Update result with vulnerability demonstration
 */
const updateProfile = async (userId, profileData, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/profile`, {
      userId,
      profileData,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in SQL injection profile update demo:', error);
    throw error;
  }
};

/**
 * Execute dynamic query with potentially vulnerable SQL injection
 * @param {string} table - Table name
 * @param {string} column - Column name
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Query result with vulnerability demonstration
 */
const dynamicQuery = async (table, column, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/dynamic`, {
      table,
      column,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in SQL injection dynamic query demo:', error);
    throw error;
  }
};

/**
 * Execute blind SQL injection test
 * @param {string} query - Blind SQL injection test query
 * @param {string} type - Implementation type ('vulnerable' or 'secure')
 * @returns {Promise<Object>} Test result with vulnerability demonstration
 */
const blindTest = async (query, type = 'vulnerable') => {
  try {
    const response = await apiClient.post(`/modules/sql-injection/blind`, {
      query,
      type
    });
    return response.data;
  } catch (error) {
    console.error('Error in blind SQL injection demo:', error);
    throw error;
  }
};

const SQLInjectionService = {
  getModuleInfo,
  setupDatabase,
  attemptLogin,
  searchUsers,
  updateProfile,
  dynamicQuery,
  blindTest
};

export default SQLInjectionService;
