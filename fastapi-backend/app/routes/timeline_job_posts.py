from __future__ import annotations
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
import os
from typing import Dict, List
from sentence_transformers import SentenceTransformer
import openai
import json
import urllib.parse
from ..utils.job_post_score import get_recommended_jobs_for_user, RecommendedJob
from dotenv import load_dotenv
from ..db.job_posts import get_job_posts, get_db

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("AI_REC_MODEL_NAME")
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()
# model = SentenceTransformer(MODEL)


@router.get("/recommended-jobs", response_model=List[RecommendedJob])
async def get_recommended():
    
    # 1. Fetch JobPosts from MongoDB
    jobposts = get_job_posts()
    
    # 2. Extract user attributes
    user = {
        "position": "Software Engineer",
        "yearsExperience": 3,
        "skills": ["Python", "FastAPI", "MongoDB", "Machine Learning"],
        "location": "Berlin, Germany",
        "preferredLocations": ["Remote", "Berlin"],
        "preferredWorkMode": "Remote"
    }

    recommended = get_recommended_jobs_for_user(user, jobposts)
    return recommended