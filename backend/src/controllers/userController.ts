import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import { UserExperience } from "../models";
import { Role } from "../models/Role";
import { IUser, User } from "../models/User";

// Response DTO
export type UserResponseDto = Partial<IUser>;

interface SafeUser extends Omit<IUser, "passwordHash" | "roleId"> {
  role: string;
}

/**
 * @desc Get current logged-in user
 * @route GET /api/users/me
 * @access Private
 */
export const getMe = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const user = await User.findById(req.user.id)
      .populate<{ name: string }>("roleId", "name")
      .lean<SafeUser & { roleId: { name: string } }>();

    if (!user) return res.status(404).json({ message: "User not found" });

    const { roleId, ...rest } = user;
    const safeUser: SafeUser = {
      ...rest,
      role: roleId.name,
    };

    return res.status(200).json({ data: safeUser });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update current logged-in user
 * @route PUT /api/users/me
 * @access Private
 */
export const updateMe = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Prevent changes to sensitive fields
    const { passwordHash, roleId, ...updates } = req.body;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { passwordHash: _, ...safeUser } = user.toObject();

    res.status(200).json({ message: "Profile updated", data: safeUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all users with optional query filters
 * @route GET /api/users
 * @access Private
 * @query ?role=candidate&search=john&page=1&limit=10
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page = "1", limit = "10" } = req.query;

    const query: any = {};

    if (role) {
      const roleDoc = await Role.findOne({ name: String(role).toUpperCase() });
      if (roleDoc) query.roleId = roleDoc._id;
    }

    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { username: regex },
        { email: regex },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .populate("roleId", "name")
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const safeUsers: UserResponseDto[] = users.map((u) => {
      const { passwordHash, ...rest } = u.toObject();
      return rest;
    });

    const total = await User.countDocuments(query);

    res.status(200).json({
      message: "Users fetched",
      data: safeUsers,
      meta: { total, page: pageNum, limit: limitNum },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get user by ID
 * @route GET /api/users/:userId
 * @access Private
 */
export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).populate("roleId", "name");
    if (!user) return res.status(404).json({ message: "User not found" });

    const { passwordHash, ...safeUser } = user.toObject();

    res.status(200).json({ message: "User fetched", data: safeUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all candidates with optional search filter, including their experiences
 * @route GET /api/candidates
 * @access Private
 * @query ?search=john&page=1&limit=10
 */
export const getCandidates = async (req: Request, res: Response) => {
  try {
    const { search, page = "1", limit = "10" } = req.query;

    // Get candidate role
    const roleDoc = await Role.findOne({ name: "candidate" });
    if (!roleDoc) return res.status(404).json({ message: "Candidate role not found" });

    const query: any = { roleId: roleDoc._id };

    if (search) {
      const regex = new RegExp(String(search), "i");
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { username: regex },
        { email: regex },
      ];
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch candidates
    const candidates = await User.find(query).skip(skip).limit(limitNum).sort({ createdAt: -1 });

    // Map candidates and fetch experiences
    const safeCandidates = await Promise.all(
      candidates.map(async (u) => {
        const { passwordHash, ...rest } = u.toObject();
        const experiences = await UserExperience.find({ user: u._id }).sort({ startDate: -1 });
        return { ...rest, experiences };
      })
    );

    const total = await User.countDocuments(query);

    res.status(200).json({
      message: "Candidates fetched",
      data: safeCandidates,
      meta: { total, page: pageNum, limit: limitNum },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update user
 * @route PUT /api/users/:userId
 * @access Private
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const updates = { ...req.body };
    delete updates.passwordHash;

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });

    const { passwordHash, ...safeUser } = user.toObject();

    res.status(200).json({ message: "User fetched", data: safeUser });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete user
 * @route DELETE /api/users/:userId
 * @access Private
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted", data: { id: user._id } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get users by role name
 * @route GET /api/users/role/:role
 * @access Private
 */
export const getUsersByRole = async (req: Request, res: Response) => {
  try {
    const role = await Role.findOne({ name: req.params.role.toUpperCase() });
    if (!role) return res.status(404).json({ message: "Role not found" });

    const users = await User.find({ roleId: role._id });
    const safeUsers: UserResponseDto[] = users.map((u) => {
      const { passwordHash, ...rest } = u.toObject();
      return rest;
    });

    res.status(200).json({ message: "Users fetched", data: safeUsers });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Upload profile image
 * @route POST /api/users/me/profile-image
 * @access Private
 */
export const addProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { imageUrl: `/uploads/profile-images/${req.file.filename}` },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile image uploaded", data: { imageUrl: user.imageUrl } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Remove profile image
 * @route DELETE /api/users/me/profile-image
 * @access Private
 */
export const removeProfileImage = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.imageUrl) {
      const filePath = path.join(process.cwd(), user.imageUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    user.imageUrl = null;
    await user.save();

    res.status(200).json({ message: "Profile image removed", data: { imageUrl: null } });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get user statistics (posts count, interviews, etc.)
 * @route GET /api/users/me/stats
 * @access Private
 */
export const getUserStats = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { Post } = await import("../models/Post");
    
    const postsCount = await Post.countDocuments({ user: req.user.id });
    
    // For interviews, we'll return a placeholder since interviews are stored in frontend
    // In a real implementation, you'd have an Interview model
    const interviewsCount = 0; // TODO: Implement when Interview model is added

    res.status(200).json({
      data: {
        postsCount,
        interviewsCount,
        // Add more stats as needed
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};