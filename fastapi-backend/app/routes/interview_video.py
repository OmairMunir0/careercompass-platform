from fastapi import FastAPI, APIRouter, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.post("/upload")
async def upload_video(file: UploadFile = File(...)):
    file_location = os.path.join(UPLOAD_DIR, file.filename)
    
    with open(file_location, "wb") as f:
        content = await file.read()
        f.write(content)

    public_url = f"{BASE_URL}/videos/{file.filename}"

    analysis_result = {
        "video_path": public_url,
        "overall_score": 95,
        "emotions": {"happy": 50, "neutral": 45, "sad": 5},
    }

    print("Analysis result:", analysis_result)
    return analysis_result