# FastAPI Backend Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (ffmpeg for audio extraction)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching (CapRover builds from repo root)
COPY ./fastapi-backend/requirements.txt .

# Install Python dependencies (lightweight - no ML models)
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./fastapi-backend/ .

# Create uploads directory
RUN mkdir -p uploads/videos

# Expose port
EXPOSE 8000

# Start uvicorn server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
