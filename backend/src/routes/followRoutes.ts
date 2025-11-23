import { Router } from "express";
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus,
  getFollowSuggestions,
  getFollowStats,
} from "../controllers/followController";
import { authenticated } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticated);

// @route   POST /api/follows/:userId
// @desc    Follow a user
// @access  Private
router.post("/:userId", followUser);

// @route   DELETE /api/follows/:userId
// @desc    Unfollow a user
// @access  Private
router.delete("/:userId", unfollowUser);

// @route   GET /api/follows/followers/:userId
// @desc    Get followers of a user
// @access  Private
router.get("/followers/:userId", getFollowers);

// @route   GET /api/follows/following/:userId
// @desc    Get users that a user is following
// @access  Private
router.get("/following/:userId", getFollowing);

// @route   GET /api/follows/status/:userId
// @desc    Check if current user follows a specific user
// @access  Private
router.get("/status/:userId", getFollowStatus);

// @route   GET /api/follows/suggestions
// @desc    Get follow suggestions
// @access  Private
router.get("/suggestions", getFollowSuggestions);

// @route   GET /api/follows/stats/:userId
// @desc    Get follow statistics for a user
// @access  Private
router.get("/stats/:userId", getFollowStats);

export default router;
