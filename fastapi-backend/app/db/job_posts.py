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
    
    all_skill_ids = set()
    all_workmode_ids = set()
    
    raw_jobs = []

    for document in cursor:
        # Convert ObjectId to string for JSON serialization
        if "_id" in document:
            document["_id"] = str(document["_id"])
        
        # Collect IDs for bulk fetching
        if "requiredSkills" in document and isinstance(document["requiredSkills"], list):
            for skill_id in document["requiredSkills"]:
                if isinstance(skill_id, (str, ObjectId)):
                     all_skill_ids.add(ObjectId(skill_id))
        
        if "workMode" in document and document["workMode"]:
             if isinstance(document["workMode"], (str, ObjectId)):
                all_workmode_ids.add(ObjectId(document["workMode"]))

        for key, value in document.items():
            if isinstance(value, ObjectId):
                document[key] = str(value)
            elif isinstance(value, list):
                document[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]

        raw_jobs.append(document)

    # Bulk fetch skills
    skill_map = {}
    if all_skill_ids:
        skills_collection = database["skills"]
        skills_cursor = skills_collection.find({"_id": {"$in": list(all_skill_ids)}})
        for skill in skills_cursor:
            skill_map[str(skill["_id"])] = skill["name"]

    # Bulk fetch work modes
    workmode_map = {}
    if all_workmode_ids:
        workmodes_collection = database["workmodes"]
        workmodes_cursor = workmodes_collection.find({"_id": {"$in": list(all_workmode_ids)}})
        for wm in workmodes_cursor:
            workmode_map[str(wm["_id"])] = wm["name"]

    # Replace IDs with names
    for job in raw_jobs:
        if "requiredSkills" in job and isinstance(job["requiredSkills"], list):
            new_skills = []
            for skill_id in job["requiredSkills"]:
                skill_str = str(skill_id)
                if skill_str in skill_map:
                    new_skills.append(skill_map[skill_str])
                else:
                    new_skills.append(skill_str)
            job["requiredSkills"] = new_skills
        
        if "workMode" in job and job["workMode"]:
            wm_str = str(job["workMode"])
            if wm_str in workmode_map:
                job["workMode"] = workmode_map[wm_str]

        jobs.append(job)

    return jobs


def get_normal_job_posts(recommended_jobs: List[Dict[str, Any]]):
    """
    Fetch normal job posts from the database based on recommended job IDs with same order.
    Populates user information for job posts.
    """
    database = get_db()
    if database is None:
        return []

    collection = database["posts"]
    users_collection = database["users"]

    job_ids = [ObjectId(job["jobId"]) for job in recommended_jobs if "jobId" in job]

    cursor = collection.find({"jobPostId": {"$in": job_ids}})
    
    print("Job IDs to fetch:", job_ids)

    # Collect all user IDs that need to be populated
    user_ids_to_fetch = set()
    raw_jobs = []
    
    for document in cursor:
        raw_jobs.append(document)
        # Check if user field exists and needs to be populated
        if "user" in document:
            user_value = document["user"]
            # Handle both ObjectId and string user IDs
            if isinstance(user_value, ObjectId):
                user_ids_to_fetch.add(user_value)
            elif isinstance(user_value, str):
                # Convert string to ObjectId for fetching
                try:
                    user_ids_to_fetch.add(ObjectId(user_value))
                except:
                    pass  # Invalid ObjectId string, skip

    # Bulk fetch user information
    user_map = {}
    if user_ids_to_fetch:
        users_cursor = users_collection.find({"_id": {"$in": list(user_ids_to_fetch)}})
        for user in users_cursor:
            user_id = str(user["_id"])
            user_map[user_id] = {
                "_id": user_id,
                "email": user.get("email"),
                "firstName": user.get("firstName"),
                "lastName": user.get("lastName"),
                "imageUrl": user.get("imageUrl")
            }

    # Process documents: populate users and convert ObjectIds
    jobs = []
    for document in raw_jobs:
        # Populate user field if it's an ObjectId or string ID
        if "user" in document:
            user_value = document["user"]
            if isinstance(user_value, (ObjectId, str)):
                user_id_str = str(user_value)
                if user_id_str in user_map:
                    document["user"] = user_map[user_id_str]
                else:
                    # If user not found, keep as string
                    document["user"] = user_id_str
        
        # Convert all ObjectId fields to strings for JSON serialization
        for key, value in document.items():
            if isinstance(value, ObjectId):
                document[key] = str(value)
            elif isinstance(value, list):
                document[key] = [str(v) if isinstance(v, ObjectId) else v for v in value]
            elif isinstance(value, dict) and key != "user":
                # Handle nested dictionaries (but skip user since we already processed it)
                for nested_key, nested_value in value.items():
                    if isinstance(nested_value, ObjectId):
                        value[nested_key] = str(nested_value)
        
        jobs.append(document)

    # Sort jobs to match the order of recommended_jobs
    id_to_job = {job["jobPostId"]: job for job in jobs}
    sorted_jobs = [id_to_job.get(str(ObjectId(job["jobId"]))) for job in recommended_jobs if str(ObjectId(job["jobId"])) in id_to_job]

    return sorted_jobs

if __name__ == "__main__":
    job_posts = get_job_posts()
    print(f"Fetched {len(job_posts)} job posts from the database.")