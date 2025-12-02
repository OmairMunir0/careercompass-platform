# app/utils/job_post_score.py - OpenAI Embeddings API version

import numpy as np
import openai
from typing import List, Dict, Any
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize OpenAI client
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Use text-embedding-3-small - cheapest at $0.00002/1K tokens
EMBEDDING_MODEL = "text-embedding-3-small"

def get_embeddings(texts: List[str]) -> np.ndarray:
    """Get embeddings from OpenAI API"""
    response = client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=texts
    )
    return np.array([item.embedding for item in response.data])

def cosine_similarity_vectors(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """Compute cosine similarity between vector a and matrix b"""
    a_norm = a / np.linalg.norm(a, axis=1, keepdims=True)
    b_norm = b / np.linalg.norm(b, axis=1, keepdims=True)
    return np.dot(a_norm, b_norm.T)

# FINAL TEXT BUILDERS – Matches your Colab EXACTLY
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
    salary = f"{salary_min}–{salary_max}" if salary_max else f"{salary_min}+"

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
    min_score: float = 0.40
) -> List[Dict[str, Any]]:

    if not jobposts:
        return []

    user_text = build_user_text(user)
    job_texts = [build_job_text(job) for job in jobposts]
    
    # Get all embeddings in one API call for efficiency
    all_texts = [user_text] + job_texts
    all_embeddings = get_embeddings(all_texts)
    
    user_embedding = all_embeddings[0:1]  # Keep 2D shape
    job_embeddings = all_embeddings[1:]

    similarities = cosine_similarity_vectors(user_embedding, job_embeddings)[0]

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

    return results