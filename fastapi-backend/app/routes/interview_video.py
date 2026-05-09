from fastapi import APIRouter, UploadFile, File, Query, HTTPException, BackgroundTasks
import os
import uuid
from typing import Dict, List, Optional
from sentence_transformers import SentenceTransformer
import google.generativeai as genai
import json
import urllib.parse
from dotenv import load_dotenv
from ..utils.analysis import ( save_uploaded_video, extract_audio_to_wav, transcribe_and_split, cleanup_temp_file)
from ..utils.accuracy import ( get_accuracy )
from ..utils.emotional_main import analyze_interview_video
from ..db.user_info import get_user_info

load_dotenv()  

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads/videos")
BASE_URL = os.getenv("FASTAPI_BASE_URL", "http://127.0.0.1:8000")
MODEL = os.getenv("MODEL_NAME")
ANSWER_TIME = os.getenv("ANSWER_TIME", 40)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Configure Gemini
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

os.makedirs(UPLOAD_DIR, exist_ok=True)

router = APIRouter()

# In-memory job tracker for async background operations
job_results: Dict[str, dict] = {}

# Question templates for different experience levels
QUESTION_TEMPLATES = {
    "Internship": [
        "Tell me about a project you've worked on that used {skill}.",
        "What motivated you to learn {skill}?",
        "Describe a challenge you faced while learning {skill}.",
        "How do you approach problem-solving when working with {skill}?",
        "What resources do you use to stay updated with {skill}?"
    ],
    "Entry-Level": [
        "Can you walk me through a project where you used {skill} to solve a business problem?",
        "How do you ensure code quality when working with {skill}?",
        "Describe a time you had to learn a new technology quickly. How did you approach it?",
        "How do you collaborate with team members on {skill} projects?",
        "What's the most complex problem you've solved using {skill}?"
    ],
    "Mid-Level": [
        "Tell me about a time you had to make architectural decisions involving {skill}.",
        "How do you balance technical debt with feature delivery when working with {skill}?",
        "Describe a situation where you mentored junior developers in {skill}.",
        "How do you approach performance optimization in {skill} applications?",
        "Can you discuss a trade-off you made in a {skill} project and why?"
    ],
    "Senior-Level": [
        "How do you drive technical strategy and best practices for {skill} in your team?",
        "Describe a complex system you designed using {skill} and the rationale behind your decisions.",
        "How do you evaluate and introduce new technologies related to {skill}?",
        "Tell me about a time you had to influence stakeholders on a technical decision involving {skill}.",
        "How do you scale teams and processes around {skill} development?"
    ],
    "Executive": [
        "How do you align technology investments with business goals, especially regarding {skill}?",
        "Describe your approach to building and scaling engineering organizations around {skill}.",
        "How do you evaluate technology risks and opportunities related to {skill} at the organizational level?",
        "Tell me about a time you had to pivot technical strategy involving {skill}.",
        "How do you foster innovation and technical excellence around {skill} across multiple teams?"
    ]
}

# Behavioral and situational questions
BEHAVIORAL_QUESTIONS = [
    "Tell me about a time you had to deal with a difficult team member.",
    "Describe a situation where you had to meet a tight deadline.",
    "How do you handle constructive criticism?",
    "Tell me about a project you're most proud of and why.",
    "Describe a time you had to adapt to significant changes.",
    "How do you prioritize your work when multiple projects demand your attention?",
    "Tell me about a mistake you made and what you learned from it.",
    "How do you stay motivated when working on long-term projects?"
]

