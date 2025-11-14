from __future__ import annotations
from fastapi import APIRouter, UploadFile, File
import os
from typing import Dict
from sentence_transformers import SentenceTransformer
import openai
from dotenv import load_dotenv
from ..utils.analysis import (
    save_uploaded_video,
    extract_audio_to_wav,
    transcribe_audio_chunks,
    cleanup_temp_file,
)

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("MODEL_NAME")
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()
model = SentenceTransformer(MODEL)


@router.post("/upload")
async def upload_video(file: UploadFile = File(...)) -> Dict:
    video_path = None
    audio_path = None

    try:
        # 1. Save video
        video_path = save_uploaded_video(file)
        public_url = f"{BASE_URL}/videos/{file.filename}"

        print(video_path)

        # 2. Extract audio
        audio_path = extract_audio_to_wav(video_path)
        print(audio_path)

        # 3. Transcribe
        transcript = transcribe_audio_chunks(audio_path)
        print("Transcript:", transcript)

        # 4. Mock analysis
        result = {
            "video_path": public_url,
            "transcript": transcript,
            "overall_score": 95,
            "emotions": {"happy": 50, "neutral": 45, "sad": 5}
        }
        return result

    except Exception as e:
        raise RuntimeError(f"Processing failed: {e}")
    finally:
        # Always clean up
        cleanup_temp_file(audio_path)