import os
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, Query
from .job_posts import get_db
from datetime import datetime

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "test")

client = None
db = None

def get_user_info(userId: str = None):
    """
    Fetches all active job posts from the database using PyMongo.
    """
    database = get_db()
    if database is None:
        return []

    collection = database["users"]
    user_skills_collection = database["userskills"]
    skills_collection = database["skills"]
    user_experiences_collection = database["userexperiences"]

    user = {}
    # Fetch user acc to user_id
    if userId:
        user_oid = ObjectId(userId)
        document = collection.find_one({"_id": user_oid})
        if document:
            # Convert ObjectId to string for JSON serialization
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, list):
                    document[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
            temp_user = document
            
            # Fetch Skills
            user_skills_cursor = user_skills_collection.find({"user": user_oid})
            skill_ids = [us["skillId"] for us in user_skills_cursor]
            skills_cursor = skills_collection.find({"_id": {"$in": skill_ids}})
            skill_names = [skill["name"] for skill in skills_cursor]

            # Calculate Years of Experience
            user_experiences_cursor = user_experiences_collection.find({"user": user_oid})
            experiences = list(user_experiences_cursor)
            
            years_experience = 0
            if experiences:
                start_dates = [exp["startDate"] for exp in experiences if exp.get("startDate")]
                end_dates = []
                for exp in experiences:
                    if exp.get("endDate"):
                        end_dates.append(exp["endDate"])
                    elif exp.get("isCurrent"):
                        end_dates.append(datetime.now())
                    else:
                         # Fallback if no end date and not current, maybe use now or ignore
                         end_dates.append(datetime.now())

                if start_dates and end_dates:
                    earliest_start = min(start_dates)
                    latest_end = max(end_dates)
                    
                    # Ensure dates are offset-naive or aware to avoid comparison errors
                    # Assuming pymongo returns datetime objects
                    
                    diff = latest_end - earliest_start
                    years_experience = round(diff.days / 365.25, 1)
                
                experienceLevel = "Internship"    
                if years_experience < 3 and years_experience >=1:
                    experienceLevel = "Entry-Level"
                elif years_experience >=3 and years_experience <6:
                    experienceLevel = "Mid-Level"
                elif years_experience >=6 and years_experience <10:
                    experienceLevel = "Senior-Level"
                elif years_experience >=10:
                    experienceLevel = "Executive"

            user = {
                "position": temp_user.get("position", ""),
                "bio": temp_user.get("bio", ""),
                "skills": skill_names, # Updated to use fetched skills
                "location": temp_user.get("location", ""),
                "preferredLocations": temp_user.get("preferredLocations", []),
                "yearsExperience": years_experience, # Updated calculation
                "experienceLevel": experienceLevel,
            }
    print(user)
            
    return user 

if __name__ == "__main__":
    user_info = get_user_info
    print(f"Fetched {user_info} job posts from the database.")