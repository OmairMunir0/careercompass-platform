import os
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Dict, Any
from bson import ObjectId
from fastapi import APIRouter, Query
from .job_posts import get_db

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

    user = {}
    # Fetch user acc to user_id
    if userId:
        document = collection.find_one({"_id": ObjectId(userId)})
        if document:
            # Convert ObjectId to string for JSON serialization
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
                elif isinstance(value, list):
                    document[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
            temp_user = document
            
            user = {
                "position": temp_user.get("position", ""),
                "bio": temp_user.get("bio", ""),
                "skills": temp_user.get("skills", []),
                "location": temp_user.get("location", ""),
                "preferredLocations": temp_user.get("preferredLocations", []),
                "yearsExperience": temp_user.get("yearsExperience", 0),
                "experienceLevel": temp_user.get("experienceLevel", ""),
            }
    print(user)
            
    return user 

if __name__ == "__main__":
    user_info = get_user_info
    print(f"Fetched {user_info} job posts from the database.")