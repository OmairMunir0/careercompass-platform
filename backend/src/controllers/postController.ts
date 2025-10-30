import { Request, Response } from "express";
import { Post } from "../models/Post";

/**
 * @desc Create a new post
 * @route POST /api/posts
 * @access Private
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const imageUrl = req.file ? `/uploads/post-images/${req.file.filename}` : null;

    const post = await Post.create({
      user: req.user.id,
      content: content.trim(),
      imageUrl,
    });

    res.status(201).json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all posts (feed)
 * @route GET /api/posts
 * @access Public
 */
export const getAllPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .populate("user", "firstName lastName email")
      .populate({
        path: "comments.user",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get posts by logged-in user
 * @route GET /api/posts/me
 * @access Private
 */
export const getMyPosts = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const posts = await Post.find({ user: req.user.id })
      .populate("user", "firstName lastName email")
      .populate({
        path: "comments.user",
        select: "firstName lastName email",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single post by ID
 * @route GET /api/posts/:postId
 * @access Public
 */
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId)
      .populate("user", "firstName lastName email")
      .populate({
        path: "comments.user",
        select: "firstName lastName email",
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a post (only by owner)
 * @route PUT /api/posts/:postId
 * @access Private
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { content, imageUrl } = req.body;

    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, user: req.user.id },
      { content, imageUrl },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.status(200).json(post);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a post (only by owner)
 * @route DELETE /api/posts/:postId
 * @access Private
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await Post.findOneAndDelete({
      _id: req.params.postId,
      user: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Post not found or unauthorized" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Like a post
 * @route PUT /api/posts/:postId/like
 * @access Private
 */
export const likePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes += 1;
    await post.save();
    res.status(200).json({ message: "Post liked", likes: post.likes });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Unlike a post
 * @route PUT /api/posts/:postId/unlike
 * @access Private
 */
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = Math.max(0, post.likes - 1);
    await post.save();
    res.status(200).json({ message: "Post unliked", likes: post.likes });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add a comment to a post
 * @route POST /api/posts/:postId/comments
 * @access Private
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user.id, content });
    await post.save();

    const updated = await Post.findById(req.params.postId).populate("comments.user", "name email");

    res.status(201).json({ message: "Comment added", post: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a comment from a post
 * @route DELETE /api/posts/:postId/comments/:commentId
 * @access Private
 */
/**
 * @desc Delete a comment from a post
 * @route DELETE /api/posts/:postId/comments/:commentId
 * @access Private
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.user !== req.user.id)
      return res.status(403).json({ message: "Not authorized to delete this comment" });

    comment.deleteOne();
    await post.save();

    res.status(200).json({ message: "Comment deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get recent posts (for dashboard)
 * @route GET /api/posts/recent
 * @access Private (Admin)
 */
export const getRecentPosts = async (_req: Request, res: Response) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email");

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
