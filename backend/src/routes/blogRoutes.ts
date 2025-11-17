import { Router } from "express";
import {
  addComment,
  createBlog,
  deleteBlog,
  deleteComment,
  getAllBlogs,
  getBlogById,
  toggleLike,
  updateBlog,
} from "../controllers/blogController";
import { authenticated, requireRole } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// @route   GET /api/blogs
// @desc    Get all blogs (paginated)
// @access  Public
router.get("/", getAllBlogs);

// @route   GET /api/blogs/:id
// @desc    Get a single blog by ID
// @access  Public
router.get("/:id", getBlogById);

// @route   POST /api/blogs
// @desc    Create a new blog
// @access  Private
router.post("/", authenticated, upload.single("blogImage"), createBlog);

// @route   PUT /api/blogs/:id
// @desc    Update a blog
// @access  Private (Owner or Admin)
router.put("/:id", authenticated, upload.single("blogImage"), updateBlog);

// @route   DELETE /api/blogs/:id
// @desc    Delete a blog
// @access  Private (Owner or Admin)
router.delete("/:id", authenticated, deleteBlog);

// @route   PUT /api/blogs/:id/like
// @desc    Like/Unlike a blog
// @access  Private
router.put("/:id/like", authenticated, toggleLike);

// @route   POST /api/blogs/:id/comments
// @desc    Add a comment to a blog
// @access  Private
router.post("/:id/comments", authenticated, addComment);

// @route   DELETE /api/blogs/:id/comments/:commentId
// @desc    Delete a comment from a blog
// @access  Private (Owner or Admin)
router.delete("/:id/comments/:commentId", authenticated, deleteComment);

export default router;

