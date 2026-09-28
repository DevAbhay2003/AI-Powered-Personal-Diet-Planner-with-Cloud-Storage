# Multi-stage Dockerfile for Cloud Deployment (Google Cloud Run / AWS ECS / Render)
FROM python:3.11-slim

# Set environment flags
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8080

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code and AI engine
COPY backend/ ./backend/
COPY cloud/ ./cloud/
COPY ai_engine/ ./ai_engine/
COPY .env.example .env

# Expose container port
EXPOSE 8080

# Healthcheck probe for Cloud Orchestrators (Kubernetes / ECS)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Launch uvicorn server
CMD ["uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8080"]
