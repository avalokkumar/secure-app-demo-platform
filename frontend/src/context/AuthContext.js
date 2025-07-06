import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import AuthService from '../services/AuthService';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook for using the Auth Context
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkAuthentication = () => {
      // Get token from local storage
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Decode the token to check expiration
        const decodedToken = jwt_decode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          // Token expired, try to refresh
          refreshAccessToken(refreshToken);
        } else {
          // Token still valid
          const storedUser = JSON.parse(localStorage.getItem('user'));
          setCurrentUser(storedUser);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        setIsLoading(false);
      }
    };

    checkAuthentication();
  }, []);

  // Function to refresh the access token
  const refreshAccessToken = async (refreshToken) => {
    try {
      const response = await AuthService.refreshToken(refreshToken);
      
      // Store new access token
      localStorage.setItem('accessToken', response.access_token);
      
      // Get user data from stored user
      const storedUser = JSON.parse(localStorage.getItem('user'));
      setCurrentUser(storedUser);
      setIsAuthenticated(true);
    } catch (error) {
      // Failed to refresh token, log user out
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const handleLogin = async (username, password) => {
    try {
      const response = await AuthService.login(username, password);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      navigate('/');
      return response;
    } catch (error) {
      console.error('Login error:', error);
      // Re-throw the error to be caught by the Login component
      throw error;
    }
  };

  // Register function
  const handleRegister = async (userData) => {
    try {
      const response = await AuthService.register(userData);
      
      // Store tokens and user data
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('refreshToken', response.refresh_token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setCurrentUser(response.user);
      setIsAuthenticated(true);
      
      // Redirect to dashboard
      navigate('/');
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      // Re-throw the error to be caught by the Register component
      throw error;
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      // Call logout API
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        await AuthService.logout(accessToken);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setCurrentUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
