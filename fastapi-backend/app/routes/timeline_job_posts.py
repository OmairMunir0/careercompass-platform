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
from ..db.user_info import get_user_info

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("AI_REC_MODEL_NAME")
openai.api_key = os.getenv("OPENAI_API_KEY")

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()
# model = SentenceTransformer(MODEL)


@router.get("/job_posts") #, response_model=List[RecommendedJob] in bracket
async def get_recommended(user_id: str = Query(...)):
    
    print(user_id)
    
    # 1. Fetch JobPosts from MongoDB
    jobposts = get_job_posts()
    
    # 2. Extract user attributes
    user = get_user_info(user_id)
    
    dummy = {
        "position": "Software Engineer",
        "bio": "Experienced in backend development and AI integration.",
        "skills": ["Python", "FastAPI", "MongoDB", "Machine Learning"],
        "location": "Berlin, Germany",
        "preferredLocations": ["Remote"],
        "yearsExperience" : 3,  #endDate.year - startDate.year (from experience user profile)
        "experienceLevel": "Mid-Level",  #endDate.year - startDate.year (from experience user profile)
    }

    # recommended = get_recommended_jobs_for_user(dummy, jobposts)
    
    # print("Recommended Jobs:", recommended)
    
    # return recommended
    
    return dummy