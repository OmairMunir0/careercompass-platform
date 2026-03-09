import { Router } from "express";
import {
  createShortlistStatus,
  deleteShortlistStatus,
  getShortlistStatus,
  getShortlistStatuses,
  updateShortlistStatus,
} from "../controllers/shortlistStatusController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /arotei/shortlist-statuses
// @desc    Create a new shortlist status
// @access  Private
router.post("/", authenticated, createShortlistStatus);

// @route   GET /api/shortlist-statuses
// @desc    Get all shortlist statuses
// @access  Private
router.get("/", authenticated, getShortlistStatuses);

// @route   GET /api/shortlist-statuses/:shortlistStatusId
// @desc    Get a shortlist status by ID
// @access  Private
router.get("/:shortlistStatusId", authenticated, getShortlistStatus);

// @route   PUT /api/shortlist-statuses/:shortlistStatusId
// @desc    Update a shortlist status by ID
// @access  Private
router.put("/:shortlistStatusId", authenticated, updateShortlistStatus);

// @route   DELETE /api/shortlist-statuses/:shortlistStatusId
// @desc    Delete a shortlist status by ID
// @access  Private
router.delete("/:shortlistStatusId", authenticated, deleteShortlistStatus);

export default router;
