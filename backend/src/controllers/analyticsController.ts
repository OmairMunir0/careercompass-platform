import { Request, Response } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Blog } from "../models/Blog";
import { JobPost } from "../models/JobPost";
import { JobApplication } from "../models/JobApplication";
import { Role } from "../models/Role";
import mongoose from "mongoose";
import { getCached, setCached, CACHE_TTL } from "../utils/cache";

/**
 * @desc Get comprehensive analytics dashboard data
 * @route GET /api/analytics/dashboard
 * @access Private (Admin)
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const cacheKey = "analytics:dashboard";

    // Try to get from cache (analytics are expensive to compute)
    const cached = await getCached(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    // User Metrics
    const totalUsers = await User.countDocuments();
    
    // Get role IDs
    const candidateRoleId = await getRoleIdByName("candidate");
    const recruiterRoleId = await getRoleIdByName("recruiter");
    const adminRoleId = await getRoleIdByName("admin");
    
    const totalCandidates = candidateRoleId ? await User.countDocuments({ roleId: candidateRoleId }) : 0;
    const totalRecruiters = recruiterRoleId ? await User.countDocuments({ roleId: recruiterRoleId }) : 0;
    const totalAdmins = adminRoleId ? await User.countDocuments({ roleId: adminRoleId }) : 0;
    
    // New users in last 7, 30 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newUsersLast7Days = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Active users (users who have created posts, blogs, or applications in last 30 days)
    const activeUsers = await User.countDocuments({
      $or: [
        { createdAt: { $gte: thirtyDaysAgo } },
      ]
    });

    // Content Metrics
    const totalPosts = await Post.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalJobPosts = await JobPost.countDocuments();
    const totalJobApplications = await JobApplication.countDocuments();
    
    // Posts in last 7, 30 days
    const postsLast7Days = await Post.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const postsLast30Days = await Post.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Blogs in last 7, 30 days
    const blogsLast7Days = await Blog.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    const blogsLast30Days = await Blog.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    
    // Engagement Metrics
    // Note: Post.likes is a number, not an array, so we sum it directly
    const totalLikes = await Post.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);
    const totalPostLikes = totalLikes[0]?.total || 0;
    
    // Blog.likes is an array, so we use $size
    const totalBlogLikes = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
    ]);
    const blogLikes = totalBlogLikes[0]?.total || 0;
    
    // Post.comments is an array, so we use $size
    const totalComments = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$comments" } } } }
    ]);
    const postComments = totalComments[0]?.total || 0;
    
    // Blog.comments is an array, so we use $size
    const totalBlogComments = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$comments" } } } }
    ]);
    const blogComments = totalBlogComments[0]?.total || 0;
    
    // User Growth Over Time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top Active Users (by posts + blogs)
    // Get collection names safely
    const postsCollectionName = Post.collection?.name || "posts";
    const blogsCollectionName = Blog.collection?.name || "blogs";
    
    const topActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: postsCollectionName,
          localField: "_id",
          foreignField: "user",
          as: "posts"
        }
      },
      {
        $lookup: {
          from: blogsCollectionName,
          localField: "_id",
          foreignField: "author",
          as: "blogs"
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          postCount: { $size: "$posts" },
          blogCount: { $size: "$blogs" },
          totalActivity: { $add: [{ $size: "$posts" }, { $size: "$blogs" }] }
        }
      },
      { $sort: { totalActivity: -1 } },
      { $limit: 10 }
    ]);

    // Most Liked Posts
    // Note: Post.likes is a number, not an array
    const mostLikedPosts = await Post.aggregate([
      {
        $project: {
          content: 1,
          likesCount: "$likes", // Direct field access since it's a number
          commentsCount: { $size: "$comments" },
          createdAt: 1
        }
      },
      { $sort: { likesCount: -1 } },
      { $limit: 5 }
    ]);

    // Most Liked Blogs
    const mostLikedBlogs = await Blog.aggregate([
      {
        $project: {
          title: 1,
          likesCount: { $size: "$likes" },
          commentsCount: { $size: "$comments" },
          createdAt: 1
        }
      },
      { $sort: { likesCount: -1 } },
      { $limit: 5 }
    ]);

    const response = {
      data: {
        users: {
          total: totalUsers,
          candidates: totalCandidates,
          recruiters: totalRecruiters,
          admins: totalAdmins,
          newLast7Days: newUsersLast7Days,
          newLast30Days: newUsersLast30Days,
          active: activeUsers,
        },
        content: {
          posts: {
            total: totalPosts,
            last7Days: postsLast7Days,
            last30Days: postsLast30Days,
          },
          blogs: {
            total: totalBlogs,
            last7Days: blogsLast7Days,
            last30Days: blogsLast30Days,
          },
          jobPosts: totalJobPosts,
          jobApplications: totalJobApplications,
        },
        engagement: {
          totalLikes: totalPostLikes + blogLikes,
          postLikes: totalPostLikes,
          blogLikes: blogLikes,
          totalComments: postComments + blogComments,
          postComments: postComments,
          blogComments: blogComments,
        },
        growth: {
          userGrowth: userGrowth.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
          })),
        },
        topUsers: topActiveUsers,
        topPosts: mostLikedPosts,
        topBlogs: mostLikedBlogs,
      },
    };

    // Cache the result (analytics are expensive, cache for longer)
    await setCached(cacheKey, response, CACHE_TTL.LONG);

    res.status(200).json(response);
  } catch (err: any) {
    console.error("Analytics error:", err);
    console.error("Error stack:", err.stack);
    res.status(500).json({ 
      message: err.message || "Failed to fetch analytics",
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  }
};

/**
 * Helper function to get role ID by name
 */
async function getRoleIdByName(roleName: string): Promise<mongoose.Types.ObjectId | null> {
  try {
    const role = await Role.findOne({ name: new RegExp(`^${roleName}$`, "i") });
    return role?._id || null;
  } catch (error) {
    console.error(`Error finding role ${roleName}:`, error);
    return null;
  }
}

