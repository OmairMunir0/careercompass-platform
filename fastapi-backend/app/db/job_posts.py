import os
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import List, Dict, Any
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME", "test")

client = None
db = None

def get_db():
    global client, db
    if client is None:
        if not MONGO_URI:
            raise ValueError("MONGO_URI environment variable not set")
        client = MongoClient(MONGO_URI)
        try:
            db = client[DB_NAME]
        except Exception:
             pass
    return db

def get_job_posts() -> List[Dict[str, Any]]:
    """
    Fetches all active job posts from the database using PyMongo.
    """
    database = get_db()
    if database is None:
        return []

    collection = database["jobposts"]

    jobs = []
    # Fetch all jobs.
    cursor = collection.find({"isActive": True}) 
    
    for document in cursor:
        # Convert ObjectId to string for JSON serialization
        if "_id" in document:
            document["_id"] = str(document["_id"])
        
        for key, value in document.items():
            if isinstance(value, ObjectId):
                document[key] = str(value)
            elif isinstance(value, list):
                document[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]

        jobs.append(document)

    return jobs

if __name__ == "__main__":
    job_posts = get_job_posts()
    print(f"Fetched {job_posts} job posts from the database.")