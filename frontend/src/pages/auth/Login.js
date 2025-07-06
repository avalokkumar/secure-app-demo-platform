import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import "../../styles/auth.css";
import "../../styles/theme.css";
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  
  // Set theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    // Clear previous errors
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(username, password);
      console.log('Login successful:', result);
      // No need to navigate here as it's handled in AuthContext
    } catch (err) {
      console.error('Login error in component:', err);
      let errorMessage = 'Login failed. Please try again.';
      
      // Extract error message from different possible error structures
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (typeof err === 'object' && err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  return (
    <Container fluid className="auth-container p-0">
      <Card className="shadow auth-card">
        <div className="auth-header">
          <h2 className="fw-bold">SADP</h2>
          <p className="mb-4">Secure Application Demo Platform</p>
          <div className="mt-3">
            <p className="mb-3">The platform for learning secure coding practices</p>
          </div>
        </div>
        <div className="auth-form-container">
          <h3 className="mb-4 text-center fw-bold auth-title">Welcome Back</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3 auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            
            <div className="text-center" style={{ color: 'var(--text-primary)' }}>
              <small>
                Don't have an account? <Link to="/register">Register here</Link>
              </small>
            </div>
          </Form>
        </div>
      </Card>
      
      <button className="theme-toggle" onClick={toggleTheme}>
        <span>🌓</span>
      </button>
    </Container>
  );
};

export default Login;
