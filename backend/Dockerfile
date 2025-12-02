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

# Run seed then start the server (REMOVE SEED AFTER FIRST DEPLOY)
CMD ["sh", "-c", "npx tsx src/scripts/seed.ts && npx tsx src/server.ts"]
