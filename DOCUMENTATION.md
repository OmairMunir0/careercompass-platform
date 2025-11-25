# SkillSeeker v2 - Comprehensive Project Documentation

**Version:** 2.0  
**Last Updated:** November 24, 2025  
**Project Type:** Full-Stack Career Platform with AI/ML Integration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Technology Stack](#technology-stack)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Backend Services](#backend-services)
7. [Frontend Architecture](#frontend-architecture)
8. [Key Features](#key-features)
9. [API Documentation](#api-documentation)
10. [Setup & Installation](#setup--installation)
11. [Deployment Guide](#deployment-guide)
12. [Security & Performance](#security--performance)
13. [Future Enhancements](#future-enhancements)

---

## Executive Summary

SkillSeeker v2 is a comprehensive career development platform that connects job seekers with employers while providing AI-powered tools for skill assessment, interview preparation, and personalized job recommendations. The platform leverages a modern MERN stack combined with FastAPI for advanced AI/ML capabilities.

### Key Highlights

- **26 Database Models** managing users, jobs, skills, applications, and social features
- **29 RESTful API Endpoints** for comprehensive backend functionality
- **AI-Powered Features** including interview analysis, job recommendations, and skill matching
- **Premium Subscription Model** with Stripe integration
- **Real-time Features** including chat, notifications, and push notifications
- **Redis Caching** for optimized performance
- **Responsive UI** built with Next.js 15 and React 19

---

## Project Overview

### Purpose

SkillSeeker v2 aims to revolutionize the job search and recruitment process by:

1. **For Job Seekers:**
   - AI-powered job recommendations based on skills and preferences
   - Interview practice with video analysis and feedback
   - Skill verification and portfolio building
   - Social networking with other professionals
   - Career development resources through blogs

2. **For Recruiters:**
   - Advanced candidate search and filtering
   - Application tracking system (ATS)
   - Candidate shortlisting and management
   - Job posting with AI-powered matching
   - Analytics dashboard for recruitment insights

### Project Structure

```
skillseeker-v2-mern/
├── frontend/              # Next.js 15 + React 19 + TypeScript
│   ├── src/
│   │   ├── app/          # App Router pages
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API service layer
│   │   ├── store/        # Zustand state management
│   │   └── lib/          # Utilities and helpers
│   └── public/           # Static assets
│
├── backend/              # Express.js + TypeScript + MongoDB
│   ├── src/
│   │   ├── controllers/  # Business logic (28 controllers)
│   │   ├── models/       # Mongoose schemas (26 models)
│   │   ├── routes/       # API routes (29 route files)
│   │   ├── middleware/   # Auth, validation, rate limiting
│   │   ├── config/       # Database, Redis, environment
│   │   ├── utils/        # Helper functions
│   │   ├── data/         # Seed data
│   │   └── scripts/      # Database seeding scripts
│   └── uploads/          # File storage
│
└── fastapi-backend/      # FastAPI + Python + AI/ML
    ├── app/
    │   ├── routes/       # AI endpoints (2 main routes)
    │   ├── utils/        # ML models and analysis
    │   ├── db/           # MongoDB connections
    │   └── main.py       # FastAPI application
    └── uploads/          # Video processing storage
```

---

## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.5.5 | React framework with App Router |
| **React** | 19.1.0 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Styling framework |
| **Zustand** | 5.0.8 | State management |
| **Axios** | 1.12.2 | HTTP client |
| **TipTap** | 3.10.7 | Rich text editor |
| **Recharts** | 3.4.1 | Data visualization |
| **Lucide React** | 0.511.0 | Icon library |
| **React Hot Toast** | 2.6.0 | Notifications |
| **jsPDF** | 3.0.3 | PDF generation |
| **html2canvas** | 1.4.1 | Screenshot capture |
| **Firebase** | 12.5.0 | File storage (Cloudinary integration) |

### Backend Technologies (MERN)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | LTS | Runtime environment |
| **Express.js** | 5.1.0 | Web framework |
| **TypeScript** | 5.9.3 | Type safety |
| **MongoDB** | 8.19.2 (Mongoose) | Database |
| **Redis** | 5.9.0 | Caching layer |
| **JWT** | 9.0.2 | Authentication |
| **Bcrypt.js** | 3.0.2 | Password hashing |
| **Stripe** | 19.3.1 | Payment processing |
| **Web Push** | 3.6.7 | Push notifications |
| **Multer** | 2.0.2 | File uploads |
| **Helmet** | 8.1.0 | Security headers |
| **Morgan** | 1.10.1 | HTTP logging |
| **Compression** | 1.8.1 | Response compression |
| **Rate Limit** | 8.1.0 | API rate limiting |
| **Zod** | 4.1.12 | Schema validation |

### FastAPI Backend (AI/ML)

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.115.0+ | Web framework |
| **Uvicorn** | 0.32.0+ | ASGI server |
| **OpenAI Whisper** | 20240930 | Speech-to-text |
| **Transformers** | 4.45.0+ | NLP models |
| **Sentence Transformers** | 3.2.0+ | Semantic similarity |
| **PyMongo** | 4.8.0+ | MongoDB client |
| **NumPy** | 2.0.0+ | Numerical computing |
| **Pandas** | 2.2.0+ | Data manipulation |
| **Language Tool** | 2.8.2+ | Grammar checking |
| **Pydantic** | 2.9.0+ | Data validation |

### Infrastructure

- **Database:** MongoDB Atlas (Cloud) / Local MongoDB 7.0
- **Cache:** Redis 7 Alpine
- **Containerization:** Docker Compose
- **Version Control:** Git
- **Package Managers:** npm (Node), pip (Python)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js Frontend (Port 3000)                       │   │
│  │   - React 19 Components                              │   │
│  │   - Zustand State Management                         │   │
│  │   - Service Worker (Push Notifications)             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                        │
│  ┌────────────────────────┐  ┌──────────────────────────┐   │
│  │  Express Backend       │  │  FastAPI Backend         │   │
│  │  (Port 3001)           │  │  (Port 8000)             │   │
│  │  - REST API            │  │  - AI/ML Services        │   │
│  │  - Authentication      │◄─┤  - Video Analysis        │   │
│  │  - Business Logic      │  │  - Job Recommendations   │   │
│  │  - File Management     │  │  - Speech Processing     │   │
│  └────────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌────────────────────────┐  ┌──────────────────────────┐   │
│  │  MongoDB               │  │  Redis Cache             │   │
│  │  (Port 27017)          │  │  (Port 6379)             │   │
│  │  - 26 Collections      │  │  - Query Caching         │   │
│  │  - User Data           │  │  - Session Storage       │   │
│  │  - Job Posts           │  │  - Performance Boost     │   │
│  │  - Applications        │  │                          │   │
│  └────────────────────────┘  └──────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌────────────┐  ┌──────────┐  ┌────────────────────────┐   │
│  │   Stripe   │  │ Cloudinary│  │  OpenAI (Optional)     │   │
│  │  Payments  │  │   CDN     │  │  Enhanced AI Features  │   │
│  └────────────┘  └──────────┘  └────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

#### 1. User Authentication Flow
```
User → Frontend → POST /api/auth/login → Backend
                                        ↓
                                  Validate Credentials
                                        ↓
                                  Generate JWT Token
                                        ↓
                                  Return Token + User Data
                                        ↓
Frontend ← Store in Zustand + localStorage
```

#### 2. AI Interview Analysis Flow
```
User Records Video → Frontend Upload
                          ↓
                    POST /api/interview-videos
                          ↓
                    Express Backend
                          ↓
                    Forward to FastAPI
                          ↓
                    POST /api/interview_video/upload
                          ↓
                    FastAPI Processing:
                    - Extract Audio (FFmpeg)
                    - Transcribe (Whisper)
                    - Analyze Accuracy (Transformers)
                    - Grammar Check (LanguageTool)
                    - Emotion Analysis (Placeholder)
                          ↓
                    Return Analysis Report
                          ↓
                    Express Backend
                          ↓
                    Frontend Display Results
```

#### 3. Job Recommendation Flow
```
User Views Timeline → Frontend Request
                          ↓
                    GET /api/posts/timeline
                          ↓
                    Express Backend:
                    - Fetch Normal Posts (MongoDB)
                    - Request AI Recommendations (FastAPI)
                          ↓
                    GET /api/timeline/job_posts?user_id=xxx
                          ↓
                    FastAPI:
                    - Get User Skills & Preferences
                    - Get All Job Posts
                    - Calculate Similarity Scores
                    - Rank and Filter Jobs
                          ↓
                    Return Recommended Jobs
                          ↓
                    Express Backend:
                    - Merge Posts + Job Posts
                    - Apply Pagination
                    - Cache Results (Redis)
                          ↓
                    Frontend Display Timeline
```

---

## Database Schema

### Core Collections (26 Total)

#### 1. Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique),
  passwordHash: string,
  firstName: string,
  lastName: string,
  username: string (unique),
  roleId: ObjectId (ref: Role),
  publicEmail: string?,
  bio: string?,
  location: string?,
  phone: string?,
  linkedinUrl: string?,
  portfolioUrl: string?,
  companyName: string?,
  companyWebsite: string?,
  position: string?,
  imageUrl: string?,
  resumeUrl: string?,
  preferredLocations: string[],
  subscriptionTier: 'free' | 'premium',
  subscriptionStatus: 'inactive' | 'active' | 'expired' | 'canceled',
  premiumExpiresAt: Date?,
  stripeCustomerId: string?,
  stripeSubscriptionId: string?,
  stripeCheckoutSessionId: string?,
  lastPaymentAt: Date?,
  pushSubscription: string?,
  followersCount: number,
  followingCount: number,
  createdAt: Date,
  updatedAt: Date
}
```

#### 2. Job Posts Collection
```typescript
{
  _id: ObjectId,
  recruiter: ObjectId (ref: User),
  title: string,
  description: string,
  location: string?,
  jobType: ObjectId? (ref: JobType),
  workMode: ObjectId? (ref: WorkMode),
  experienceLevel: ObjectId? (ref: ExperienceLevel),
  salaryMin: number,
  salaryMax: number,
  isActive: boolean,
  requiredSkills: ObjectId[] (ref: Skill),
  applicationEmail: string?,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. Posts Collection (Social Feed)
```typescript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  content: string,
  imageUrl: string?,
  likes: ObjectId[] (ref: User),
  comments: [{
    user: ObjectId (ref: User),
    content: string,
    replies: [{
      user: ObjectId (ref: User),
      content: string,
      createdAt: Date,
      updatedAt: Date
    }],
    createdAt: Date,
    updatedAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### 4. Job Applications Collection
```typescript
{
  _id: ObjectId,
  jobPost: ObjectId (ref: JobPost),
  applicant: ObjectId (ref: User),
  status: ObjectId (ref: JobApplicationStatus),
  coverLetter: string?,
  appliedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### 5. Other Key Collections

- **Skills**: Skill definitions with categories
- **UserSkills**: User-skill mappings with proficiency levels
- **UserEducation**: Educational background
- **UserExperience**: Work experience history
- **UserCertification**: Professional certifications
- **Blogs**: Career development articles
- **Chats**: Direct messaging between users
- **Notifications**: User notifications (Premium feature)
- **Follow**: User following relationships
- **SavedJobs**: Bookmarked job posts
- **Shortlist**: Recruiter candidate shortlists
- **InterviewQuestions**: Question bank by skill category
- **Roles**: User roles (Candidate/Recruiter)
- **JobTypes**: Full-time, Part-time, Contract, etc.
- **WorkModes**: Remote, Hybrid, On-site
- **ExperienceLevels**: Entry, Mid, Senior, etc.
- **ProficiencyLevels**: Beginner, Intermediate, Advanced, Expert
- **SkillCategories**: Programming, Design, Marketing, etc.
- **JobApplicationStatuses**: Applied, Reviewing, Interview, Rejected, Accepted
- **ShortlistStatuses**: Pending, Contacted, Interviewing, etc.

### Database Relationships

```
User ──┬── Posts (1:N)
       ├── JobPosts (1:N) [if Recruiter]
       ├── JobApplications (1:N) [if Candidate]
       ├── UserSkills (1:N)
       ├── UserEducation (1:N)
       ├── UserExperience (1:N)
       ├── UserCertification (1:N)
       ├── Blogs (1:N)
       ├── Chats (N:N)
       ├── Notifications (1:N)
       ├── Follow (N:N)
       ├── SavedJobs (1:N)
       └── Shortlists (1:N) [if Recruiter]

JobPost ──┬── JobApplications (1:N)
          ├── SavedJobs (1:N)
          └── RequiredSkills (N:N)

Skill ──┬── UserSkills (1:N)
        ├── JobPost.requiredSkills (N:N)
        └── InterviewQuestions (1:N)
```

---

## Backend Services

### Express.js Backend (MERN)

#### API Routes (29 Endpoints)

1. **Authentication** (`/api/auth`)
   - POST `/login` - User login
   - POST `/register` - User registration
   - POST `/logout` - User logout
   - GET `/me` - Get current user

2. **Users** (`/api/users`)
   - GET `/` - List all users
   - GET `/:id` - Get user by ID
   - PUT `/:id` - Update user profile
   - DELETE `/:id` - Delete user
   - POST `/:id/upload-image` - Upload profile image
   - POST `/:id/upload-resume` - Upload resume

3. **Job Posts** (`/api/job-posts`)
   - GET `/` - List all job posts
   - GET `/:id` - Get job post details
   - POST `/` - Create job post (Recruiter only)
   - PUT `/:id` - Update job post
   - DELETE `/:id` - Delete job post
   - GET `/recruiter/:recruiterId` - Get recruiter's job posts

4. **Job Applications** (`/api/job-applications`)
   - GET `/` - List applications
   - GET `/:id` - Get application details
   - POST `/` - Submit application
   - PUT `/:id` - Update application status
   - DELETE `/:id` - Withdraw application
   - GET `/job/:jobId` - Get applications for a job
   - GET `/user/:userId` - Get user's applications

5. **Posts** (`/api/posts`)
   - GET `/timeline` - Get timeline feed (with AI job recommendations)
   - GET `/` - List all posts
   - GET `/:id` - Get post details
   - POST `/` - Create post
   - PUT `/:id` - Update post
   - DELETE `/:id` - Delete post
   - POST `/:id/like` - Like/unlike post
   - POST `/:id/comment` - Add comment
   - POST `/:id/comment/:commentId/reply` - Reply to comment

6. **Skills** (`/api/skills`)
   - GET `/` - List all skills
   - GET `/:id` - Get skill details
   - POST `/` - Create skill (Admin)
   - PUT `/:id` - Update skill
   - DELETE `/:id` - Delete skill

7. **User Skills** (`/api/user-skills`)
   - GET `/user/:userId` - Get user's skills
   - POST `/` - Add skill to user
   - PUT `/:id` - Update skill proficiency
   - DELETE `/:id` - Remove skill

8. **Blogs** (`/api/blogs`)
   - GET `/` - List all blogs
   - GET `/:id` - Get blog details
   - POST `/` - Create blog
   - PUT `/:id` - Update blog
   - DELETE `/:id` - Delete blog

9. **Chats** (`/api/chats`)
   - GET `/` - List user's chats
   - GET `/:id` - Get chat details
   - POST `/` - Create/get chat
   - POST `/:id/message` - Send message
   - PUT `/:id/read` - Mark as read

10. **Notifications** (`/api/notifications`) - Premium Only
    - GET `/` - List notifications
    - GET `/unread-count` - Get unread count
    - PUT `/:id/read` - Mark as read
    - PUT `/read-all` - Mark all as read
    - POST `/subscribe` - Subscribe to push notifications
    - POST `/unsubscribe` - Unsubscribe from push

11. **Payments** (`/api/payments`)
    - POST `/create-checkout-session` - Create Stripe checkout
    - POST `/webhook` - Stripe webhook handler
    - POST `/cancel-subscription` - Cancel subscription

12. **Analytics** (`/api/analytics`)
    - GET `/dashboard` - Get dashboard analytics
    - GET `/job-posts/:id/stats` - Get job post statistics

13. **Follow** (`/api/follows`)
    - POST `/` - Follow user
    - DELETE `/:id` - Unfollow user
    - GET `/followers/:userId` - Get followers
    - GET `/following/:userId` - Get following
    - GET `/status/:userId` - Check follow status

14. **Saved Jobs** (`/api/saved-jobs`)
    - GET `/user/:userId` - Get saved jobs
    - POST `/` - Save job
    - DELETE `/:id` - Unsave job

15. **Shortlists** (`/api/shortlists`)
    - GET `/job/:jobId` - Get shortlisted candidates
    - POST `/` - Add to shortlist
    - PUT `/:id` - Update shortlist status
    - DELETE `/:id` - Remove from shortlist

16. **Interview Questions** (`/api/interview-questions`)
    - GET `/category/:categoryId` - Get questions by category
    - GET `/:id` - Get question details
    - POST `/` - Create question (Admin)

17. **Interview Videos** (`/api/interview-videos`)
    - POST `/analyze` - Analyze interview video (calls FastAPI)
    - GET `/user/:userId` - Get user's interview attempts

18. **User Education** (`/api/user-educations`)
    - GET `/user/:userId` - Get user's education
    - POST `/` - Add education
    - PUT `/:id` - Update education
    - DELETE `/:id` - Delete education

19. **User Experience** (`/api/user-experiences`)
    - GET `/user/:userId` - Get user's experience
    - POST `/` - Add experience
    - PUT `/:id` - Update experience
    - DELETE `/:id` - Delete experience

20. **User Certifications** (`/api/user-certifications`)
    - GET `/user/:userId` - Get user's certifications
    - POST `/` - Add certification
    - PUT `/:id` - Update certification
    - DELETE `/:id` - Delete certification

21-29. **Reference Data APIs**: Roles, Job Types, Work Modes, Experience Levels, Proficiency Levels, Skill Categories, Job Application Statuses, Shortlist Statuses

#### Middleware Stack

1. **CORS** - Cross-origin resource sharing
2. **Helmet** - Security headers
3. **Morgan** - HTTP request logging
4. **Compression** - Response compression
5. **Rate Limiting** - API rate limiting (100 requests per 15 minutes)
6. **Authentication** - JWT token verification
7. **ObjectId Conversion** - Automatic MongoDB ObjectId conversion

#### Redis Caching Strategy

```typescript
// Cache TTL Configuration
const CACHE_TTL = {
  SHORT: 60,      // 1 minute - Dynamic content (posts, timeline)
  MEDIUM: 300,    // 5 minutes - User data, job posts
  LONG: 1800      // 30 minutes - Analytics, reference data
};

// Cache Invalidation
- Automatic invalidation on CREATE/UPDATE/DELETE operations
- Manual cache clearing for specific keys
- Graceful degradation if Redis unavailable
```

### FastAPI Backend (AI/ML)

#### Endpoints

1. **Interview Video Analysis** (`/api/interview_video/upload`)
   ```python
   POST /api/interview_video/upload
   
   Parameters:
   - file: UploadFile (video file)
   - categoryId: str (skill category ID)
   - questions: str (JSON encoded list of questions)
   
   Response:
   {
     "video_path": "http://...",
     "transcript": "Full transcription...",
     "result": [
       {
         "question": "...",
         "answer": "...",
         "similarity": 0.85,
         "grammar_errors": 2,
         "corrected_text": "..."
       }
     ],
     "overall_score": 85.5,
     "emotions": {"happy": 50, "neutral": 45, "sad": 5}
   }
   ```

2. **Job Recommendations** (`/api/timeline/job_posts`)
   ```python
   GET /api/timeline/job_posts?user_id={userId}
   
   Response:
   [
     {
       "_id": "...",
       "title": "Senior Developer",
       "description": "...",
       "requiredSkills": ["Python", "React"],
       "workMode": "Remote",
       "location": "New York",
       "salaryMin": 100000,
       "salaryMax": 150000,
       "score": 0.92  // AI similarity score
     }
   ]
   ```

#### AI/ML Models

1. **Whisper Model** (Speech-to-Text)
   - Model: OpenAI Whisper (base/small/medium)
   - Purpose: Transcribe interview audio
   - Preloaded on startup for performance

2. **Sentence Transformer** (Semantic Similarity)
   - Model: all-MiniLM-L6-v2
   - Purpose: Compare interview answers to expected answers
   - Calculate job-user skill matching

3. **Language Tool** (Grammar Checking)
   - Library: language-tool-python
   - Purpose: Detect grammar errors in transcriptions
   - Provide corrected text

#### Processing Pipeline

```python
# Interview Analysis Pipeline
1. Save uploaded video
2. Extract audio using FFmpeg
3. Transcribe audio with Whisper
4. Segment transcript by time (40s chunks)
5. For each question-answer pair:
   - Calculate semantic similarity
   - Check grammar errors
   - Generate corrected text
6. Calculate overall score
7. Clean up temporary files
8. Return analysis report
```

```python
# Job Recommendation Pipeline
1. Fetch user profile (skills, location, preferences)
2. Fetch all active job posts
3. For each job post:
   - Calculate skill match score
   - Calculate location match score
   - Calculate work mode preference score
   - Combine scores with weights
4. Sort by total score (descending)
5. Return top N recommendations
```

---

## Frontend Architecture

### Next.js App Structure

```
src/
├── app/                          # App Router
│   ├── (auth)/                   # Auth group
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Protected routes
│   │   ├── timeline/             # Social feed
│   │   ├── profile/[userId]/    # User profiles
│   │   ├── find-jobs/            # Job search
│   │   ├── job-posts/            # Job posting (Recruiter)
│   │   ├── interviews/           # Interview practice
│   │   ├── blogs/                # Career blogs
│   │   ├── chats/                # Messaging
│   │   ├── saved-jobs/           # Bookmarked jobs
│   │   ├── search-candidates/    # Candidate search (Recruiter)
│   │   ├── followers/            # Follower list
│   │   ├── following/            # Following list
│   │   ├── billing/              # Subscription management
│   │   └── dashboard/            # Analytics dashboard
│   ├── admin/                    # Admin panel
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
│
├── components/                   # React components (41 files)
│   ├── Navbar.tsx
│   ├── TimelinePost.tsx
│   ├── JobCard.tsx
│   ├── NotificationCenter.tsx    # Premium feature
│   ├── RichTextEditor.tsx
│   ├── DocumentGenerator.tsx     # PDF/Resume generator
│   ├── SkillManager.tsx
│   ├── JobPostManager.tsx
│   └── ...
│
├── services/                     # API services (6 files)
│   ├── api.ts                    # Axios instance
│   ├── authService.ts
│   ├── jobService.ts
│   ├── postService.ts
│   ├── userService.ts
│   └── ...
│
├── store/                        # Zustand stores
│   ├── authStore.ts              # Authentication state
│   └── ...
│
├── lib/                          # Utilities
│   ├── firebase.ts               # Firebase config
│   ├── cloudinary.ts             # Image uploads
│   └── ...
│
└── public/
    ├── sw.js                     # Service worker (push notifications)
    └── ...
```

### State Management (Zustand)

```typescript
// authStore.ts
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}
```

### Service Layer Pattern

```typescript
// Example: jobService.ts
export const jobService = {
  getAllJobs: () => api.get('/job-posts'),
  getJobById: (id: string) => api.get(`/job-posts/${id}`),
  createJob: (data: JobPostData) => api.post('/job-posts', data),
  updateJob: (id: string, data: JobPostData) => api.put(`/job-posts/${id}`, data),
  deleteJob: (id: string) => api.delete(`/job-posts/${id}`),
  applyToJob: (jobId: string, data: ApplicationData) => 
    api.post('/job-applications', { jobPost: jobId, ...data }),
};
```

### Key Components

1. **TimelinePost** - Social media post with likes, comments, replies
2. **JobCard** - Job listing card with save/apply functionality
3. **NotificationCenter** - Premium notification bell with push support
4. **RichTextEditor** - TipTap-based WYSIWYG editor
5. **DocumentGenerator** - PDF generation for resumes and reports
6. **SkillManager** - Skill selection with proficiency levels
7. **JobPostManager** - Job posting form with validation

---

## Key Features

### 1. User Authentication & Authorization

- **JWT-based authentication**
- **Role-based access control** (Candidate/Recruiter)
- **Password hashing** with bcrypt
- **Protected routes** on frontend and backend
- **Token refresh** mechanism

### 2. Social Networking

- **Timeline feed** with infinite scroll
- **Create posts** with text and images
- **Like/Comment/Reply** functionality
- **Follow/Unfollow** users
- **User profiles** with follower counts
- **Real-time updates**

### 3. Job Search & Application

- **Advanced job search** with filters (location, work mode, salary, skills)
- **AI-powered job recommendations** based on user skills
- **One-click apply** with cover letter
- **Save jobs** for later
- **Application tracking** for candidates
- **Application management** for recruiters

### 4. Recruiter Features

- **Job posting** with rich descriptions
- **Candidate search** with skill filters
- **Application review** and status updates
- **Candidate shortlisting**
- **Analytics dashboard** (views, applications, shortlists)

### 5. AI Interview Practice

- **Video recording** in browser
- **Speech-to-text** transcription
- **Answer accuracy** analysis using semantic similarity
- **Grammar checking** and corrections
- **Performance scoring** (0-100)
- **Question bank** by skill category

### 6. Skill Management

- **Skill categories** (Programming, Design, etc.)
- **Proficiency levels** (Beginner to Expert)
- **Skill verification** through interviews
- **Skill-based job matching**

### 7. Career Development

- **Blog platform** for career advice
- **Rich text editor** for content creation
- **Educational resources**
- **Certification tracking**

### 8. Premium Subscription

- **Stripe integration** for payments
- **Monthly/Annual plans**
- **Premium features:**
  - Push notifications
  - Notification center
  - Advanced analytics
  - Priority support
- **Subscription management** (upgrade, cancel)

### 9. Notifications (Premium)

- **In-app notifications** for:
  - Post likes and comments
  - Chat messages
  - Job matches
  - Application updates
- **Browser push notifications** (works when tab closed)
- **Service worker** for background notifications
- **Unread count** badge

### 10. Real-time Chat

- **Direct messaging** between users
- **Message history**
- **Read receipts**
- **Notification integration**

### 11. Profile Management

- **Personal information**
- **Work experience** timeline
- **Education** history
- **Certifications**
- **Skills** with proficiency
- **Resume upload**
- **Profile image** upload
- **Social links** (LinkedIn, Portfolio)

### 12. Document Generation

- **PDF resume** generation
- **Interview report** export
- **Application documents**

### 13. Performance Optimization

- **Redis caching** for frequently accessed data
- **Image optimization** with Cloudinary
- **Lazy loading** and code splitting
- **Response compression**
- **Database indexing**

### 14. Security Features

- **Helmet.js** security headers
- **Rate limiting** to prevent abuse
- **Input validation** with Zod
- **XSS protection**
- **CSRF protection**
- **Secure password** requirements

---

## API Documentation

### Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

### Common Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Pagination

Endpoints supporting pagination accept:
- `page` (default: 1)
- `limit` (default: 10)

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "hasMore": true
  }
}
```

### Key Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| GET | `/api/posts/timeline` | Get timeline feed | Yes |
| POST | `/api/posts` | Create post | Yes |
| GET | `/api/job-posts` | List job posts | Yes |
| POST | `/api/job-posts` | Create job post | Yes (Recruiter) |
| POST | `/api/job-applications` | Apply to job | Yes (Candidate) |
| GET | `/api/users/:id` | Get user profile | Yes |
| POST | `/api/follows` | Follow user | Yes |
| GET | `/api/notifications` | Get notifications | Yes (Premium) |
| POST | `/api/payments/create-checkout-session` | Start subscription | Yes |

---

## Setup & Installation

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Python** 3.9+
- **MongoDB** 7.0+ (Atlas or local)
- **Redis** 7+ (local or cloud)
- **Git**
- **npm** or **yarn**
- **pip**

### Environment Variables

#### Frontend (.env)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### Backend (.env)
```env
# Server
PORT=3001
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/skillseeker
# Or MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skillseeker

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PREMIUM_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Web Push (Optional - for Premium notifications)
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_SUBJECT=mailto:admin@skillseeker.com
```

#### FastAPI Backend (.env)
```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/skillseeker

# AI Models
AI_REC_MODEL_NAME=all-MiniLM-L6-v2
MODEL_NAME=base  # Whisper model size: tiny, base, small, medium, large

# Upload Configuration
UPLOAD_DIR=uploads/videos
FASTAPI_BASE_URL=http://127.0.0.1:8000

# Answer Time (seconds per question)
ANSWER_TIME=40

# OpenAI (Optional - for enhanced features)
OPENAI_API_KEY=sk-...
```

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd skillseeker-v2-mern
```

#### 2. Setup Backend (Express)
```bash
cd backend
npm install

# Create .env file (see above)
cp .env.example .env
# Edit .env with your configuration

# Seed database (optional but recommended)
npm run seed

# Start development server
npm run dev
```

Backend will run on **http://localhost:3001**

#### 3. Setup Frontend (Next.js)
```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

Frontend will run on **http://localhost:3000**

#### 4. Setup FastAPI Backend
```bash
cd fastapi-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start server
uvicorn app.main:app --reload
```

FastAPI will run on **http://localhost:8000**

#### 5. Setup Redis (Optional but Recommended)

**Using Docker:**
```bash
docker-compose up -d redis
```

**Windows:**
- Download from https://github.com/microsoftarchive/redis/releases
- Or use WSL: `sudo apt-get install redis-server && redis-server`

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

#### 6. Setup MongoDB

**Using Docker:**
```bash
docker-compose up -d mongodb
```

**MongoDB Atlas (Cloud):**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update MONGO_URI in .env files

**Local Installation:**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

#### 7. Generate VAPID Keys (Optional - for Push Notifications)
```bash
cd backend
npx web-push generate-vapid-keys
```
Add the generated keys to backend/.env

### Verification

1. **Backend Health Check:**
   ```bash
   curl http://localhost:3001/api/health
   # Should return: {"success":true,"message":"ok"}
   ```

2. **FastAPI Docs:**
   Open http://localhost:8000/docs

3. **Frontend:**
   Open http://localhost:3000

### Default Admin Account (After Seeding)

```
Email: admin@skillseeker.com
Password: admin123
```

---

## Deployment Guide

### Production Environment Variables

Update all `.env` files with production values:
- Use production MongoDB Atlas cluster
- Use production Redis instance (Redis Cloud, AWS ElastiCache)
- Set `NODE_ENV=production`
- Use production Stripe keys
- Update CORS origins
- Use strong JWT secrets

### Backend Deployment (Express)

#### Option 1: Traditional Server (PM2)
```bash
# Build
npm run build

# Install PM2
npm install -g pm2

# Start with PM2
pm2 start dist/server.js --name skillseeker-backend

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Option 2: Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

#### Option 3: Cloud Platforms
- **Heroku**: Use Procfile
- **AWS Elastic Beanstalk**: Use .ebextensions
- **Google Cloud Run**: Use Cloud Build
- **DigitalOcean App Platform**: Auto-detect Node.js

### Frontend Deployment (Next.js)

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Option 2: Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
EXPOSE 3000
CMD ["npm", "start"]
```

#### Option 3: Static Export (if applicable)
```bash
npm run build
# Deploy .next/static to CDN
```

### FastAPI Deployment

#### Option 1: Docker
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### Option 2: Cloud Platforms
- **AWS Lambda**: Use Mangum adapter
- **Google Cloud Run**: Use Docker
- **Heroku**: Use Procfile with uvicorn

### Database & Cache

#### MongoDB
- **Production**: Use MongoDB Atlas (M10+ cluster)
- **Backup**: Enable automated backups
- **Monitoring**: Set up alerts

#### Redis
- **Production**: Use Redis Cloud, AWS ElastiCache, or DigitalOcean Managed Redis
- **Persistence**: Enable AOF or RDB
- **Monitoring**: Set up memory alerts

### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI
    location /ai {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL/TLS (HTTPS)

```bash
# Using Let's Encrypt
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Monitoring & Logging

- **Application Monitoring**: New Relic, Datadog, or Sentry
- **Log Management**: Loggly, Papertrail, or ELK Stack
- **Uptime Monitoring**: UptimeRobot, Pingdom

---

## Security & Performance

### Security Best Practices

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt, 10 rounds)
   - HTTP-only cookies for sensitive data

2. **Input Validation**
   - Zod schema validation on all inputs
   - Sanitize user-generated content
   - Prevent NoSQL injection

3. **Rate Limiting**
   - 100 requests per 15 minutes per IP
   - Stricter limits on auth endpoints

4. **Headers**
   - Helmet.js for security headers
   - CORS with specific origins
   - CSP (Content Security Policy)

5. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS in production
   - Secure file uploads

6. **Dependency Management**
   - Regular npm audit
   - Automated dependency updates
   - Vulnerability scanning

### Performance Optimizations

1. **Backend**
   - Redis caching (60-90% faster queries)
   - Database indexing on frequently queried fields
   - Response compression (gzip)
   - Connection pooling

2. **Frontend**
   - Code splitting and lazy loading
   - Image optimization (Cloudinary)
   - Next.js automatic optimizations
   - Service worker caching

3. **Database**
   - Compound indexes on common queries
   - Aggregation pipeline optimization
   - Connection pooling
   - Read replicas for scaling

4. **AI/ML**
   - Model preloading on startup
   - Batch processing where possible
   - Async processing for long tasks
   - GPU acceleration (if available)

### Monitoring Metrics

- **Response Times**: < 200ms for cached, < 500ms for uncached
- **Error Rates**: < 1% of requests
- **Uptime**: 99.9% target
- **Cache Hit Rate**: > 70%
- **Database Query Time**: < 100ms average

---

## Future Enhancements

### Planned Features

1. **Advanced AI/ML**
   - Resume parsing and analysis
   - Skill gap analysis
   - Career path recommendations
   - Salary prediction models
   - Interview emotion detection (facial analysis)

2. **Enhanced Communication**
   - Video calling for interviews
   - Group chat for teams
   - Calendar integration
   - Email notifications

3. **Gamification**
   - Skill badges and achievements
   - Leaderboards
   - Points system
   - Challenges and contests

4. **Mobile Applications**
   - React Native mobile apps
   - Push notifications
   - Offline mode

5. **Advanced Analytics**
   - Recruiter insights dashboard
   - Market trends analysis
   - Skill demand forecasting
   - Salary benchmarking

6. **Integration**
   - LinkedIn profile import
   - GitHub integration
   - Google Calendar sync
   - Slack notifications

7. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader optimization
   - Keyboard navigation
   - Multi-language support (i18n)

8. **Enterprise Features**
   - Team accounts
   - Bulk job posting
   - Advanced reporting
   - Custom branding
   - API access for integrations

### Technical Debt

- Migrate to TypeScript for FastAPI (using Pydantic v2)
- Implement comprehensive test coverage (Jest, Pytest)
- Add E2E testing (Playwright)
- Improve error handling and logging
- Implement GraphQL API option
- Add WebSocket for real-time features
- Microservices architecture for scaling

---

## Appendix

### Project Statistics

- **Total Lines of Code**: ~50,000+
- **Backend Controllers**: 28
- **Database Models**: 26
- **API Routes**: 29
- **Frontend Components**: 41
- **AI/ML Models**: 3
- **Dependencies**: 100+

### Technology Versions

- Node.js: 18+
- Python: 3.9+
- MongoDB: 7.0+
- Redis: 7+
- Next.js: 15.5.5
- React: 19.1.0
- Express: 5.1.0
- FastAPI: 0.115.0+

### Contact & Support

- **Project Repository**: [GitHub URL]
- **Documentation**: [Docs URL]
- **Issue Tracker**: [Issues URL]
- **Email**: support@skillseeker.com

### License

[Specify License - e.g., MIT, Apache 2.0]

---

**Document Version**: 1.0  
**Last Updated**: November 24, 2025  
**Maintained By**: SkillSeeker Development Team
