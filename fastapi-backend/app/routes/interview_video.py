from fastapi import APIRouter, UploadFile, File, Query, HTTPException, BackgroundTasks
import os
import uuid
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

# In-memory job tracker for async background operations
job_results: Dict[str, dict] = {}

def process_video_background(job_id: str, video_path: str, questions_list: list):
    audio_path = None
    try:
        # 1. Update status
        job_results[job_id]["status"] = "processing"
        
        # 2. Extract audio
        audio_path = extract_audio_to_wav(video_path)

        # 3. Transcribe
        full_transcript, segmented_chuks = transcribe_and_split(audio_path, segment_duration=ANSWER_TIME)
        
        # 4. Fetch Accuracy
        analysis = get_accuracy(segmented_chuks, questions_list)
        
        # 5. Emotion Analysis
        emotions = analyze_interview_video(video_path, frame_interval_seconds=1, display_timeline=False)
        
        # Add public URL
        public_url = f"{BASE_URL}/videos/{os.path.basename(video_path)}"

        job_results[job_id] = {
            "status": "completed",
            "result": {
                "accuracy": {
                                "video_path": public_url,
                                "transcript": full_transcript,
                                "result": analysis["result"],         
                                "overall_score": analysis["overall_score"],     
                            },
                "emotions": emotions,
            }
        }
        print(f"[Job {job_id}] Processing completed successfully.")

    except Exception as e:
        print(f"[Job {job_id}] Processing failed: {e}")
        job_results[job_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        # Always clean up temporary audio file
        cleanup_temp_file(audio_path)
        
        # If we return a public_url to the video, deleting it removes access from the frontend!
        # Assuming the original code's deletion was intentional to prevent unbounded storage:
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
                print(f"[Cleanup] Deleted video file: {video_path}")
            except Exception as e:
                print(f"[Cleanup] Warning: Failed to delete video file {video_path}: {e}")
        
        mp4_path = os.path.splitext(video_path)[0] + ".mp4"
        if mp4_path != video_path and os.path.exists(mp4_path):
            try:
                os.unlink(mp4_path)
                print(f"[Cleanup] Deleted converted mp4 file: {mp4_path}")
            except Exception as e:
                print(f"[Cleanup] Warning: Failed to delete mp4 file {mp4_path}: {e}")


@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks,
                       file: UploadFile = File(...), 
                       categoryId: str = Query(..., description="MongoDB category ID for the skill"),
                       questions: str = Query(...)  ) -> Dict:
    
    try:
        # 1. Save video immediately
        video_path = save_uploaded_video(file)
        questions_list = json.loads(urllib.parse.unquote(questions))

        # 2. Create job
        job_id = str(uuid.uuid4())
        job_results[job_id] = {"status": "pending"}

        # 3. Queue task
        background_tasks.add_task(process_video_background, job_id, video_path, questions_list)
        
        return {
            "message": "Video accepted for processing",
            "job_id": job_id,
            "status": "pending"
        }

    except Exception as e:
        print(f"Error handling video upload: {e}")
        raise HTTPException(status_code=500, detail=f"Initialization failed: {e}")

@router.get("/status/{job_id}")
async def get_job_status(job_id: str) -> Dict:
    if job_id not in job_results:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return job_results[job_id]