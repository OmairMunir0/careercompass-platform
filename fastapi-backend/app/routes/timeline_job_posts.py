from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import os
from typing import Dict, List
from sentence_transformers import SentenceTransformer
import openai
from ..utils.job_post_score import get_recommended_jobs_for_user
from dotenv import load_dotenv
from ..db.job_posts import get_job_posts, get_db, get_normal_job_posts
from ..db.user_info import get_user_info

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("AI_REC_MODEL_NAME")
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

@router.get("/job_posts")
async def get_recommended(user_id: str = Query(...)):
        
    # 1. Fetch JobPosts from MongoDB
    jobposts = get_job_posts()
    
    # 2. Extract user attributes
    user = get_user_info(user_id)

    # 3. Get recommended jobs
    recommended = get_recommended_jobs_for_user(user, jobposts)
    print("Recommended Jobs:", recommended)
    
    # 4. Convert recommended jobs to normal job post format
    timeline_posts = get_normal_job_posts(recommended)
    print("Converted Normal Posts:", timeline_posts)
    
    return timeline_posts
