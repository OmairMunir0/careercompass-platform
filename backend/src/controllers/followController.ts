import { Request, Response } from "express";
import { Follow } from "../models/Follow";
import { User } from "../models/User";
import { createNotification } from "../utils/notifications";

/**
 * @desc Follow a user
 * @route POST /api/follows/:userId
 * @access Private
 */
export const followUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.userId;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (followerId === followingId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const userToFollow = await User.findById(followingId);
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingFollow = await Follow.findOne({
      follower: followerId,
      following: followingId,
    });

    if (existingFollow) {
      return res.status(400).json({ message: "You are already following this user" });
    }

    const follow = new Follow({
      follower: followerId,
      following: followingId,
    });

    await follow.save();

    // Update follower and following counts
    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

    const follower = await User.findById(followerId);
    const followerName = follower ? `${follower.firstName} ${follower.lastName}` : "Someone";
    await createNotification(
      followingId,
      "new_follower",
      "New Follower",
      `${followerName} started following you`,
      followerId
    );

    res.status(201).json({ message: "Successfully followed user", follow });
  } catch (err: any) {
    console.error("Error following user:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Unfollow a user
 * @route DELETE /api/follows/:userId
 * @access Private
 */
export const unfollowUser = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.userId;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const follow = await Follow.findOneAndDelete({
      follower: followerId,
      following: followingId,
    });

    if (!follow) {
      return res.status(404).json({ message: "You are not following this user" });
    }

    await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
    await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

    res.json({ message: "Successfully unfollowed user" });
  } catch (err: any) {
    console.error("Error unfollowing user:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get followers of a user
 * @route GET /api/follows/followers/:userId
 * @access Private
 */
export const getFollowers = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const followers = await Follow.find({ following: userId })
      .populate("follower", "firstName lastName username email imageUrl position location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ following: userId });

    const followersList = followers.map((f: any) => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));

    res.json({
      data: followersList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error getting followers:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get users that a user is following
 * @route GET /api/follows/following/:userId
 * @access Private
 */
export const getFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const following = await Follow.find({ follower: userId })
      .populate("following", "firstName lastName username email imageUrl position location")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Follow.countDocuments({ follower: userId });

    const followingList = following.map((f: any) => ({
      ...f.following,
      followedAt: f.createdAt,
    }));

    res.json({
      data: followingList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error getting following:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Check if current user follows a specific user
 * @route GET /api/follows/status/:userId
 * @access Private
 */
export const getFollowStatus = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const followingId = req.params.userId;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isFollowing = await Follow.exists({
      follower: followerId,
      following: followingId,
    });

    const isFollower = await Follow.exists({
      follower: followingId,
      following: followerId,
    });

    res.json({
      isFollowing: !!isFollowing,
      isFollower: !!isFollower,
      isMutual: !!isFollowing && !!isFollower,
    });
  } catch (err: any) {
    console.error("Error checking follow status:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get follow suggestions based on mutual connections and similar profiles
 * @route GET /api/follows/suggestions
 * @access Private
 */
export const getFollowSuggestions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const following = await Follow.find({ follower: userId }).distinct("following");

    const mutualFollowing = await Follow.find({
      follower: { $in: following },
      following: { $nin: [...following, userId] },
    })
      .distinct("following")
      .limit(limit);

    const suggestions = await User.find({
      _id: { $in: mutualFollowing },
    })
      .select("firstName lastName username email imageUrl position location followersCount")
      .limit(limit)
      .lean();

    if (suggestions.length < limit) {
      const popularUsers = await User.find({
        _id: { $nin: [...following, userId, ...suggestions.map((s: any) => s._id)] },
      })
        .sort({ followersCount: -1 })
        .select("firstName lastName username email imageUrl position location followersCount")
        .limit(limit - suggestions.length)
        .lean();

      suggestions.push(...popularUsers);
    }

    res.json({ data: suggestions });
  } catch (err: any) {
    console.error("Error getting follow suggestions:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get follow statistics for a user
 * @route GET /api/follows/stats/:userId
 * @access Private
 */
export const getFollowStats = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;

    const followersCount = await Follow.countDocuments({ following: userId });
    const followingCount = await Follow.countDocuments({ follower: userId });

    res.json({
      followersCount,
      followingCount,
    });
  } catch (err: any) {
    console.error("Error getting follow stats:", err);
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get follow status for multiple users in bulk
 * @route GET /api/follows/status/bulk?ids=userId1,userId2,userId3
 * @access Private
 */
export const getBulkFollowStatus = async (req: Request, res: Response) => {
  try {
    const followerId = req.user?.id;
    const idsParam = req.query.ids as string;

    if (!followerId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!idsParam) {
      return res.status(400).json({ message: "Missing 'ids' query parameter" });
    }

    // Parse comma-separated user IDs
    const userIds = idsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (userIds.length === 0) {
      return res.json({});
    }

    // Single database query to get all follow relationships
    const follows = await Follow.find({
      follower: followerId,
      following: { $in: userIds },
    }).select("following").lean();

    // Create a Set of user IDs that the current user is following
    const followingSet = new Set(follows.map((f: any) => f.following.toString()));

    // Build the response object mapping each userId to follow status
    const statusMap: Record<string, boolean> = {};
    for (const userId of userIds) {
      statusMap[userId] = followingSet.has(userId);
    }

    res.json(statusMap);
  } catch (err: any) {
    console.error("Error getting bulk follow status:", err);
    res.status(500).json({ message: err.message });
  }
};

