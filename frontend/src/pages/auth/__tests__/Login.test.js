import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Login from '../Login';

// Mock navigate function
const mockNavigate = jest.fn();

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: () => <div data-testid="navigate-redirect" />
}));

describe('Login Component', () => {
  // Setup mock auth context
  const mockLogin = jest.fn();
  const defaultAuthContext = {
    login: mockLogin,
    isAuthenticated: false,
    isLoading: false
  };

  const renderWithContext = (contextValue = defaultAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <Login />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Clear mock function calls between tests
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  test('renders login form correctly', () => {
    renderWithContext();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });

  test('redirects to dashboard if already authenticated', () => {
    renderWithContext({
      ...defaultAuthContext,
      isAuthenticated: true
    });
    
    // Should render the Navigate component for redirection
    expect(screen.getByTestId('navigate-redirect')).toBeInTheDocument();
  });

  test('validates form inputs before submission', async () => {
    renderWithContext();
    
    // Try to submit the form without any input
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please enter both username and password/i)).toBeInTheDocument();
    });
    
    // Login function should not be called
    expect(mockLogin).not.toHaveBeenCalled();
  });

  test('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce({});
    
    renderWithContext();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Login function should be called with correct arguments
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
    
    // Loading state should be applied to button
    expect(screen.getByText(/logging in.../i)).toBeInTheDocument();
    
    // No error message should be displayed
    expect(screen.queryByText(/login failed/i)).not.toBeInTheDocument();
  });

  test('handles login failure', async () => {
    // Set up the mock to reject with an error
    const errorMessage = 'Invalid credentials';
    mockLogin.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    renderWithContext();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrongpassword' } });
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('handles generic login error', async () => {
    // Set up the mock to reject with a network error 
    mockLogin.mockRejectedValueOnce(new Error());
    
    renderWithContext();
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    
    // Submit the form
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    // Generic error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(/login failed. please try again./i)).toBeInTheDocument();
    });
  });

  test('toggles theme correctly', () => {
    // Mock localStorage
    const mockLocalStorage = {};
    const localStorageMock = {
      getItem: jest.fn(key => mockLocalStorage[key] || 'light'),
      setItem: jest.fn((key, value) => { mockLocalStorage[key] = value }),
    };
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Mock document methods
    document.documentElement.setAttribute = jest.fn();
    document.documentElement.getAttribute = jest.fn().mockReturnValue('light');
    
    renderWithContext();
    
    // Click the theme toggle button
    fireEvent.click(screen.getByRole('button', { name: /🌓/i }));
    
    // Check if theme was toggled correctly
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
  });
});
