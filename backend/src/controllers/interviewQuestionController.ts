import { Request, Response } from "express";
import { IInterviewQuestion, InterviewQuestion } from "../models/InterviewQuestion";

/**
 * @desc Create a new interview question
 * @route POST /api/interview-questions
 * @access Private
 */
export const createInterviewQuestion = async (req: Request, res: Response) => {
  try {
    const { question, answer, categoryId, difficulty } = req.body;
    const newQuestion: IInterviewQuestion = new InterviewQuestion({
      question,
      answer,
      categoryId,
      difficulty,
    });

    await newQuestion.save();
    res.status(201).json(newQuestion);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all interview questions (optionally filtered by category)
 * @route GET /api/interview-questions
 * @access Private
 */
export const getInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    console.log(categoryId);

    const filter = categoryId ? { categoryId } : {};
    const questions: IInterviewQuestion[] = await InterviewQuestion.find(filter, {
      _id: 1,
      question: 1,
      answer: 1,
      difficulty: 1,
      categoryId: 1,
    });

    // convert _id and categoryId to string for frontend
    const formatted = questions.map((q) => ({
      _id: q.id.toString(),
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
      categoryId: q.categoryId.toString(),
    }));

    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get an interview question by categoryId
 * @route GET /api/interview-questions/:categoryId
 * @access Private
 */
export const getInterviewQuestion = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params || req.query; 

    const question: any = await InterviewQuestion.findOne({ categoryId });
    if (!question) return res.status(404).json({ message: "Question not found" });

    res.json(question);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update an interview question by ID
 * @route PUT /api/interview-questions/:questionId
 * @access Private
 */
export const updateInterviewQuestion = async (req: Request, res: Response) => {
  try {
    const { question, answer, difficulty, categoryId } = req.body;

    const updatedQuestion = await InterviewQuestion.findByIdAndUpdate(
      req.params.questionId,
      { question, answer, difficulty, categoryId },
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) return res.status(404).json({ message: "Question not found" });

    res.json(updatedQuestion);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete an interview question by ID
 * @route DELETE /api/interview-questions/:questionId
 * @access Private
 */
export const deleteInterviewQuestion = async (req: Request, res: Response) => {
  try {
    const deletedQuestion = await InterviewQuestion.findByIdAndDelete(req.params.questionId);

    if (!deletedQuestion) return res.status(404).json({ message: "Question not found" });

    res.json({ message: "Question deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};