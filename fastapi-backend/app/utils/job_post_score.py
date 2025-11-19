from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv
import os

load_dotenv()

AI_MODEL = os.getenv("AI_REC_MODEL_NAME", "all-MiniLM-L6-v2")

rec_model = None

def load_rec_model():
    global rec_model
    print("[JobPostScore] Loading recommendation model...")
    rec_model = SentenceTransformer(AI_MODEL)
    print("[JobPostScore] Model loaded successfully!")
    return rec_model  # optional, but safe

class RecommendedJob(BaseModel):
    jobId: str
    title: str
    company: str
    location: str
    workMode: str
    salaryMin: int
    salaryMax: int
    matchScore: int  # 0–100
    matchingSkills: List[str]

def build_user_text(user: Dict[Any, Any]) -> str:
    return f"""
    {user.get('position', '')} with {user.get('yearsExperience', 0)} years experience
    skills: {', '.join(user.get('skills', []))}
    location: {user.get('location', '')}
    prefers: {', '.join(user.get('preferredLocations', [])), user.get('preferredWorkMode', '')}
    """.strip().lower()

def build_job_text(job: Dict[Any, Any]) -> str:
    all_skills = job.get('requiredSkills', []) + job.get('niceToHaveSkills', [])
    return f"""
    {job.get('title', '')} at {job.get('company', '')}
    location: {job.get('location', '')} | work mode: {job.get('workMode', '')} | salary: €{job.get('salaryMin',0)//1000}k–€{job.get('salaryMax',0)//1000}k
    skills: {', '.join(all_skills)}
    job description: {job.get('description', '')}
    """.strip().lower()

def get_recommended_jobs_for_user(
    user: Dict[Any, Any],
    jobposts: List[Dict[Any, Any]],
    min_score: float = 0.40
) -> List[RecommendedJob]:
    """
    Returns jobs sorted by relevance for the given user.
    Only jobs with cosine similarity >= 0.40 are included.
    """
    if not jobposts:
        return []

    user_text = build_user_text(user)
    user_embedding = rec_model.encode([user_text])

    job_texts = [build_job_text(job) for job in jobposts]
    job_embeddings = rec_model.encode(job_texts)

    # Cosine similarity
    similarities = cosine_similarity(user_embedding, job_embeddings)[0][0]

    results = []
    user_skills_lower = {s.lower() for s in user.get('skills', [])}

    for job, score in zip(jobposts, similarities):
        if score < min_score:
            continue

        # Find common skills (case-insensitive)
        job_all_skills = job.get('requiredSkills', []) + job.get('niceToHaveSkills', [])
        common = [s for s in job_all_skills if s.lower() in user_skills_lower]

        results.append({
            "jobId": str(job['_id']),
            "title": job.get('title'),
            "company": job.get('company'),
            "location": job.get('location'),
            "workMode": job.get('workMode'),
            "salaryMin": job.get('salaryMin'),
            "salaryMax": job.get('salaryMax'),
            "matchScore": int(round(score * 100)),  # 0–100
            "matchingSkills": common
        })

    # Sort highest → lowest score
    results.sort(key=lambda x: x['matchScore'], reverse=True)

    return [RecommendedJob(**r) for r in results]