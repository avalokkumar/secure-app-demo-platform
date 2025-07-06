import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import Register from '../Register';

// Mock navigate function
const mockNavigate = jest.fn();

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Navigate: () => <div data-testid="navigate-redirect" />
}));

describe('Register Component', () => {
  // Setup mock auth context
  const mockRegister = jest.fn();
  const defaultAuthContext = {
    register: mockRegister,
    isAuthenticated: false,
    isLoading: false
  };

  const renderWithContext = (contextValue = defaultAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={contextValue}>
          <Register />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    // Clear mock function calls between tests
    mockRegister.mockClear();
    mockNavigate.mockClear();
  });

  test('renders registration form correctly', () => {
    renderWithContext();
    
    // Check if form elements are rendered
    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
    expect(screen.getByText(/login here/i)).toBeInTheDocument();
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
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/please fill in all required fields/i)).toBeInTheDocument();
    });
    
    // Register function should not be called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('validates password length', async () => {
    renderWithContext();
    
    // Fill in the form with short password
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'short' } });
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Should show password validation error
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });
    
    // Register function should not be called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('validates password match', async () => {
    renderWithContext();
    
    // Fill in the form with mismatching passwords
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password456' } });
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Should show password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
    
    // Register function should not be called
    expect(mockRegister).not.toHaveBeenCalled();
  });

  test('handles successful registration', async () => {
    mockRegister.mockResolvedValueOnce({});
    
    renderWithContext();
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Register function should be called with correct arguments
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        firstName: 'Test',
        lastName: 'User',
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });
    
    // Loading state should be applied to button
    expect(screen.getByText(/registering.../i)).toBeInTheDocument();
    
    // No error message should be displayed
    expect(screen.queryByText(/registration failed/i)).not.toBeInTheDocument();
  });

  test('handles registration failure', async () => {
    // Set up the mock to reject with an error
    const errorMessage = 'Username already in use';
    mockRegister.mockRejectedValueOnce({ 
      response: { data: { message: errorMessage } } 
    });
    
    renderWithContext();
    
    // Fill in the form with valid data
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });
    
    // Submit the form
    const registerButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(registerButton);
    
    // Error message should be displayed
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
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
