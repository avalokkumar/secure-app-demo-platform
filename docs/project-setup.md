# Project Setup Guide for SADP

This document provides detailed instructions for setting up the Secure Application Demo Platform (SADP) project.

## Repository Structure

The SADP project is organized into the following main directories:

```
sadp/
├── backend/         # Flask application backend
│   ├── api/         # API endpoints
│   ├── models/      # Database models
│   ├── services/    # Business logic
│   ├── utils/       # Utility functions
│   └── modules/     # Vulnerability demonstration modules
├── frontend/        # React application frontend
│   ├── public/      # Static assets
│   └── src/         # React source code
├── database/        # Database scripts and migrations
├── docker/          # Docker configuration files
│   ├── backend/     # Backend service configuration
│   ├── frontend/    # Frontend service configuration
│   └── database/    # Database service configuration  
└── docs/            # Documentation
    ├── architecture/    # Architecture documentation
    ├── coding-standards/ # Coding standards
    ├── modules/     # Module-specific documentation
    └── ui-components/ # UI component documentation
```

## Initial Setup

### Prerequisites

Before setting up the project, ensure you have the following installed:
- Git
- Docker and Docker Compose
- Python 3.8 or higher (for local development)
- Node.js 14 or higher (for local development)

### Clone the Repository

```bash
git clone https://github.com/yourusername/sadp.git
cd sadp
```

### Environment Configuration

1. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to set appropriate values for your environment.

## Development Setup

### Using Docker (Recommended)

Using Docker ensures consistent development environments and isolates the vulnerable components.

1. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

2. The services will be available at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - Database: localhost:5432 

3. To stop the containers:
   ```bash
   docker-compose down
   ```

### Local Development (Alternative)

#### Backend Setup

1. Create a Python virtual environment:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   ```

4. Run the development server:
   ```bash
   flask run
   ```

#### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

## Code Standards and Guidelines

Please refer to our coding standards documentation:
- [Python Coding Standards](docs/coding-standards/python.md)
- [JavaScript/React Coding Standards](docs/coding-standards/javascript.md)
- [SQL Coding Standards](docs/coding-standards/sql.md)

## Git Workflow

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make changes and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. Push changes to the remote repository:
   ```bash
   git push origin feature/your-feature-name
   ```

4. Create a pull request on GitHub for review.

## Security Considerations

Remember that this project contains intentionally vulnerable code for educational purposes. Always follow these guidelines:

1. Never deploy vulnerable components to production environments
2. Always run the application in isolated environments
3. Be cautious when implementing new vulnerability demonstrations
4. Clearly document all vulnerable code with appropriate warnings

## Next Steps

After completing the initial setup, refer to [docs/dev-environment.md](docs/dev-environment.md) for more detailed information about the development environment configuration.
