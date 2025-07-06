# SADP Frontend Usage Guide

This document provides comprehensive documentation for the Secure Application Demo Platform (SADP) frontend application, including setup instructions, available features, component structure, and usage examples.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Authentication](#authentication)
4. [Key Components](#key-components)
5. [Vulnerability Demonstration Modules](#vulnerability-demonstration-modules)
6. [Theming and Styling](#theming-and-styling)
7. [API Integration](#api-integration)
8. [Troubleshooting](#troubleshooting)

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd /path/to/sadp/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the backend API URL:
   The frontend is pre-configured to connect to a backend at `http://localhost:5001/api`.
   If your backend is running on a different port or host, update the `proxy` setting in `package.json` and the API URLs in the service files.

4. Start the development server:
   ```bash
   npm start
   ```
   
   The application will be available at `http://localhost:3001`.

## Project Structure

```
frontend/
├── public/             # Static assets
├── src/                # Source code
│   ├── assets/         # Images, fonts, etc.
│   ├── components/     # Reusable React components
│   │   ├── common/     # Shared UI components
│   │   ├── dashboard/  # Dashboard components
│   │   ├── layout/     # Layout components
│   │   └── modules/    # Vulnerability module components
│   ├── context/        # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   │   ├── auth/       # Authentication pages
│   │   ├── dashboard/  # Dashboard pages
│   │   ├── lessons/    # Lesson pages
│   │   ├── modules/    # Module pages
│   │   └── tools/      # Security tools pages
│   ├── services/       # API service functions
│   ├── styles/         # CSS and styling files
│   ├── utils/          # Utility functions
│   ├── App.js          # Main application component
│   ├── index.js        # Application entry point
│   └── routes.js       # Application routes
└── package.json        # Project dependencies and scripts
```

## Authentication

### Login

The login functionality allows users to access protected parts of the application:

1. Navigate to `/login` or the root URL if not authenticated
2. Enter your username and password
3. Click the "Login" button

Authentication is implemented using JWT tokens:
- **Access Token**: Short-lived token used for API authentication
- **Refresh Token**: Long-lived token used to obtain new access tokens

### Registration

The registration functionality allows new users to create an account:

1. Navigate to `/register` or click "Register here" on the login page
2. Fill in the required fields:
   - Username
   - Email
   - Password (minimum 8 characters)
   - First Name
   - Last Name
3. Click the "Register" button

### Authentication Context

The application uses React Context API to manage authentication state. The `AuthContext` provides the following features:

- User authentication state management
- Login and logout functionality
- Token refresh handling
- Access to current user data

Usage example:

```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { isAuthenticated, currentUser, login, logout } = useAuth();
  
  // Use authentication functions and state
  return (
    <div>
      {isAuthenticated ? (
        <button onClick={logout}>Logout</button>
      ) : (
        <button onClick={() => login(username, password)}>Login</button>
      )}
    </div>
  );
}
```

## Key Components

### Dashboard

The dashboard provides an overview of the user's progress and available modules:

- **SecuritySkillsOverview**: Displays the user's progress across different security domains
- **ModuleGrid**: Shows available learning modules with difficulty levels
- **RecentActivity**: Displays the user's recent activity

### Navigation

- **Navbar**: Top navigation bar with links to main sections and user menu
- **Sidebar**: Collapsible sidebar with additional navigation options (desktop only)

### Security Modules

Each security vulnerability type has a dedicated module component:

- SQL Injection demonstration
- Cross-Site Scripting (XSS) demonstration
- Cross-Site Request Forgery (CSRF) demonstration
- HTTP Header analysis tool

## Vulnerability Demonstration Modules

### SQL Injection Module

The SQL Injection module demonstrates both vulnerable and secure approaches to database queries:

- **VulnerableQueryForm**: Demonstrates unsafe SQL query construction
- **SecureQueryForm**: Shows proper parameterized queries
- **QueryResultsViewer**: Displays the results of SQL queries

Usage example:

```jsx
import { SQLInjectionDemo } from '../components/modules/SQLInjectionDemo';

function SQLInjectionPage() {
  return <SQLInjectionDemo />;
}
```

### XSS Module

The XSS module demonstrates different types of cross-site scripting vulnerabilities:

- **ReflectedXSSDemo**: Shows reflected XSS vulnerabilities
- **StoredXSSDemo**: Demonstrates stored XSS issues
- **DOMBasedXSSDemo**: Explains DOM-based XSS
- **XSSPrevention**: Shows proper input sanitization techniques

### CSRF Module

The CSRF module demonstrates how cross-site request forgery attacks work:

- **VulnerableForm**: Shows a form without CSRF protection
- **SecureForm**: Implements proper CSRF tokens
- **CSRFAttackDemo**: Simulates a CSRF attack

### HTTP Header Analyzer

The HTTP Header Analyzer tool examines HTTP response headers for security issues:

- **HeaderAnalyzer**: Analyzes security headers in responses
- **HeaderSecurityScore**: Calculates a security score based on headers
- **RecommendationsPanel**: Provides recommendations for improving security headers

Usage:

```jsx
import { HeaderAnalyzer } from '../components/modules/HeaderAnalyzer';

function HeaderAnalyzerPage() {
  return <HeaderAnalyzer url="https://example.com" />;
}
```

## Theming and Styling

The application supports both light and dark themes, implemented using CSS variables:

- **Theme Switching**: Users can toggle between light and dark themes
- **CSS Variables**: Theme colors are defined as CSS variables
- **Responsive Design**: The UI adapts to different screen sizes

To switch themes programmatically:

```javascript
const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
};
```

## API Integration

The frontend communicates with the backend API using Axios. API service functions are organized in service modules:

- **AuthService**: Authentication API calls
- **ModuleService**: Module-related API calls
- **LessonService**: Lesson-related API calls
- **VulnerabilityService**: Vulnerability demonstration API calls
- **ProgressService**: User progress API calls

Example service usage:

```javascript
import AuthService from '../services/AuthService';

// Login
const handleLogin = async (username, password) => {
  try {
    const response = await AuthService.login(username, password);
    // Handle successful login
    return response;
  } catch (error) {
    // Handle error
    console.error(error);
  }
};
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**:
   - Verify that the backend server is running
   - Check that the API URL in frontend services matches the backend URL
   - Ensure CORS is properly configured on the backend

2. **Authentication Issues**:
   - Clear browser local storage to remove stale tokens
   - Check browser console for JWT-related errors
   - Verify that tokens are being sent in request headers

3. **Rendering Problems**:
   - Check browser console for React rendering errors
   - Verify that required data is available before rendering components
   - Check for null or undefined values in props

### Debugging Tools

1. **React Developer Tools**:
   - Inspect component hierarchy
   - View and modify component props and state
   - Monitor component re-renders

2. **Network Inspector**:
   - View API requests and responses
   - Check request headers for proper authentication
   - Inspect response status codes and data
