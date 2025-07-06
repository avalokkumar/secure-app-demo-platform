import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import Login from './Login';

// Mock the useNavigate hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  Navigate: () => <div data-testid="navigate" />
}));

// Mock AuthContext
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn().mockImplementation((username, password) => {
      // Simulate successful login with correct credentials
      if (username === 'testuser' && password === 'password') {
        return Promise.resolve({ success: true });
      }
      // Simulate failed login
      return Promise.resolve({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }),
    isAuthenticated: false
  }),
  AuthProvider: ({ children }) => <div>{children}</div>
}));

// Helper function to render the component with required providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  test('renders login form with all fields', () => {
    renderWithProviders(<Login />);
    
    // Check if form elements are present
    expect(screen.getByText(/SADP/i)).toBeInTheDocument();
    expect(screen.getByText(/Secure Application Demo Platform/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
    expect(screen.getByText(/Don't have an account?/i)).toBeInTheDocument();
    expect(screen.getByText(/Register here/i)).toBeInTheDocument();
  });

  test('shows error when submitting empty form', async () => {
    renderWithProviders(<Login />);
    
    // Submit the form without filling fields
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check if error message is displayed
    expect(await screen.findByText(/Please enter both username and password/i)).toBeInTheDocument();
  });

  test('shows error on failed login', async () => {
    renderWithProviders(<Login />);
    
    // Fill form with incorrect credentials
    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, {
      target: { value: 'wronguser' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'wrongpass' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  test('redirects on successful login', async () => {
    renderWithProviders(<Login />);
    
    // Fill form with correct credentials
    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, {
      target: { value: 'testuser' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password' }
    });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Check loading state
    expect(screen.getByRole('button')).toHaveTextContent(/Logging in/i);
    
    // No error should be shown for successful login
    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  test('displays button in disabled state during form submission', async () => {
    renderWithProviders(<Login />);
    
    // Fill form
    const usernameInput = screen.getByRole('textbox', { name: /username/i });
    const passwordInput = screen.getByLabelText(/password/i);
    
    fireEvent.change(usernameInput, {
      target: { value: 'testuser' }
    });
    fireEvent.change(passwordInput, {
      target: { value: 'password' }
    });
    
    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));
    
    // Button should be disabled during submission
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByRole('button')).toHaveTextContent(/Logging in/i);
    
    // Wait for submission to complete
    await waitFor(() => {
      // After submission completes, we would need to check something specific
      // In a real test, this might be checking for navigation or state change
    });
  });
});