def generate_dynamic_questions(user_profile: Dict, num_questions: int = 5) -> List[str]:
    """
    Generate dynamic interview questions based on user profile
    """
    if not user_profile:
        return ["Tell me about yourself and your experience."] * num_questions
    
    questions = []
    experience_level = user_profile.get("experienceLevel", "Entry-Level")
    skills = user_profile.get("skills", [])
    position = user_profile.get("position", "Professional")
    years_experience = user_profile.get("yearsExperience", 0)
    
    # Get question templates for the experience level
    templates = QUESTION_TEMPLATES.get(experience_level, QUESTION_TEMPLATES["Entry-Level"])
    
    # Generate skill-specific questions
    skill_questions = []
    for skill in skills[:3]:  # Focus on top 3 skills
        skill_template = templates[len(skill_questions) % len(templates)]
        skill_question = skill_template.format(skill=skill)
        skill_questions.append(skill_question)
    
    # Add position-specific questions
    position_questions = []
    if position and position.lower() != "professional":
        position_questions.extend([
            f"What attracted you to the {position} role?",
            f"How do you see yourself growing in a {position} position?"
        ])
    
    # Add experience-specific questions
    experience_questions = []
    if years_experience > 0:
        if years_experience < 2:
            experience_questions.append("How do you plan to grow your technical skills in the coming years?")
        elif years_experience < 5:
            experience_questions.append("What's been your biggest learning experience so far?")
        else:
            experience_questions.append("How has your approach to software development evolved over the years?")
    
    # Add behavioral questions
    behavioral_questions = BEHAVIORAL_QUESTIONS[:2]
    
    # Combine all questions and select the required number
    all_questions = skill_questions + position_questions + experience_questions + behavioral_questions
    
    # If we don't have enough questions, add some generic ones
    while len(all_questions) < num_questions:
        generic_templates = [
            "What do you consider your greatest strength?",
            "What areas are you looking to improve?",
            "How do you approach learning new technologies?",
            "What kind of work environment do you thrive in?"
        ]
        all_questions.append(generic_templates[len(all_questions) % len(generic_templates)])
    
    # Return the requested number of questions
    return all_questions[:num_questions]

def generate_ai_questions(user_profile: Dict, num_questions: int = 5) -> List[str]:
    """
    Generate AI-powered questions using Google Gemini based on user profile
    """
    if not GEMINI_API_KEY:
        return generate_dynamic_questions(user_profile, num_questions)
    
    try:
        # Create a detailed prompt for question generation
        prompt = f"""
Generate {num_questions} personalized interview questions for a candidate with the following profile:

Position: {user_profile.get('position', 'Professional')}
Experience Level: {user_profile.get('experienceLevel', 'Entry-Level')}
Years of Experience: {user_profile.get('yearsExperience', 0)}
Skills: {', '.join(user_profile.get('skills', []))}
Location: {user_profile.get('location', 'Anywhere')}
Bio: {user_profile.get('bio', 'No bio provided')}

Guidelines:
1. Questions should be tailored to their experience level
2. Include questions about their specific skills
3. Mix technical and behavioral questions
4. Questions should be open-ended and encourage detailed responses
5. Avoid generic questions unless necessary

Return only the questions as a JSON array of strings.
"""
        
        # Initialize Gemini model
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=500,
            )
        )
        
        questions_text = response.text.strip()
        
        # Try to parse as JSON, fallback if needed
        try:
            questions = json.loads(questions_text)
        except json.JSONDecodeError:
            # If JSON parsing fails, extract questions manually
            questions = []
            lines = questions_text.split('\n')
            for line in lines:
                line = line.strip()
                if line and (line.startswith('"') or line.startswith("'") or not line.startswith('[')):
                    # Clean up the line to extract just the question
                    clean_line = line.strip('"\'').strip()
                    if clean_line and '?' in clean_line:
                        questions.append(clean_line)
            
            # If still no questions, create from the text
            if not questions:
                questions = [questions_text]
        
        # Ensure we return the correct number of questions
        return questions[:num_questions] if isinstance(questions, list) else generate_dynamic_questions(user_profile, num_questions)
        
    except Exception as e:
        print(f"Error generating AI questions: {e}")
        # Fallback to template-based generation
        return generate_dynamic_questions(user_profile, num_questions)

def process_video_background(job_id: str, video_path: str, questions_list: list, timestamps_list: list):
    audio_path = None
    try:
        # 1. Update status
        job_results[job_id]["status"] = "processing"
        
        # 2. Extract audio
        audio_path = extract_audio_to_wav(video_path)

        # 3. Transcribe
        full_transcript, segmented_chuks = transcribe_and_split(audio_path, timestamps_list=timestamps_list, segment_duration=ANSWER_TIME)
        
        # 4. Fetch Accuracy
        analysis = get_accuracy(segmented_chuks, questions_list)
        
        # 5. Emotion Analysis
        emotions = analyze_interview_video(video_path, frame_interval_seconds=1, display_timeline=False)
        
        # Add public URL
        public_url = f"{BASE_URL}/videos/{os.path.basename(video_path)}"

        job_results[job_id] = {
            "status": "completed",
            "result": {
                "accuracy": {
                                "video_path": public_url,
                                "transcript": full_transcript,
                                "result": analysis["result"],         
                                "overall_score": analysis["overall_score"],     
                            },
                "emotions": emotions,
            }
        }
        print(f"[Job {job_id}] Processing completed successfully.")

    except Exception as e:
        print(f"[Job {job_id}] Processing failed: {e}")
        job_results[job_id] = {
            "status": "failed",
            "error": str(e)
        }
    finally:
        # Always clean up temporary audio file
        cleanup_temp_file(audio_path)
        
        # If we return a public_url to the video, deleting it removes access from the frontend!
        # Assuming the original code's deletion was intentional to prevent unbounded storage:
        if video_path and os.path.exists(video_path):
            try:
                os.unlink(video_path)
                print(f"[Cleanup] Deleted video file: {video_path}")
            except Exception as e:
                print(f"[Cleanup] Warning: Failed to delete video file {video_path}: {e}")
        
        mp4_path = os.path.splitext(video_path)[0] + ".mp4"
        if mp4_path != video_path and os.path.exists(mp4_path):
            try:
                os.unlink(mp4_path)
                print(f"[Cleanup] Deleted converted mp4 file: {mp4_path}")
            except Exception as e:
                print(f"[Cleanup] Warning: Failed to delete mp4 file {mp4_path}: {e}")


