from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import os
from typing import Dict, List
from sentence_transformers import SentenceTransformer
import openai
import json
import urllib.parse
from dotenv import load_dotenv
from ..utils.analysis import ( save_uploaded_video, extract_audio_to_wav, transcribe_and_split, cleanup_temp_file)
from ..utils.accuracy import ( get_accuracy )
from ..utils.emotional_main import analyze_interview_video

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("MODEL_NAME")
ANSWER_TIME = os.getenv("ANSWER_TIME", 40)
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()
# model = SentenceTransformer(MODEL)


@router.post("/upload")
async def upload_video(file: UploadFile = File(...), 
                       categoryId: str = Query(..., description="MongoDB category ID for the skill"),
                       questions: str = Query(...)  ) -> Dict:
    video_path = None
    audio_path = None
    
    try:
        # 1. Save video
        video_path = save_uploaded_video(file)
        public_url = f"{BASE_URL}/videos/{file.filename}"
        questions_list = json.loads(urllib.parse.unquote(questions))

        # 2. Extract audio
        audio_path = extract_audio_to_wav(video_path)

        # 3. Transcribe
        full_transcript, segmented_chuks = transcribe_and_split(audio_path, segment_duration=ANSWER_TIME)
        
        # 4. Fetch Accuracy
        analysis = get_accuracy(segmented_chuks, questions_list)
        
        # 5. Emotion Analysis
        emotions = analyze_interview_video(video_path, frame_interval_seconds=1, display_timeline=False)

        dummy = {
            "accuracy": {
                            "video_path": public_url,
                            "transcript": full_transcript,
                            "result": analysis["result"],         
                            "overall_score": analysis["overall_score"],     
                        },
            "emotions": emotions,
        }

        print("Final Response:", dummy)
        return dummy

    except Exception as e:
        print(f"Error processing video: {e}")
        raise RuntimeError(f"Processing failed: {e}")
    finally:
        # Always clean up temporary files
        cleanup_temp_file(audio_path)
        
        # Delete the uploaded video file after processing
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
                print(f"[Cleanup] Deleted video file: {video_path}")
            except Exception as e:
                print(f"[Cleanup] Warning: Failed to delete video file {video_path}: {e}")
        
        # Clean up the converted MP4 if different from original
        if video_path:
             # This simple logic assumes the converter replaces extension with .mp4
             mp4_path = os.path.splitext(video_path)[0] + ".mp4"
             if mp4_path != video_path and os.path.exists(mp4_path):
                 try:
                    os.unlink(mp4_path)
                    print(f"[Cleanup] Deleted converted mp4 file: {mp4_path}")
                 except Exception as e:
                    print(f"[Cleanup] Warning: Failed to delete mp4 file {mp4_path}: {e}")