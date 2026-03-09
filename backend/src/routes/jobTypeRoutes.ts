import { Router } from "express";
import {
  bulkDeleteJobTypes,
  createJobType,
  deleteJobType,
  getJobType,
  getJobTypes,
  updateJobType,
} from "../controllers/jobTypeController";
import { authenticated, requireRole } from "../middleware/auth";

const router = Router();

// @route   POST /api/job-types
// @desc    Create a new job type
// @access  Private (Admin)
router.post("/", authenticated, requireRole(["admin"]), createJobType);

// @route   GET /api/job-types
// @desc    Get all job types
// @access  Public
router.get("/", getJobTypes);

// @route   GET /api/job-types/:id
// @desc    Get a single job type by ID
// @access  Public
router.get("/:id", getJobType);

// @route   PUT /api/job-types/:id
// @desc    Update a job type
// @access  Private (Admin)
router.put("/:id", authenticated, requireRole(["admin"]), updateJobType);

// @route   DELETE /api/job-types/:id
// @desc    Delete a job type
// @access  Private (Admin)
router.delete("/:id", authenticated, requireRole(["admin"]), deleteJobType);

// @route   DELETE /api/job-types
// @desc    Bulk delete all job types
// @access  Private (Admin)
router.delete("/", authenticated, requireRole(["admin"]), bulkDeleteJobTypes);

export default router;
