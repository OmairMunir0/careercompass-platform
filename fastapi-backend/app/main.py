from fastapi import FastAPI
from app.routes import interview_video, timeline_job_posts
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio

# Global task tracker
background_tasks = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    yield
    print("Shutting down... waiting for tasks...")
    # Wait for all background tasks to finish
    await asyncio.gather(*background_tasks, return_exceptions=True)

app = FastAPI(lifespan=lifespan)
app.include_router(interview_video.router, prefix="/api/interview_video")
app.include_router(timeline_job_posts.router, prefix="/api/timeline")
app.mount("/videos", StaticFiles(directory="uploads/videos"), name="videos")