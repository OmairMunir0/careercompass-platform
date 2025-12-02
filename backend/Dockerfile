# Express Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies (CapRover builds from repo root)
COPY ./backend/package*.json ./
RUN npm ci

# Copy source code
COPY ./backend/ .

# Expose port
EXPOSE 3001

# Start server
CMD ["npx", "tsx", "src/server.ts"]
