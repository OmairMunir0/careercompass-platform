from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import os

load_dotenv()
AI_MODEL = os.getenv("AI_REC_MODEL_NAME", "all-MiniLM-L6-v2")

# Global model — loaded once in lifespan
rec_model = None

def load_rec_model():
    global rec_model
    print("[JobPostScore] Loading recommendation model...")
    rec_model = SentenceTransformer(AI_MODEL)
    print("[JobPostScore] Model loaded successfully!")

_user_text_template = """
{position} - {level} ({years} years experience)
bio: {bio}
skills: {skills}
location: {location}
prefers locations: {locations}
""".strip()

_job_text_template = """
{title}
location: {location} | work mode: {workMode} | salary: €{salary}k
required skills: {skills}
job description: {description}
""".strip()

def build_user_text(user: Dict[Any, Any]) -> str:
    skills = ', '.join(user.get('skills', []))
    locations = ', '.join(user.get('preferredLocations', []))
    bio = user.get('bio', '') or 'No bio'
    
    return _user_text_template.format(
        position=user.get('position', 'Professional'),
        level=user.get('experienceLevel', 'Mid-Level'),
        years=user.get('yearsExperience', 0),
        bio=bio,
        skills=skills,
        location=user.get('location', 'Anywhere'),
        locations=locations or 'Anywhere'
    ).lower()

def build_job_text(job: Dict[Any, Any]) -> str:
    skills = ', '.join(job.get('requiredSkills', []))
    salary_min = job.get('salaryMin', 0) // 1000
    salary_max = job.get('salaryMax', 0) // 1000
    salary = f"{salary_min}-{salary_max}" if salary_max else f"{salary_min}+"

    return _job_text_template.format(
        title=job.get('title', ''),
        location=job.get('location', 'Anywhere'),
        workMode=job.get('workMode', 'flexible'),
        salary=salary,
        skills=skills,
        description=job.get('description', '')[:400]
    ).lower()

def get_recommended_jobs_for_user(
    user: Dict[Any, Any],
    jobposts: List[Dict[Any, Any]],
    min_score: float = 0.80
) -> List[Dict[str, Any]]:

    global rec_model
    if rec_model is None:
        raise RuntimeError("Recommendation model not loaded!")

    if not jobposts:
        return []

    user_text = build_user_text(user)
    user_embedding = rec_model.encode([user_text])

    job_texts = [build_job_text(job) for job in jobposts]
    job_embeddings = rec_model.encode(job_texts)

    similarities = cosine_similarity(user_embedding, job_embeddings)[0]
    max_sim = float(max(similarities)) if len(similarities) > 0 else 0.0
    print(f"[JobPostScore] Calculated similarities for {len(similarities)} jobs. Max similarity score: {max_sim:.4f} (needs >= {min_score})")

    results = []
    user_skills_lower = {s.lower() for s in user.get('skills', [])}

    for job, score in zip(jobposts, similarities):
        if score < min_score:
            continue

        job_skills = job.get('requiredSkills', [])
        common = [s for s in job_skills if s.lower() in user_skills_lower]

        results.append({
            "jobId": str(job["_id"]),
            "matchScore": int(round(score * 100)),
            "matchingSkills": common,
        })

    results.sort(key=lambda x: x["matchScore"], reverse=True)
    print(f"[JobPostScore] Filtered by min_score ({min_score}), kept {len(results)} jobs.")
    print("results:", results)

    return results