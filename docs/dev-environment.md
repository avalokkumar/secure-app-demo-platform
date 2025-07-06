# Development Environment Setup Guide

This guide provides detailed instructions for setting up and working with the SADP development environment.

## Docker-based Development Environment

The SADP project uses Docker and Docker Compose to create a consistent and isolated development environment. This approach offers several advantages:

- Consistent development environment across different machines
- Isolation of vulnerable components for security
- Easy setup and teardown of the complete application stack
- Simplified dependency management

### Prerequisites

Before you begin, ensure that you have the following installed:

- [Docker](https://docs.docker.com/get-docker/) (version 20.10 or higher)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 1.29 or higher)

### Environment Configuration

1. Create a `.env` file by copying the provided example:
   ```bash
   cp .env.example .env
   ```

2. Modify the values in the `.env` file as needed for your local environment. At minimum, you should change the security-sensitive values like `SECRET_KEY` and `JWT_SECRET_KEY`.

### Starting the Development Environment

1. Build and start all services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

   This will:
   - Build the Docker images if they don't exist
   - Start containers for the frontend, backend, database, and sandbox services
   - Create the necessary networks and volumes

2. Verify that all services are running:
   ```bash
   docker-compose ps
   ```

   All services should show a status of "Up".

### Accessing the Application

Once the environment is running, you can access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL running on `localhost:5432`
  - Username: `sadp_user` (or as set in your `.env` file)
  - Password: `sadp_password` (or as set in your `.env` file)
  - Database: `sadp` (or as set in your `.env` file)

### Working with the Services

#### Viewing Logs

To view the logs of a specific service:
```bash
docker-compose logs -f [service_name]
```

Where `[service_name]` can be `frontend`, `backend`, `db`, or `sandbox`.

#### Restarting Services

After making changes to the code, you may need to restart services:
```bash
docker-compose restart [service_name]
```

#### Executing Commands Inside Containers

To run commands inside a service container:
```bash
docker-compose exec [service_name] [command]
```

Examples:
- Run Flask database migrations:
  ```bash
  docker-compose exec backend flask db upgrade
  ```
- Open a shell in the frontend container:
  ```bash
  docker-compose exec frontend sh
  ```
- Access the PostgreSQL database:
  ```bash
  docker-compose exec db psql -U sadp_user -d sadp
  ```

### Sandbox Environment

The sandbox service is specifically designed for safely executing potentially malicious or vulnerable code. It runs in an isolated network and has restricted capabilities. When adding or modifying vulnerable code demonstrations, always use the sandbox environment to prevent security risks.

#### Sandbox Security Features

- Restricted network access (internal network only)
- Limited system capabilities
- Memory and CPU usage limits
- Execution time limits
- Non-root user execution
- Read-only filesystem for core components

### Stopping the Development Environment

To stop all services:
```bash
docker-compose down
```

To stop all services and remove volumes (this will delete the database data):
```bash
docker-compose down -v
```

## Local Development (Alternative)

While Docker is the recommended development approach, you can also set up a local development environment for individual components.

### Backend Local Setup

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

3. Set environment variables:
   ```bash
   export FLASK_APP=app.py
   export FLASK_ENV=development
   export DATABASE_URL=postgresql://localhost:5432/sadp  # Adjust as needed
   ```

4. Run the development server:
   ```bash
   flask run
   ```

### Frontend Local Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Create a `.env.local` file with the API URL:
   ```
   REACT_APP_API_URL=http://localhost:5000
   ```

3. Start the development server:
   ```bash
   npm start
   ```

## Troubleshooting

### Common Issues

1. **Port conflicts**: If you have other applications using ports 3000, 5000, or 5432, you'll need to modify the port mappings in the `docker-compose.yml` file.

2. **Database connection errors**: Ensure that the database credentials in your `.env` file match what's in the `docker-compose.yml` file.

3. **Volume mounting issues**: On some systems, you might encounter permission issues with volume mounts. Try running:
   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

4. **Sandbox isolation failures**: If the sandbox service fails to start, check that your Docker version supports the security options used in the `docker-compose.yml` file.

### Getting Help

If you encounter issues not covered here, please:
1. Check the [project issues](https://github.com/yourusername/sadp/issues) to see if it's a known problem
2. Consult the development team via Slack or email
3. Create a new issue with detailed information about your problem

## Best Practices

1. **Always run vulnerable code in the sandbox**: Never execute intentionally vulnerable code outside the sandbox environment.

2. **Keep Docker images updated**: Regularly update your Docker images to get the latest security patches.

3. **Don't commit sensitive information**: Never commit your `.env` file or any other files containing sensitive information.

4. **Follow the coding standards**: Adhere to the project's coding standards and guidelines.

5. **Regular testing**: Run tests regularly to ensure your changes don't break existing functionality.
