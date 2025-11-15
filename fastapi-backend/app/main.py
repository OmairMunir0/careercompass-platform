from fastapi import FastAPI
from app.routes import interview_video
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

app = FastAPI()
app.include_router(interview_video.router, prefix="/api/interview_video")
app.mount("/videos", StaticFiles(directory="uploads/videos"), name="videos")