@router.post("/upload")
async def upload_video(background_tasks: BackgroundTasks,
                       file: UploadFile = File(...), 
                       categoryId: str = Query(..., description="MongoDB category ID for the skill"),
                       userId: str = Query(None, description="User ID for profile-based question generation"),
                       questions: str = Query(None),
                       timestamps: str = Query(None),
                       useDynamicQuestions: bool = Query(False, description="Generate questions based on user profile"),
                       numQuestions: int = Query(5, description="Number of questions to generate")) -> Dict:
    
    try:
        # 1. Save video immediately
        video_path = save_uploaded_video(file)
        
        # 2. Generate questions if needed
        if useDynamicQuestions and userId:
            user_profile = get_user_info(userId)
            questions_list = generate_ai_questions(user_profile, numQuestions)
        elif questions:
            questions_list = json.loads(urllib.parse.unquote(questions))
        else:
            # Default questions if none provided
            questions_list = [
                "Tell me about yourself and your experience.",
                "Describe a project you're proud of.",
                "How do you handle challenges in your work?",
                "What are your career goals?",
                "Why are you interested in this position?"
            ]
        
        timestamps_list = []
        if timestamps:
            timestamps_list = json.loads(urllib.parse.unquote(timestamps))

        # 3. Create job
        job_id = str(uuid.uuid4())
        job_results[job_id] = {"status": "pending"}

        # 4. Queue task
        background_tasks.add_task(process_video_background, job_id, video_path, questions_list, timestamps_list)
        
        return {
            "message": "Video accepted for processing",
            "job_id": job_id,
            "status": "pending",
            "questions": questions_list
        }

    except Exception as e:
        print(f"Error handling video upload: {e}")
        raise HTTPException(status_code=500, detail=f"Initialization failed: {e}")

@router.get("/status/{job_id}")
async def get_job_status(job_id: str) -> Dict:
    if job_id not in job_results:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return job_results[job_id]

@router.post("/generate-questions")
async def generate_questions(
    userId: str = Query(..., description="User ID for profile-based question generation"),
    numQuestions: int = Query(5, description="Number of questions to generate"),
    useAI: bool = Query(True, description="Use AI-powered question generation")
) -> Dict:
    
    try:
        # Get user profile
        user_profile = get_user_info(userId)
        
        if not user_profile:
            raise HTTPException(status_code=404, detail="User profile not found")
        
        # Generate questions
        if useAI:
            questions = generate_ai_questions(user_profile, numQuestions)
        else:
            questions = generate_dynamic_questions(user_profile, numQuestions)
        
        return {
            "success": True,
            "user_profile": {
                "position": user_profile.get("position"),
                "experienceLevel": user_profile.get("experienceLevel"),
                "yearsExperience": user_profile.get("yearsExperience"),
                "skills": user_profile.get("skills"),
                "location": user_profile.get("location")
            },
            "questions": questions,
            "question_count": len(questions)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error generating questions: {e}")
        raise HTTPException(status_code=500, detail=f"Question generation failed: {e}")

@router.get("/question-templates")
async def get_question_templates() -> Dict:
    """
    Get available question templates for different experience levels
    """
    return {
        "experience_levels": list(QUESTION_TEMPLATES.keys()),
        "templates": QUESTION_TEMPLATES,
        "behavioral_questions": BEHAVIORAL_QUESTIONS
    }