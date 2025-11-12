from fastapi import FastAPI
from app.routes import interview_video
from fastapi.staticfiles import StaticFiles

app = FastAPI()
app.include_router(interview_video.router, prefix="/api/interview_video")
app.mount("/videos", StaticFiles(directory="uploads/videos"), name="videos")