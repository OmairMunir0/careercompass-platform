import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import { JobPost } from "../models/JobPost";
import axios from "axios";
import path from "path";
import { file } from "zod";

// Define the interface for the request body expecting `jobId`
interface AtsRequestBody {
    jobId: string;
}

export const analyzeResume = async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId as string;
        const jobId = req.body.jobId as string;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (!jobId) {
            return res.status(400).json({ message: "Job ID is required" });
        }

        // 1. Fetch User to get Resume Path
        const user = await User.findById(userId);
        if (!user || !user.resumeUrl) {
            return res.status(404).json({ message: "User resume not found. Please upload a resume first." });
        }

        // Use local file system path so FastAPI can read it directly
        const resumePath = path.join(process.cwd(), user.resumeUrl);

        // 2. Fetch Job Description with all details
        const job = await JobPost.findById(jobId)
            .populate("jobType")
            .populate("workMode")
            .populate("experienceLevel")
            .populate("requiredSkills");

        if (!job) {
            return res.status(404).json({ message: "Job post not found" });
        }

        // 3. Call FastAPI Service
        const fastApiUrl = process.env.FASTAPI_BASE_URL || "http://localhost:8000";

        // Determine file type from extension
        const fileExt = path.extname(resumePath).toLowerCase().replace(".", "");
        const fileType = fileExt === "docx" ? "docx" : "pdf";

        // Construct a comprehensive job description string provided context to the ATS
        const overallJobDescription = `
            Job Title: ${job.title}
            Location: ${job.location || "Not specified"}
            Job Type: ${(job.jobType as any)?.name || "Not specified"}
            Work Mode: ${(job.workMode as any)?.name || "Not specified"}
            Experience Level: ${(job.experienceLevel as any)?.name || "Not specified"}
            
            Description:
            ${job.description}
            
            Required Skills:
            ${job.requiredSkills.map((s: any) => s.name).join(", ")}
        `.trim();

        const payload = {
            resume_path: resumePath,
            job_description: overallJobDescription,
            file_type: fileType
        };

        const fastApiRes = await axios.post(`${fastApiUrl}/api/ats/analyze`, payload);

        if (fastApiRes.data.success) {
            return res.status(200).json({ success: true, data: fastApiRes.data.data });
        } else {
            return res.status(500).json({ message: "ATS Analysis failed", error: fastApiRes.data.error });
        }

    } catch (error: any) {
        console.error("ATS Analysis Error:", error.message);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
