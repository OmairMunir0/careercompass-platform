import { Request, Response } from "express";
import { Blog, IBlog } from "../models/Blog";
import { User } from "../models/User";
import path from "path";
import fs from "fs";

/**
 * @desc Get all blogs (paginated)
 * @route GET /api/blogs
 * @access Public
 */
export const getAllBlogs = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const tag = req.query.tag as string;

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (tag) {
      query.tags = { $in: [tag] };
    }

    const blogs = await Blog.find(query)
      .populate("author", "firstName lastName email imageUrl")
      .populate("likes", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single blog by ID
 * @route GET /api/blogs/:id
 * @access Public
 */
export const getBlogById = async (req: Request, res: Response) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "firstName lastName email imageUrl")
      .populate("likes", "firstName lastName")
      .populate("comments.user", "firstName lastName email imageUrl")
      .lean();

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.status(200).json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Create a new blog
 * @route POST /api/blogs
 * @access Private
 */
export const createBlog = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, content, tags } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Get author info
    const author = await User.findById(req.user.id);
    if (!author) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle image upload
    let imageUrl: string | null = null;
    if (req.file) {
      // For now, use local storage. Can be extended to Cloudinary
      imageUrl = `/uploads/blog-images/${req.file.filename}`;
    }

    const blog = new Blog({
      title: title.trim(),
      content,
      author: req.user.id,
      authorName: `${author.firstName} ${author.lastName}`,
      authorAvatar: author.imageUrl || null,
      image: imageUrl,
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim())) : [],
      likes: [],
      comments: [],
    });

    await blog.save();
    await blog.populate("author", "firstName lastName email imageUrl");

    res.status(201).json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a blog
 * @route PUT /api/blogs/:id
 * @access Private (Owner or Admin)
 */
export const updateBlog = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user is owner or admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOwner = blog.author.toString() === req.user.id;
    
    // Check if user is admin
    const Role = (await import("../models/Role")).Role;
    const adminRole = await Role.findOne({ name: "admin" });
    const isAdmin = adminRole && user.roleId?.toString() === adminRole._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this blog" });
    }

    const { title, content, tags } = req.body;

    if (title) blog.title = title.trim();
    if (content) blog.content = content;
    if (tags !== undefined) {
      blog.tags = Array.isArray(tags) ? tags : tags.split(",").map((t: string) => t.trim());
    }

    // Handle new image upload
    if (req.file) {
      // Delete old image if exists
      if (blog.image && blog.image.startsWith("/uploads")) {
        const oldImagePath = path.join(process.cwd(), blog.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      blog.image = `/uploads/blog-images/${req.file.filename}`;
    }

    await blog.save();
    await blog.populate("author", "firstName lastName email imageUrl");

    res.status(200).json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a blog
 * @route DELETE /api/blogs/:id
 * @access Private (Owner or Admin)
 */
export const deleteBlog = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if user is owner or admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isOwner = blog.author.toString() === req.user.id;
    const Role = (await import("../models/Role")).Role;
    const adminRole = await Role.findOne({ name: "admin" });
    const isAdmin = adminRole && user.roleId?.toString() === adminRole._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this blog" });
    }

    // Delete associated image
    if (blog.image && blog.image.startsWith("/uploads")) {
      const imagePath = path.join(process.cwd(), blog.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Blog deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Like/Unlike a blog
 * @route PUT /api/blogs/:id/like
 * @access Private
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const userId = req.user.id;
    const likeIndex = blog.likes.findIndex((id) => id.toString() === userId.toString());

    if (likeIndex === -1) {
      blog.likes.push(userId);
    } else {
      blog.likes.splice(likeIndex, 1);
    }

    await blog.save();
    await blog.populate("likes", "firstName lastName");

    res.status(200).json({ likes: blog.likes, isLiked: likeIndex === -1 });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Add a comment to a blog
 * @route POST /api/blogs/:id/comments
 * @access Private
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    blog.comments.push({
      user: req.user.id,
      text: text.trim(),
      name: `${user.firstName} ${user.lastName}`,
      avatar: user.imageUrl || "",
      date: new Date(),
    });

    await blog.save();
    await blog.populate("comments.user", "firstName lastName email imageUrl");

    res.status(201).json(blog);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a comment from a blog
 * @route DELETE /api/blogs/:id/comments/:commentId
 * @access Private (Owner or Admin)
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    const comment = blog.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is comment owner, blog owner, or admin
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCommentOwner = comment.user.toString() === req.user.id;
    const isBlogOwner = blog.author.toString() === req.user.id;
    const Role = (await import("../models/Role")).Role;
    const adminRole = await Role.findOne({ name: "admin" });
    const isAdmin = adminRole && user.roleId?.toString() === adminRole._id.toString();

    if (!isCommentOwner && !isBlogOwner && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }

    blog.comments.pull(req.params.commentId);
    await blog.save();

    res.status(200).json({ message: "Comment deleted successfully", blog });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

