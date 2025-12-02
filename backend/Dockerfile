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

# Start the server using tsx (dev server, no compilation needed)
CMD ["npx", "tsx", "src/server.ts"]
