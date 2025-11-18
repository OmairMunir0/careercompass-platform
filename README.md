# Full-Stack Setup (Next.js + Express + MongoDB)

## Overview

### Basic full-stack setup using:

- Frontend: Next.js (React + TypeScript)
- Backend: Express.js (TypeScript)
- Database: MongoDB (Mongoose ODM)
- Cache: Redis (for database query caching)

## Project Structure

```
root/
├── frontend/ # Next.js app (port 3000)
│ ├── src/
│ ├── package.json
│ └── ...
├── backend/ # Express API (port 3001)
│ ├── src/
│ ├── package.json
│ └── ...
└── README.md
```

## Prerequisites

- Node.js (LTS)
- npm
- MongoDB instance running via Atlas
- Redis server (for caching)
- Backend Setup (Express)

### Frontend Setup (Next.js)

Path: frontend/

1. Install dependencies

```
cd frontend
npm install
```

2. Environment variables (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

3. Run the frontend

```
npm run dev
```

Frontend should now be available at:
**http://localhost:3000**

### Backend Setup (MERN)

Path: backend/

1. Install dependencies

```
cd backend
npm install
```

2. Environment variables (.env)

```
PORT=3001
MONGO_URI=mongodb://localhost:27017/your-db-name
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=your_secret_stripe_key
STRIPE_PREMIUM_PRICE_ID=price_123
FRONTEND_URL=http://localhost:3000

# Redis Configuration (Optional - defaults provided)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

3. Install and start Redis (if not already running)

**Windows:**
- Download Redis from https://github.com/microsoftarchive/redis/releases
- Or use WSL: `sudo apt-get install redis-server`
- Start Redis: `redis-server`

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt-get install redis-server
sudo systemctl start redis-server
```

3.1. Generate VAPID keys for Web Push Notifications (Optional)

To enable browser push notifications, you need to generate VAPID keys:

```bash
cd backend
npx web-push generate-vapid-keys
```

This will output a public key and private key. Add them to your `.env` file:

```
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:admin@careercompass.com
```

**Note:** Push notifications are only available for Premium users. The notification center (bell icon) will only appear for Premium subscribers.

4. Seed in default entries in DB (Optional)

```
npm run seed
```

5. Run the API server

```
npm run dev
```

Backend should now be available at:
**http://localhost:3001**

### FastAPI Setup (Python AI/Video Processing Backend)

Path: fastapi-backend/

1. Create and activate a virtual environment:

```
cd fastapi-backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
```

2. Install dependencies:

```
pip install --upgrade pip
pip install -r requirements.txt
```
Example requirement.txt
```
fastapi
uvicorn[standard]
deepface
opencv-python
mediapipe
torch
transformers
sentence-transformers
openai-whisper
language-tool-python
numpy
pandas
matplotlib
tqdm
```

3. Run the FastAPI server:

```
uvicorn app.main:app --reload
```

FastAPI server should now be available at:
**http://localhost:8000**


## Notes

- Frontend proxies all API calls to http://localhost:3001.
- Use TypeScript in both layers.
- MongoDB models live under backend/src/models.
- Seed data is added for all the models and live under backend/src/data
- **Redis Caching**: The backend uses Redis for caching frequently accessed data:
  - Posts, Blogs, Users, and Analytics are cached
  - Cache TTL: Short (1 min) for dynamic content, Medium (5 min) for user data, Long (30 min) for analytics
  - Cache is automatically invalidated on create/update/delete operations
  - If Redis is unavailable, the app will continue to work but without caching benefits
- **Notification Center (Premium Feature)**: 
  - Exclusive to Premium users - a bell icon appears in the bottom left corner of the timeline
  - Notifications are sent for: post likes, post comments, chat messages, and job posts matching user skills
  - Read notifications have white background, unread have blue highlight
  - Browser push notifications work even when the tab is closed (requires VAPID keys configuration)
  - Service worker (`/public/sw.js`) handles push notifications and click events
- Frontend → Express → FastAPI workflow:
```
    Frontend (React) 
        │
        │ Uploads video/audio
        ▼
    Express Backend
        │
        │ Forwards file path or video to FastAPI
        ▼
    FastAPI Backend
        │
        │ Processes video (emotion, pose, speech, grammar, similarity)
        │ Returns JSON report
        ▼
    Express Backend
        │
        │ Sends processed report back to Frontend
        ▼
    Frontend Dashboard
```