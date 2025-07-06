# SADP Documentation

Welcome to the Secure Application Demo Platform (SADP) documentation. This guide provides comprehensive information about both frontend and backend components of the platform.

## Getting Started

The Secure Application Demo Platform (SADP) is designed to demonstrate secure coding practices and common web application vulnerabilities. It consists of:

1. A React frontend application providing user interface for learning and testing
2. A Flask backend API providing authentication, content management, and vulnerability demonstrations

## Documentation Overview

### API Reference

- [API Reference](api-reference.md) - Comprehensive reference for all backend API endpoints

### Usage Guides

- [Frontend Usage](frontend-usage.md) - Guide for using and extending the frontend application
- [Backend Usage](backend-usage.md) - Guide for setting up and extending the backend application

### API Explorer

The backend includes an interactive API testing interface available at:
```
http://localhost:5001/api/docs
```

This Swagger UI-based explorer lets you:
- Browse available API endpoints
- View request/response formats
- Test API calls directly from your browser

## System Requirements

### Frontend
- Node.js 14+
- npm or yarn

### Backend
- Python 3.8+
- MySQL or PostgreSQL database
- Virtual environment (recommended)

## Quick Start

1. **Start Backend**
   ```bash
   cd backend
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   python -m flask run --port=5001
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   PORT=3001 npm start
   ```

3. **Access Applications**
   - Frontend: `http://localhost:3001`
   - Backend API: `http://localhost:5001/api`
   - API Documentation: `http://localhost:5001/api/docs`

## Authentication

The system includes several pre-configured test users:

| Username  | Password     | Role       |
|-----------|-------------|------------|
| admin     | admin123    | admin      |
| instructor| instructor123 | instructor |
| student   | student123  | student    |
| tester    | tester123   | tester     |
