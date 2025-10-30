import { Router } from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getMyPosts,
  getPostById,
  getRecentPosts,
  likePost,
  unlikePost,
  updatePost,
} from "../controllers/postController";
import { authenticated, requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post("/", authenticated, upload.single("postImage"), createPost);

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Public
router.get("/", getAllPosts);

// @route   GET /api/posts/me
// @desc    Get posts by logged-in user
// @access  Private
router.get("/me", authenticated, getMyPosts);

// @route   GET /api/posts/recent
// @desc    Get recent posts (admin dashboard)
// @access  Private (Admin)
router.get("/recent", authenticated, requireRole(["recruiter"]), getRecentPosts);

// @route   GET /api/posts/:postId
// @desc    Get a single post by ID
// @access  Public
router.get("/:postId", getPostById);

// @route   PUT /api/posts/:postId
// @desc    Update a post (only by owner)
// @access  Private
router.put("/:postId", authenticated, updatePost);

// @route   DELETE /api/posts/:postId
// @desc    Delete a post (only by owner)
// @access  Private
router.delete("/:postId", authenticated, deletePost);

// @route   PUT /api/posts/:postId/like
// @desc    Like a post
// @access  Private
router.put("/:postId/like", authenticated, likePost);

// @route   PUT /api/posts/:postId/unlike
// @desc    Unlike a post
// @access  Private
router.put("/:postId/unlike", authenticated, unlikePost);

// @route   POST /api/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Private
router.post("/:postId/comments", authenticated, addComment);

// @route   DELETE /api/posts/:postId/comments/:commentId
// @desc    Delete a comment from a post
// @access  Private
router.delete("/:postId/comments/:commentId", authenticated, deleteComment);

export default router;
