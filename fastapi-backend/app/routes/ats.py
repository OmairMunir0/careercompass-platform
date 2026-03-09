from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.utils.ats_score import analyze_resume
import os

router = APIRouter()

class AtsAnalysisRequest(BaseModel):
    resume_path: str
    job_description: str
    file_type: str = "pdf"

@router.post("/analyze")
async def analyze_ats(request: AtsAnalysisRequest):
    try:
        if not os.path.exists(request.resume_path):
             return {"success": False, "error": f"Resume file not found at path: {request.resume_path}"}
        
        results = analyze_resume(request.resume_path, request.job_description, request.file_type)
        print(results)
        
        if "error" in results:
             return {"success": False, "error": results["error"]}

        return {"success": True, "data": results}
    except Exception as e:
        return {"success": False, "error": str(e)}
