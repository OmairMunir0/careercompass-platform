from fastapi import FastAPI
from app.routes import interview_video
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
from app.utils.analysis import get_whisper_model
from app.utils.accuracy import _load_model
from app.utils.job_post_score import load_rec_model

# Global task tracker
background_tasks = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting up...")
    try:
        await asyncio.gather(
            asyncio.to_thread(get_whisper_model),
            asyncio.to_thread(_load_model),
            asyncio.to_thread(load_rec_model)
        )
        print("Models preloaded: Whisper + SentenceTransformer + Accuracy Model")
    except Exception as e:
        print(f"Model preload failed: {e}")
    yield
    print("Shutting down... waiting for tasks...")
    # Wait for all background tasks to finish
    await asyncio.gather(*background_tasks, return_exceptions=True)

app = FastAPI(lifespan=lifespan)
app.include_router(interview_video.router, prefix="/api/interview_video")
app.mount("/videos", StaticFiles(directory="uploads/videos"), name="videos")