import { Router } from "express";
import {
  createInterviewQuestion,
  deleteInterviewQuestion,
  getInterviewQuestion,
  getInterviewQuestions,
  updateInterviewQuestion,
} from "../controllers/interviewQuestionController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/interview-questions
// @desc    Create a new interview question
// @access  Private
router.post("/", authenticated, createInterviewQuestion);

// @route   GET /api/interview-questions
// @desc    Get all interview questions (optionally by category)
// @access  Private
router.get("/", authenticated, getInterviewQuestions);

// @route   GET /api/interview-questions/:categoryId
// @desc    Get an interview question by categoryId
// @access  Private
router.get("/:categoryId", authenticated, getInterviewQuestion);

// @route   PUT /api/interview-questions/:questionId
// @desc    Update an interview question by ID
// @access  Private
router.put("/:questionId", authenticated, updateInterviewQuestion);

// @route   DELETE /api/interview-questions/:questionId
// @desc    Delete an interview question by ID
// @access  Private
router.delete("/:questionId", authenticated, deleteInterviewQuestion);

export default router;