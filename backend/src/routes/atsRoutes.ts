import { Router } from "express";
import { analyzeResume } from "../controllers/atsController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/ats/analyze
// @desc    Analyze resume against a job using FastAPI ATS service
// @access  Private
router.post("/analyze", authenticated, analyzeResume);

export default router;
