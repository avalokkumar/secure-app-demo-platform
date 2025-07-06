# Secure Application Demo Platform (SADP)

![SADP Logo](docs/images/logo.png)

## Introduction

The Secure Application Demo Platform (SADP) is an interactive, web-based learning environment designed to illustrate common security vulnerabilities in web applications and demonstrate their remediation techniques. This platform serves as an educational tool for developers, security professionals, and students, providing practical understanding of security flaws and hands-on experience implementing robust security practices.

## Key Features

### 1. Interactive Vulnerability Modules

SADP features comprehensive modules covering OWASP Top 10 vulnerabilities including:

- **SQL Injection (SQLi)**
  - Login bypass demonstrations
  - Union-based attacks
  - Blind SQLi techniques
  - Second-order injection scenarios
  - Dynamic query vulnerabilities
  - Parameterized queries as secure alternatives

- **Cross-Site Scripting (XSS)**
  - Reflected XSS demonstrations
  - Stored XSS scenarios
  - DOM-based XSS examples
  - Content Security Policy implementations
  - Output encoding techniques

- **Cross-Site Request Forgery (CSRF)**
  - Form submission attacks
  - Token-based protection mechanisms
  - SameSite cookie attributes
  - CSRF token implementation

- **Broken Access Control**
  - Horizontal privilege escalation
  - Vertical privilege escalation
  - RBAC implementation examples
  - Proper authorization checks

- **Advanced Topics**
  - Buffer Overflow fundamentals
  - Remote Code Execution prevention
  - HTTP Header Security

### 2. Learning Experience Features

- **Dual-View Interface**: Side-by-side comparison of vulnerable and secure code implementations
- **Guided Learning Path**: Progressive difficulty from beginner to advanced topics
- **Interactive Exercises**: Hands-on challenges to apply security knowledge
- **Comprehensive Documentation**: Detailed explanations for each vulnerability and mitigation technique
- **Progress Tracking**: User achievement system to monitor learning progress

### 3. Technical Components

- **User Authentication**: Secure login/registration with role-based permissions
- **Lesson Management**: Structured content delivery with markdown support
- **Exercise Evaluation**: Automated assessment of security exercise solutions
- **Sandboxed Environment**: Isolated execution environment for testing exploits safely
- **API Documentation**: Swagger UI integration for API exploration

## Architecture

SADP employs a modern three-tier architecture designed for security education:

- **Frontend**: React.js application with React Router, Bootstrap, and custom components
- **Backend**: Python Flask REST API with SQLAlchemy ORM
- **Database**: MySQL database for persistent storage
- **Security**: JWT authentication, input validation, CORS protection

### Technology Stack

- **Frontend**: React 18, Bootstrap 5, React-Markdown, React Router 6
- **Backend**: Flask 2.2, SQLAlchemy, Flask-JWT-Extended, Flask-Cors
- **Database**: MySQL 8.0 (MariaDB compatible)
- **Development**: Docker, Git, pytest

## Installation

### Prerequisites

- Docker and Docker Compose
- Git
- Node.js 16+ and npm (for local development)
- Python 3.8+ and pip (for local development)

### Docker Setup (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sadp.git
   cd sadp
   ```

2. Create environment configuration:
   ```bash
   cp .env.example .env
   ```

3. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application at `http://localhost:3000`

### Local Development Setup

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Project Structure

```
sadp/
├── backend/               # Flask API server
│   ├── api/               # API endpoints
│   ├── models/            # Database models
│   ├── modules/           # Vulnerability modules
│   │   ├── sql_injection/ # SQL injection examples
│   │   ├── xss/           # XSS examples
│   │   └── csrf/          # CSRF examples
│   ├── scripts/           # Utility scripts
│   └── tests/             # Backend tests
├── database/              # Database scripts
│   └── mysql/             # MySQL schema and seed data
├── docs/                  # Documentation
├── frontend/              # React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
├── sandbox/               # Isolated execution environment
└── docker/                # Docker configuration
```

## Usage Guide

1. **Register an Account**: Create a user account to track your progress
2. **Browse Modules**: Explore available security vulnerability modules
3. **Read Lessons**: Study the theory behind each vulnerability
4. **Try Demonstrations**: Interact with vulnerable and secure code examples
5. **Complete Exercises**: Apply your knowledge with hands-on challenges
6. **Track Progress**: Monitor your learning journey with achievements

## Development and Contribution

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

Please read our [Contributing Guidelines](docs/contributing.md) before submitting pull requests.

## Security Notice

⚠️ **WARNING**: This platform intentionally contains vulnerable code examples for educational purposes. Always run this application in a secure, isolated environment. Never deploy the vulnerable components to production environments or expose them to the public internet.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- OWASP for security best practices and vulnerability information
- The security research community for continuously advancing web security knowledge
