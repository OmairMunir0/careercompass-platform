import { Router } from "express";
import {
  bulkDeleteUserSavedJobs,
  checkIfJobIsSaved,
  deleteSavedJob,
  getMySavedJobs,
  saveJob,
} from "../controllers/savedJobController";
import { authenticated, requireRole } from "../middleware/auth";

const router = Router();

// @route   POST /api/saved-jobs
// @desc    Save a job (add to user's saved jobs)
// @access  Private
router.post("/", authenticated, saveJob);

// @route   GET /api/saved-jobs
// @desc    Get all saved jobs for the logged-in user
// @access  Private
router.get("/", authenticated, getMySavedJobs);

// @route   GET /api/saved-jobs/check/:jobId
// @desc    Check if a job is saved by the user
// @access  Private
router.get("/check/:jobId", authenticated, checkIfJobIsSaved);

// @route   DELETE /api/saved-jobs/:savedJobId
// @desc    Remove a saved job by ID
// @access  Private
router.delete("/:savedJobId", authenticated, deleteSavedJob);

// @route   DELETE /api/saved-jobs
// @desc    Bulk delete saved jobs for a user (system/admin)
// @access  Private (System/Admin)
router.delete("/", authenticated, requireRole(["admin"]), bulkDeleteUserSavedJobs);

export default router;
