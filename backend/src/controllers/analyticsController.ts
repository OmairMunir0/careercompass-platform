import { Request, Response } from "express";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { Blog } from "../models/Blog";
import { JobPost } from "../models/JobPost";
import { JobApplication } from "../models/JobApplication";
import mongoose from "mongoose";

/**
 * @desc Get comprehensive analytics dashboard data
 * @route GET /api/analytics/dashboard
 * @access Private (Admin)
 */
export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    // User Metrics
    const totalUsers = await User.countDocuments();
    const totalCandidates = await User.countDocuments({ roleId: await getRoleIdByName("candidate") });
    const totalRecruiters = await User.countDocuments({ roleId: await getRoleIdByName("recruiter") });
    const totalAdmins = await User.countDocuments({ roleId: await getRoleIdByName("admin") });
    
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
    const totalLikes = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
    ]);
    const totalPostLikes = totalLikes[0]?.total || 0;
    
    const totalBlogLikes = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$likes" } } } }
    ]);
    const blogLikes = totalBlogLikes[0]?.total || 0;
    
    const totalComments = await Post.aggregate([
      { $group: { _id: null, total: { $sum: { $size: "$comments" } } } }
    ]);
    const postComments = totalComments[0]?.total || 0;
    
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
    const topActiveUsers = await User.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "user",
          as: "posts"
        }
      },
      {
        $lookup: {
          from: "blogs",
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
    const mostLikedPosts = await Post.aggregate([
      {
        $project: {
          content: 1,
          likesCount: { $size: "$likes" },
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

    res.status(200).json({
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
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * Helper function to get role ID by name
 */
async function getRoleIdByName(roleName: string): Promise<mongoose.Types.ObjectId | null> {
  try {
    const { Role } = await import("../models/Role");
    const role = await Role.findOne({ name: new RegExp(`^${roleName}$`, "i") });
    return role?._id || null;
  } catch {
    return null;
  }
}

