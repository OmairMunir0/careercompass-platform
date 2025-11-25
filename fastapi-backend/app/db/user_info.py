import os
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, Query
from .job_posts import get_db
from datetime import datetime
import math

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "test")

client = None
db = None


def safe_years(x):
    if x is None or x == "" or (isinstance(x, float) and math.isnan(x)):
        return 0
    return max(0, x)

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
            
            years_experience = 0
            experienceLevel = "Entry-Level"

            # Calculate Years of Experience
            user_experiences_cursor = user_experiences_collection.find({"user": user_oid})
            experiences = list(user_experiences_cursor)
            
            if experiences:
                try:
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
                        years_experience = safe_years(years_experience)
                        
                    if years_experience < 1:
                        experienceLevel = "Internship"
                    elif years_experience < 3:
                        experienceLevel = "Entry-Level"
                    elif years_experience < 6:
                        experienceLevel = "Mid-Level"
                    elif years_experience < 10:
                        experienceLevel = "Senior-Level"
                    else:
                        experienceLevel = "Executive"
                except Exception as e:
                    print(f"Error calculating experience for user {userId}: {e}")
                    pass

            user = {
                "position": temp_user.get("position", ""),
                "bio": temp_user.get("bio", ""),
                "skills": skill_names, 
                "location": temp_user.get("location", ""),
                "preferredLocations": temp_user.get("preferredLocations", []),
                "yearsExperience": safe_years(years_experience), # Updated calculation
                "experienceLevel": experienceLevel,
            }
            
    return user 

if __name__ == "__main__":
    user_info = get_user_info
    print(f"Fetched {user_info} job posts from the database.")