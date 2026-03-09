import { Router } from "express";
import {
  applyToJob,
  bulkDeleteApplications,
  deleteJobApplication,
  getApplicationsByStatus,
  getApplicationsForJob,
  getApplicationStats,
  getJobApplication,
  getJobApplications,
  getMyJobApplicationByJob,
  getMyJobApplications,
  getRecentApplications,
  getTopJobsByApplications,
  updateApplicationStatus,
  updateJobApplication,
  withdrawMyApplication,
} from "../controllers/jobApplicationController";
import { authenticated } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// @route   POST /api/job-applications
// @desc    Create a job application
// @access  Private
router.post("/", authenticated, upload.single("resume"), applyToJob);

// @route   GET /api/job-applications
// @desc    Get all job applications
// @access  Private
router.get("/", authenticated, getJobApplications);

// @route   GET /api/job-applications/me
// @desc    Get all job applications for logged-in user
// @access  Private
router.get("/me", authenticated, getMyJobApplications);

// @route   GET /api/job-applications/me/:jobId
// @desc    Get specific job application for logged-in user by job
// @access  Private
router.get("/me/:jobId", authenticated, getMyJobApplicationByJob);

// @route   PUT /api/job-applications/:applicationId/withdraw
// @desc    Withdraw an existing application (candidate)
// @access  Private
router.put("/:applicationId/withdraw", authenticated, withdrawMyApplication);

// @route   GET /api/job-applications/:applicationId
// @desc    Get a single job application by ID
// @access  Private
router.get("/:applicationId", authenticated, getJobApplication);

// @route   PUT /api/job-applications/:applicationId
// @desc    Update a job application by ID
// @access  Private
router.put("/:applicationId", authenticated, updateJobApplication);

// @route   DELETE /api/job-applications/:applicationId
// @desc    Delete a job application by ID
// @access  Private
router.delete("/:applicationId", authenticated, deleteJobApplication);

// @route   GET /api/job-applications/job/:jobId
// @desc    Get all applications for a specific job
// @access  Private (Recruiter/Admin)
router.get("/job/:jobId", authenticated, getApplicationsForJob);

// @route   PUT /api/job-applications/:applicationId/status
// @desc    Update job application status (recruiter/admin only)
// @access  Private (Recruiter/Admin)
router.put("/:applicationId/status", authenticated, updateApplicationStatus);

// @route   GET /api/job-applications/status/:statusId
// @desc    Get applications filtered by status
// @access  Private (Recruiter/Admin)
router.get("/status/:statusId", authenticated, getApplicationsByStatus);

// @route   GET /api/job-applications/stats
// @desc    Get application stats grouped by status
// @access  Private (Admin/Recruiter)
router.get("/stats", authenticated, getApplicationStats);

// @route   GET /api/job-applications/recent
// @desc    Get recent job applications
// @access  Private (Admin/Recruiter)
router.get("/recent", authenticated, getRecentApplications);

// @route   GET /api/job-applications/top-jobs
// @desc    Get top jobs by application count
// @access  Private (Admin)
router.get("/top-jobs", authenticated, getTopJobsByApplications);

// @route   DELETE /api/job-applications/job/:jobId
// @desc    Bulk delete applications for a job
// @access  Private (Admin)
router.delete("/job/:jobId", authenticated, bulkDeleteApplications);

export default router;
