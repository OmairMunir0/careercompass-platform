from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import os
from typing import Dict, List
from sentence_transformers import SentenceTransformer
import openai
import json
import urllib.parse
from dotenv import load_dotenv
from ..utils.analysis import (
    save_uploaded_video,
    extract_audio_to_wav,
    transcribe_and_split,
    cleanup_temp_file,
)

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("AI_REC_MODEL_NAME")
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()
model = SentenceTransformer(MODEL)


@router.post("/job-posts")
async def upload_video() -> Dict:

    try:
        return {"message": "This endpoint is under construction."}

    except Exception as e:
        raise RuntimeError(f"Processing failed: {e}")
    finally:
        # Cleanup temp files if they were created
        pass