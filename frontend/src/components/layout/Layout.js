import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { Container, Navbar, Nav, NavDropdown, Button } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import '../../styles/theme.css';

const Layout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  
  // Initialize theme state from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setDarkMode(savedTheme === 'dark');
  }, []);

  const handleLogout = async () => {
    await logout();
  };
  
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    const newTheme = newDarkMode ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <>
      <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" className="mb-4 navbar-themed">
        <Container>
          <Navbar.Brand onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            SADP
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link onClick={() => navigate('/')}>Dashboard</Nav.Link>
              <Nav.Link onClick={() => navigate('/modules')}>Modules</Nav.Link>
              <Nav.Link onClick={() => navigate('/tools/security')}>
                <i className="bi bi-tools me-1"></i>
                Security Tools
              </Nav.Link>
              <Nav.Link onClick={() => navigate('/achievements')}>
                <i className="bi bi-award me-1"></i>
                Achievements
              </Nav.Link>
            </Nav>
            <Nav>
              <Button 
                variant={darkMode ? "outline-light" : "outline-dark"} 
                size="sm" 
                className="me-3 theme-toggle-nav" 
                onClick={toggleTheme}
              >
                {darkMode ? '☀️' : '🌙'}
              </Button>

              {currentUser && (
                <NavDropdown 
                  title={currentUser.username || 'User'}
                  id="user-dropdown"
                  align="end"
                >
                  {currentUser.role === 'admin' && (
                    <NavDropdown.Item onClick={() => navigate('/admin')}>
                      Admin Panel
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Item onClick={() => navigate('/profile')}>
                    Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="pb-5">
        <Outlet />
      </Container>
      
      <footer className="bg-light py-3 mt-5">
        <Container>
          <div className="text-center">
            <p className="text-muted mb-0">
              &copy; {new Date().getFullYear()} Secure Application Demo Platform (SADP)
            </p>
            <p className="text-muted small mb-0">
              For educational purposes only. Do not use vulnerable code in production.
            </p>
            <div className="mt-2">
              <Link to="/api/docs" className="text-primary small">API Reference</Link>
            </div>
          </div>
        </Container>
      </footer>
    </>
  );
};

export default Layout;
