import { Request, Response } from "express";
import { Types } from "mongoose";
import { Post } from "../models/Post";
import { User } from "../models/User";
import {
  FREE_CHARACTER_LIMIT,
  getCharacterLimitForUser,
  PREMIUM_CHARACTER_LIMIT,
  syncSubscriptionStatus,
} from "../utils/subscription";
import { getCached, setCached, CACHE_TTL, invalidateCache } from "../utils/cache";
import { createNotification } from "../utils/notifications";
import axios from "axios";

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
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || req.query.userId;
    const cacheKey = userId ? `posts:all:user:${userId}` : "posts:all";

    console.log(userId);
    
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
      .sort({ createdAt: -1 })
      .lean();
      
    const fastapiBase = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
    let recommendedJobs: any = null;
    try {
      if (userId) {
        const params = new URLSearchParams();
        params.set("user_id", userId);
        const url = `${fastapiBase}/api/timeline/job_posts?${params.toString()}`;
        const response = await axios.get(url);
        recommendedJobs = response.data;
        console.log(recommendedJobs);
      }
    } catch (e: any) {
      console.error("FastAPI timeline error:", e?.response?.data || e?.message);
    }

    // Handle backward compatibility: likes can be number (old) or array (new)
    // Add isLiked flag for authenticated users
    const postsWithLikedStatus = posts.map((post: any) => {
      const postObj = { ...post };
      
      // Handle both number (old) and array (new) formats
      let likesArray: any[] = [];
      let likesCount = 0;
      
      if (Array.isArray(post.likes)) {
        // New format - array of ObjectIds
        likesArray = post.likes || [];
        likesCount = post.likes.length;
      } else if (typeof post.likes === "number") {
        // Old format - just a count
        likesCount = post.likes;
        likesArray = [];
      } else if (post.likes === null || post.likes === undefined) {
        // No likes yet
        likesArray = [];
        likesCount = 0;
      }
      
      if (req.user) {
        // Check if current user liked this post
        // Handle both ObjectId objects and string IDs
        const userIdStr = req.user.id.toString();
        postObj.isLiked = likesArray.some((likeId: any) => {
          let id: string;
          if (likeId?._id) {
            id = likeId._id.toString();
          } else if (likeId?.toString) {
            id = likeId.toString();
          } else if (typeof likeId === 'string') {
            id = likeId;
          } else {
            id = String(likeId);
          }
          return id === userIdStr;
        });
      } else {
        postObj.isLiked = false;
      }
      
      // Return likes as count for backward compatibility
      postObj.likes = likesCount;
      return postObj;
    });

    // Cache the result
    await setCached(cacheKey, postsWithLikedStatus, CACHE_TTL.SHORT);

    res.status(200).json(postsWithLikedStatus);
  } catch (err: any) {
    console.error("Error in getAllPosts:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: err.message || "Failed to fetch posts" });
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
    const cacheKey = req.user ? `posts:${req.params.postId}:user:${req.user.id}` : `posts:${req.params.postId}`;
    
    // Try to get from cache
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    let post = await Post.findById(req.params.postId)
      .populate("user", "firstName lastName email imageUrl")
      .populate({
        path: "comments.user",
        select: "firstName lastName email imageUrl",
      })
      .populate({
        path: "comments.replies.user",
        select: "firstName lastName email imageUrl",
      })
      .lean();

    if (!post) return res.status(404).json({ message: "Post not found" });

    // Add isLiked flag
    const postObj: any = { ...post };
    
    // Handle both number (old) and array (new) formats
    let likesArray: any[] = [];
    let likesCount = 0;
    
    if (Array.isArray(post.likes)) {
      likesArray = post.likes;
      likesCount = post.likes.length;
    } else if (typeof post.likes === "number") {
      likesCount = post.likes;
      likesArray = [];
    }
    
    if (req.user) {
      // Check if current user liked this post
      const userIdStr = req.user.id.toString();
      postObj.isLiked = likesArray.some((likeId: any) => {
        let id: string;
        if (likeId?._id) {
          id = likeId._id.toString();
        } else if (likeId?.toString) {
          id = likeId.toString();
        } else if (typeof likeId === 'string') {
          id = likeId;
        } else {
          id = String(likeId);
        }
        return id === userIdStr;
      });
    } else {
      postObj.isLiked = false;
    }
    
    // Convert likes to count
    postObj.likes = likesCount;

    // Cache the result
    await setCached(cacheKey, postObj, CACHE_TTL.MEDIUM);

    res.status(200).json(postObj);
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

    const userId = new Types.ObjectId(req.user.id);
    
    // Handle backward compatibility: convert number to array if needed
    // Get the raw document to check the actual type
    const postDoc = post.toObject ? post.toObject() : post;
    let likesArray: Types.ObjectId[] = [];
    
    if (typeof (postDoc as any).likes === "number") {
      // Old format - start with empty array (can't preserve individual likes from count)
      likesArray = [];
    } else if (Array.isArray((postDoc as any).likes)) {
      // Already an array - use it
      likesArray = (postDoc as any).likes.map((id: any) => 
        id instanceof Types.ObjectId ? id : new Types.ObjectId(id)
      );
    } else {
      // Fallback - empty array
      likesArray = [];
    }

    // Check if user already liked
    const alreadyLiked = likesArray.some(
      (likeId) => likeId.toString() === req.user.id
    );

    if (alreadyLiked) {
      return res.status(400).json({ message: "Post already liked" });
    }

    // Add user to likes array
    likesArray.push(userId);
    
    // Update the post with the new array
    post.likes = likesArray as any;
    await post.save();
    
    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
    // Create notification for post owner (if different from liker)
    if (post.user.toString() !== req.user.id) {
      const liker = await User.findById(req.user.id);
      const likerName = liker ? `${liker.firstName} ${liker.lastName}` : "Someone";
      await createNotification(
        post.user,
        "post_like",
        "New Like on Your Post",
        `${likerName} liked your post`,
        post._id
      );
    }
    
    res.status(200).json({ message: "Post liked", likes: likesArray.length, isLiked: true });
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

    // Get the raw document to check the actual type
    const postDoc = post.toObject ? post.toObject() : post;
    let likesArray: Types.ObjectId[] = [];
    
    if (typeof (postDoc as any).likes === "number") {
      // Old format - can't unlike if it was just a count
      // This shouldn't happen if the post was already converted, but handle it gracefully
      return res.status(200).json({ 
        message: "Post unliked", 
        likes: Math.max(0, (postDoc as any).likes - 1), 
        isLiked: false 
      });
    } else if (Array.isArray((postDoc as any).likes)) {
      // Already an array - use it
      likesArray = (postDoc as any).likes.map((id: any) => 
        id instanceof Types.ObjectId ? id : new Types.ObjectId(id)
      );
    } else {
      // Fallback - empty array
      likesArray = [];
    }

    // Remove user from likes array
    likesArray = likesArray.filter(
      (likeId) => likeId.toString() !== req.user.id
    );
    
    // Update the post with the new array
    post.likes = likesArray as any;
    await post.save();
    
    // Invalidate cache for this post
    await invalidateCache([`posts:${req.params.postId}`, "posts:*"]);
    
    res.status(200).json({ message: "Post unliked", likes: likesArray.length, isLiked: false });
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

    // Create notification for post owner (if different from commenter)
    if (post.user.toString() !== req.user.id) {
      const commenter = await User.findById(req.user.id);
      const commenterName = commenter ? `${commenter.firstName} ${commenter.lastName}` : "Someone";
      await createNotification(
        post.user,
        "post_comment",
        "New Comment on Your Post",
        `${commenterName} commented on your post`,
        post._id
      );
    }

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
export const getTrendingPosts = async (req: Request, res: Response) => {
  try {
    const cacheKey = req.user ? `posts:trending:user:${req.user.id}` : "posts:trending";
    
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
      .lean();

    // Sort by likes count and comments count (handle both formats)
    posts.sort((a: any, b: any) => {
      const aLikes = Array.isArray(a.likes) ? a.likes.length : (a.likes || 0);
      const bLikes = Array.isArray(b.likes) ? b.likes.length : (b.likes || 0);
      const aComments = a.comments?.length || 0;
      const bComments = b.comments?.length || 0;
      
      if (aLikes !== bLikes) return bLikes - aLikes;
      return bComments - aComments;
    });

    const topPosts = posts.slice(0, 5);

    // Convert likes array to count and add isLiked flag
    const postsWithLikedStatus = topPosts.map((post: any) => {
      const postObj = { ...post };
      
      // Handle both formats
      let likesArray: any[] = [];
      let likesCount = 0;
      
      if (Array.isArray(post.likes)) {
        likesArray = post.likes;
        likesCount = post.likes.length;
      } else if (typeof post.likes === "number") {
        likesCount = post.likes;
        likesArray = [];
      }
      
      if (req.user) {
        postObj.isLiked = likesArray.some(
          (likeId: any) => {
            // Handle both ObjectId objects and string IDs
            const id = likeId?._id ? likeId._id.toString() : (likeId?.toString ? likeId.toString() : String(likeId));
            return id === req.user.id;
          }
        );
      } else {
        postObj.isLiked = false;
      }
      
      postObj.likes = likesCount;
      return postObj;
    });

    // Cache the result
    await setCached(cacheKey, postsWithLikedStatus, CACHE_TTL.SHORT);

    res.status(200).json(postsWithLikedStatus);
  } catch (err: any) {
    console.error("Error in getTrendingPosts:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: err.message || "Failed to fetch trending posts" });
  }
};

export const getRecentPosts = async (req: Request, res: Response) => {
  try {
    const cacheKey = req.user ? `posts:recent:user:${req.user.id}` : "posts:recent";
    
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
      })
      .lean();

    // Convert likes array to count and add isLiked flag
    const postsWithLikedStatus = posts.map((post: any) => {
      const postObj = { ...post };
      
      // Handle both formats
      let likesArray: any[] = [];
      let likesCount = 0;
      
      if (Array.isArray(post.likes)) {
        likesArray = post.likes;
        likesCount = post.likes.length;
      } else if (typeof post.likes === "number") {
        likesCount = post.likes;
        likesArray = [];
      }
      
      if (req.user) {
        postObj.isLiked = likesArray.some(
          (likeId: any) => {
            // Handle both ObjectId objects and string IDs
            const id = likeId?._id ? likeId._id.toString() : (likeId?.toString ? likeId.toString() : String(likeId));
            return id === req.user.id;
          }
        );
      } else {
        postObj.isLiked = false;
      }
      
      postObj.likes = likesCount;
      return postObj;
    });

    // Cache the result
    await setCached(cacheKey, postsWithLikedStatus, CACHE_TTL.SHORT);

    res.status(200).json(postsWithLikedStatus);
  } catch (err: any) {
    console.error("Error in getRecentPosts:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ message: err.message || "Failed to fetch recent posts" });
  }
};
