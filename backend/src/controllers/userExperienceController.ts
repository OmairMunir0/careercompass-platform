import { Request, Response } from "express";
import { IUserExperience, UserExperience } from "../models/UserExperience";

/**
 * @desc Create a new experience record for the logged-in user
 * @route POST /api/user-experiences
 * @access Private
 */
export const createExperience = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const exp: IUserExperience = new UserExperience({
      user: req.user.id,
      jobTitle: req.body.jobTitle,
      company: req.body.company,
      location: req.body.location ?? null,
      startDate: req.body.startDate,
      endDate: req.body.endDate ?? null,
      description: req.body.description ?? null,
      isCurrent: req.body.isCurrent ?? false,
    });

    await exp.save();
    res.status(201).json(exp);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get experiences for the logged-in user
 * @route GET /api/user-experiences/me
 * @access Private
 */
export const getMyExperiences = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const experiences: IUserExperience[] = await UserExperience.find({
      user: req.user.id,
    }).sort({ startDate: -1 }); // optional: sort by newest first

    res.status(200).json(experiences);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update an experience record for the logged-in user
 * @route PUT /api/user-experiences/:experienceId
 * @access Private
 */
export const updateExperience = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const exp = await UserExperience.findOneAndUpdate(
      { _id: req.params.experienceId, user: req.user.id }, // ensure user owns the experience
      {
        jobTitle: req.body.jobTitle,
        company: req.body.company,
        location: req.body.location ?? null,
        startDate: req.body.startDate,
        endDate: req.body.endDate ?? null,
        description: req.body.description ?? null,
        isCurrent: req.body.isCurrent ?? false,
      },
      { new: true, runValidators: true }
    );

    if (!exp) return res.status(404).json({ message: "Experience not found" });

    res.json(exp);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete an experience record for the logged-in user
 * @route DELETE /api/user-experiences/:experienceId
 * @access Private
 */
export const deleteExperience = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const exp = await UserExperience.findOneAndDelete({
      _id: req.params.experienceId,
      user: req.user.id, // ensure user owns the experience
    });

    if (!exp) return res.status(404).json({ message: "Experience not found" });

    res.json({ message: "Experience deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get experiences of any user by userId (public)
 * @route GET /api/user-experiences/user/:userId
 * @access Public
 */
export const getUserExperiences = async (req: Request, res: Response) => {
  try {
    const experiences = await UserExperience.find({ user: req.params.userId }).sort({
      startDate: -1,
    });
    res.status(200).json(experiences);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single experience record by ID (public)
 * @route GET /api/user-experiences/:experienceId
 * @access Public
 */
export const getExperience = async (req: Request, res: Response) => {
  try {
    const exp = await UserExperience.findById(req.params.experienceId);
    if (!exp) return res.status(404).json({ message: "Experience not found" });
    res.status(200).json(exp);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get experiences for multiple users in bulk
 * @route GET /api/user-experiences/bulk?userIds=id1,id2,id3
 * @access Private
 */
export const getBulkUserExperiences = async (req: Request, res: Response) => {
  try {
    const userIdsParam = req.query.userIds as string;

    if (!userIdsParam) {
      return res.status(400).json({ message: "Missing 'userIds' query parameter" });
    }

    // Parse comma-separated user IDs
    const userIds = userIdsParam.split(",").map((id) => id.trim()).filter(Boolean);

    if (userIds.length === 0) {
      return res.json({});
    }

    // Single database query to get all experiences for all users
    const experiences = await UserExperience.find({
      user: { $in: userIds },
    }).sort({ startDate: -1 }).lean();

    // Group experiences by user ID
    const experiencesMap: Record<string, any[]> = {};

    // Initialize empty arrays for all requested user IDs
    for (const userId of userIds) {
      experiencesMap[userId] = [];
    }

    // Populate the map with experiences
    for (const exp of experiences) {
      const userId = exp.user.toString();
      if (experiencesMap[userId]) {
        experiencesMap[userId].push(exp);
      }
    }

    res.json(experiencesMap);
  } catch (err: any) {
    console.error("Error getting bulk user experiences:", err);
    res.status(500).json({ message: err.message });
  }
};

