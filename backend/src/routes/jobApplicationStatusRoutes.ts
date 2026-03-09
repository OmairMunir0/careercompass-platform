import { Router } from "express";
import {
  createJobApplicationStatus,
  deleteJobApplicationStatus,
  getJobApplicationStatus,
  getJobApplicationStatuses,
  updateJobApplicationStatus,
} from "../controllers/jobApplicationStatusController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/job-application-statuses
// @desc    Create a new job application status
// @access  Private
router.post("/", authenticated, createJobApplicationStatus);

// @route   GET /api/job-application-statuses
// @desc    Get all job application statuses
// @access  Private
router.get("/", authenticated, getJobApplicationStatuses);

// @route   GET /api/job-application-statuses/:jobApplicationStatusId
// @desc    Get a job application status by ID
// @access  Private
router.get("/:jobApplicationStatusId", authenticated, getJobApplicationStatus);

// @route   PUT /api/job-application-statuses/:jobApplicationStatusId
// @desc    Update a job application status by ID
// @access  Private
router.put("/:jobApplicationStatusId", authenticated, updateJobApplicationStatus);

// @route   DELETE /api/job-application-statuses/:jobApplicationStatusId
// @desc    Delete a job application status by ID
// @access  Private
router.delete("/:jobApplicationStatusId", authenticated, deleteJobApplicationStatus);

export default router;
