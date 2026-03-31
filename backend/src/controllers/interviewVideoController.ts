// controllers/interviewVideoController.ts
import { Response } from "express";
import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";

export const uploadInterviewVideo = async (req: any, res: Response) => {
  try {
    const questionsJson = req.query.questions as string || null;
    const file = req.file
    const categoryId: string = req.body?.categoryId as string || req.query?.categoryId as string;
    let encodedQuestions = null;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    if (questionsJson) {
      // Parse and re-encode questions for FastAPI
      let questions;
      questions = JSON.parse(decodeURIComponent(questionsJson));
      encodedQuestions = encodeURIComponent(JSON.stringify(questions));
    }

    // Create a readable stream from buffer
    const fileStream = Readable.from(file.buffer);

    const formData = new FormData();
    formData.append("file", fileStream, {
      filename: file.originalname,
      contentType: file.mimetype,
      knownLength: file.size,
    });

    const response = await axios.post(`${process.env.FASTAPI_BASE_URL || 'http://127.0.0.1:8000'}/api/interview_video/upload?categoryId=${encodeURIComponent(categoryId)}&questions=${encodedQuestions}`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
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