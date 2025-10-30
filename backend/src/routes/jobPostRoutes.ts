import { Router } from "express";
import {
  bulkDeleteJobPostsByRecruiter,
  createJobPost,
  deleteJobPost,
  findJobs,
  getJobPost,
  getMyJobPosts,
  getRecentJobPosts,
  toggleJobPostStatus,
  updateJobPost,
} from "../controllers/jobPostController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/job-posts
// @desc    Create a new job post
// @access  Private (Recruiter)
router.post("/", authenticated, createJobPost);

// @route   GET /api/job-posts
// @desc    Get all active job posts
// @access  Public
router.get("/", authenticated, findJobs);

// @route   GET /api/job-posts/me
// @desc    Get job posts created by the logged-in recruiter
// @access  Private (Recruiter)
router.get("/me", authenticated, getMyJobPosts);

// @route   GET /api/job-posts/recent
// @desc    Get recently created job posts (for dashboard)
// @access  Private (Admin/Recruiter)
router.get("/recent", authenticated, getRecentJobPosts);

// @route   GET /api/job-posts/:jobPostId
// @desc    Get a single job post by ID
// @access  Public
router.get("/:jobPostId", authenticated, getJobPost);

// @route   PUT /api/job-posts/:jobPostId
// @desc    Update a job post
// @access  Private (Recruiter)
router.put("/:jobPostId", authenticated, updateJobPost);

// @route   PUT /api/job-posts/:jobPostId/toggle
// @desc    Toggle job post active/inactive
// @access  Private (Recruiter)
router.put("/:jobPostId/toggle", authenticated, toggleJobPostStatus);

// @route   DELETE /api/job-posts/:jobPostId
// @desc    Delete a job post
// @access  Private (Recruiter)
router.delete("/:jobPostId", authenticated, deleteJobPost);

// @route   DELETE /api/job-posts/recruiter/:recruiterId
// @desc    Bulk delete job posts by recruiter
// @access  Private (Admin)
router.delete("/recruiter/:recruiterId", authenticated, bulkDeleteJobPostsByRecruiter);

export default router;
