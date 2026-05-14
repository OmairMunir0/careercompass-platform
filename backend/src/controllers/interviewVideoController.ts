// controllers/interviewVideoController.ts
import { Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

export const uploadInterviewVideo = async (req: any, res: Response) => {
  try {
    const questionsJson = req.query.questions as string || null;
    const timestampsJson = req.query.timestamps as string || null;
    const file = req.file;
    const categoryId: string = req.body?.categoryId as string || req.query?.categoryId as string;
    let encodedQuestions = null;
    let encodedTimestamps = "[]";

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (questionsJson) {
      let questions = JSON.parse(decodeURIComponent(questionsJson));
      encodedQuestions = encodeURIComponent(JSON.stringify(questions));
    }
    if (timestampsJson) {
      let stamps = JSON.parse(decodeURIComponent(timestampsJson));
      encodedTimestamps = encodeURIComponent(JSON.stringify(stamps));
    }

    const fileStream = Readable.from(file.buffer);

    const formData = new FormData();
    formData.append("file", fileStream, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });

    const fastApiUrl = `${process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000'}/api/interview_video/upload?categoryId=${encodeURIComponent(categoryId)}&questions=${encodedQuestions}&timestamps=${encodedTimestamps}`;

    const response = await axios.post(fastApiUrl, formData, {
      headers: { ...formData.getHeaders() },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return res.json({
      message: "Video successfully sent to FastAPI for background processing",
      job_id: response.data.job_id
    });
  } catch (err: any) {
    console.error("Upload error:", err.response?.data || err.message);
    return res.status(500).json({
      message: "Error sending video to FastAPI",
      error: err.response?.data || err.message,
    });
  }
};

export const getInterviewVideoStatus = async (req: any, res: Response) => {
  try {
    const { jobId } = req.params;
    const response = await axios.get(`${process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000'}/api/interview_video/status/${jobId}`);
    return res.json(response.data);
  } catch (err: any) {
    return res.status(err.response?.status || 500).json({ 
      error: err.response?.data || err.message 
    });
  }
};

export const generateQuestions = async (req: any, res: Response) => {
  try {
    const { userId, numQuestions, useAI } = req.query;
    
    // Try FastAPI first, but have a fallback
    try {
      const response = await axios.post(`${'http://127.0.0.1:8000'}/api/interview_video/generate-questions`, {}, {
        params: { userId, numQuestions, useAI }
      });
      
      return res.json(response.data);
    } catch (fastapiError: any) {
      console.warn("FastAPI question generation failed, using fallback:", fastapiError.message);
      
      // Fallback question generation
      const questionCount = parseInt(numQuestions as string) || 5;
      const fallbackQuestions = generateFallbackQuestions(questionCount);
      
      return res.json({
        success: true,
        questions: fallbackQuestions,
        question_count: fallbackQuestions.length,
        user_profile: {
          position: "Professional",
          experienceLevel: "Entry-Level",
          yearsExperience: 0,
          skills: [],
          location: "Anywhere"
        },
        fallback: true
      });
    }
  } catch (err: any) {
    console.error("Generate questions error:", err.response?.data || err.message);
    return res.status(err.response?.status || 500).json({
      error: err.response?.data || err.message,
    });
  }
};

// Fallback question generator
function generateFallbackQuestions(numQuestions: number): string[] {
  const baseQuestions = [
    "Tell me about yourself and your professional experience.",
    "What motivated you to pursue this career path?",
    "Describe a challenging project you've worked on and how you handled it.",
    "How do you approach problem-solving in your work?",
    "What are your greatest strengths and how do you apply them?",
    "How do you handle constructive criticism and feedback?",
    "Describe a time you had to learn a new skill quickly.",
    "How do you prioritize tasks when managing multiple projects?",
    "What are your career goals for the next few years?",
    "How do you stay updated with industry trends and technologies?",
    "Describe your experience working in a team environment.",
    "How do you handle pressure and tight deadlines?",
    "What makes you a good fit for this position?",
    "How do you measure your own success?",
    "What areas are you looking to improve professionally?"
  ];
  
  // Shuffle and select the requested number of questions
  const shuffled = [...baseQuestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(numQuestions, baseQuestions.length));
}