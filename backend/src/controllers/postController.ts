import { Request, Response } from "express";
import { Post } from "../models/Post";
import { User } from "../models/User";
import {
  FREE_CHARACTER_LIMIT,
  getCharacterLimitForUser,
  PREMIUM_CHARACTER_LIMIT,
  syncSubscriptionStatus,
} from "../utils/subscription";
import { getCached, setCached, CACHE_TTL, invalidateCache } from "../utils/cache";

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

    const dbUser = await User.findById(req.user.id);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    await syncSubscriptionStatus(dbUser);
    const characterLimit = getCharacterLimitForUser(dbUser);
    const trimmedContent = content.trim();

    if (trimmedContent.length > characterLimit) {
      const upgradeMessage =
        characterLimit === FREE_CHARACTER_LIMIT
          ? `Upgrade to Premium to unlock up to ${PREMIUM_CHARACTER_LIMIT} characters.`
          : "";
      return res.status(400).json({
        message: `Post content exceeds the ${characterLimit} character limit. ${upgradeMessage}`.trim(),
      });
    }

    const imageUrl = req.file ? `/uploads/post-images/${req.file.filename}` : null;

    const post = await Post.create({
      user: req.user.id,
      content: trimmedContent,
      imageUrl,
    });

    // Invalidate posts cache
    await invalidateCache(["posts:*"]);

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
    const cacheKey = "posts:all";
    
    // Try to get from cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const posts = await Post.find()
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
      })
      .sort({ createdAt: -1 });

    // Cache the result
    await setCached(cacheKey, posts, CACHE_TTL.SHORT);

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
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
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
    const cacheKey = `posts:${req.params.postId}`;
    
    // Try to get from cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const post = await Post.findById(req.params.postId)
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
      });

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Cache the result
    await setCached(cacheKey, post, CACHE_TTL.MEDIUM);

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

    const dbUser = await User.findById(req.user.id);
    if (!dbUser) return res.status(404).json({ message: "User not found" });

    await syncSubscriptionStatus(dbUser);
    const characterLimit = getCharacterLimitForUser(dbUser);

    if (content && content.trim().length > characterLimit) {
      return res.status(400).json({
        message: `Post content exceeds the ${characterLimit} character limit.`,
      });
    }

    const post = await Post.findOneAndUpdate(
      { _id: req.params.postId, user: req.user.id },
      { content: content?.trim(), imageUrl },
      { new: true, runValidators: true }
    );

    if (!post) return res.status(404).json({ message: "Post not found or unauthorized" });
    
    // Invalidate posts cache
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
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
    
    // Invalidate posts cache
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
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
    
    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
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
    
    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
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

    const updated = await Post.findById(req.params.postId)
      .populate("comments.user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email",
      });

    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);

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

    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);

    res.status(200).json({ message: "Comment deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add a reply to a comment
 * @route POST /api/posts/:postId/comments/:commentId/replies
 * @access Private
 */
export const addReply = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: "Content is required" });

    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ user: req.user.id, content: content.trim() });
    await post.save();

    const updated = await Post.findById(req.params.postId)
      .populate("comments.user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email",
      });

    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);

    res.status(201).json({ message: "Reply added", post: updated });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get recent posts (for dashboard)
 * @route GET /api/posts/recent
 * @access Private (Admin)
 */
/**
 * @desc Get trending posts (most liked and commented)
 * @route GET /api/posts/trending
 * @access Public
 */
export const getTrendingPosts = async (_req: Request, res: Response) => {
  try {
    const cacheKey = "posts:trending";
    
    // Try to get from cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const posts = await Post.find()
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
      })
      .sort({ likes: -1, "comments.length": -1 })
      .limit(5);

    // Cache the result
    await setCached(cacheKey, posts, CACHE_TTL.SHORT);

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const getRecentPosts = async (_req: Request, res: Response) => {
  try {
    const cacheKey = "posts:recent";
    
    // Try to get from cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
      });

    // Cache the result
    await setCached(cacheKey, posts, CACHE_TTL.SHORT);

    res.status(200).json(posts);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
