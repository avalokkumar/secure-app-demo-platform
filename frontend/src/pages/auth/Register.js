import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import "../../styles/auth.css";
import "../../styles/theme.css";
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  
  // Set theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);
  
  // Redirect if already logged in
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Clear previous errors
    setError('');
    setIsLoading(true);
    
    try {
      // Format data to match backend expectations (first_name, last_name)
      const formattedData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName
      };
      
      console.log('Submitting registration data:', formattedData);
      const result = await register(formattedData);
      console.log('Registration successful:', result);
      // No need to navigate here as it's handled in AuthContext
    } catch (err) {
      console.error('Registration error in component:', err);
      let errorMessage = 'Registration failed. Please try again.';
      
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
            <p className="mb-3">Join our platform to learn secure coding practices</p>
          </div>
        </div>
        <div className="auth-form-container">
          <h3 className="mb-4 text-center fw-bold auth-title">Create an Account</h3>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="firstName">First Name</Form.Label>
                  <Form.Control
                    id="firstName"
                    type="text"
                    placeholder="Enter first name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label htmlFor="lastName">Last Name</Form.Label>
                  <Form.Control
                    id="lastName"
                    type="text"
                    placeholder="Enter last name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="username">Username</Form.Label>
              <Form.Control
                id="username"
                type="text"
                placeholder="Enter username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="email">Email</Form.Label>
              <Form.Control
                id="email"
                type="email"
                placeholder="Enter email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label htmlFor="password">Password</Form.Label>
              <Form.Control
                id="password"
                type="password"
                placeholder="Enter password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {formData.password && formData.password.length < 8 && (
                <Form.Text className="text-danger">
                  Password must be at least 8 characters long.
                </Form.Text>
              )}
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label htmlFor="confirmPassword">Confirm Password</Form.Label>
              <Form.Control
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {formData.password && formData.confirmPassword && 
                formData.password !== formData.confirmPassword && (
                <Form.Text className="text-danger">
                  Passwords do not match.
                </Form.Text>
              )}
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3 auth-button"
              disabled={isLoading}
            >
              {isLoading ? 'Registering...' : 'Register'}
            </Button>
            
            <div className="text-center">
              <small>
                Already have an account? <Link to="/login">Login here</Link>
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

export default Register;
