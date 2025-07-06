FROM python:3.9-slim

WORKDIR /app

# Install basic dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy application code
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create a non-root user to run the sandbox
RUN useradd -m sandbox
USER sandbox

# Expose the port the sandbox runs on
EXPOSE 8000

# Command to run the sandbox service
CMD ["python", "sandbox_service.py"]
