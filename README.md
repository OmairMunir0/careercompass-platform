# Full-Stack Setup (Next.js + Express + MongoDB)

## Overview

### Basic full-stack setup using:

- Frontend: Next.js (React + TypeScript)
- Backend: Express.js (TypeScript)
- Database: MongoDB (Mongoose ODM)

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
- Backend Setup (Express)

### Backend Setup

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
```

3. Seed in default entries in DB (Optional)

```
npm run seed
```

4. Run the API server

```
npm run dev
```

Backend should now be available at:
**http://localhost:3001**

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

## Notes

- Frontend proxies all API calls to http://localhost:3001.
- Use TypeScript in both layers.
- MongoDB models live under backend/src/models.
- Seed data is added for all the models and live under backend/src/data
