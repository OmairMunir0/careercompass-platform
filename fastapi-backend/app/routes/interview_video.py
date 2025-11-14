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
    transcribe_and_split,
    cleanup_temp_file,
)
from ..utils.accuracy import (
    _load_model, 
    TextSimilarity,
    get_similarity, batch_similarity, 
)

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("MODEL_NAME")
ANSWER_TIME = os.getenv("ANSWER_TIME", 40)
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
        full_transcript, segmented_chuks = transcribe_and_split(audio_path, segment_duration=ANSWER_TIME)
        print("Transcript:", full_transcript, "\nSegmented Chunks: ", segmented_chuks)
        
        #4 Send To ML Model For Sound / Video Analysis
        

        # 5. Mock analysis
        result = {
            "video_path": public_url,
            # "transcript": transcript,
            "overall_score": 95,
            "emotions": {"happy": 50, "neutral": 45, "sad": 5}
        }
        return result

    except Exception as e:
        raise RuntimeError(f"Processing failed: {e}")
    finally:
        # Always clean up
        cleanup_temp_file(audio_path)