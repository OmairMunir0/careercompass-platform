import { Request, Response } from "express";
import { ISavedJob, SavedJob } from "../models/SavedJob";

/**
 * @desc Save a job (add to user's saved jobs)
 * @route POST /api/saved-jobs
 * @access Private
 */
export const saveJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const { job } = req.body;
    if (!job) return res.status(400).json({ message: "Job ID is required" });

    const existing = await SavedJob.findOne({ user: req.user.id, job });
    if (existing) return res.status(400).json({ message: "Job already saved" });

    const savedJob: ISavedJob = new SavedJob({ user: req.user.id, job });
    await savedJob.save();

    res.status(201).json(savedJob);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all saved jobs for the logged-in user
 * @route GET /api/saved-jobs
 * @access Private
 */
export const getMySavedJobs = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const savedJobs = await SavedJob.find({ user: req.user.id })
      .populate({
        path: "job",
        select: "title location salaryMin salaryMax isActive createdAt recruiter",
        populate: {
          path: "recruiter",
          select: "companyName",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(savedJobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Remove a saved job by ID
 * @route DELETE /api/saved-jobs/:savedJobId
 * @access Private
 */
export const deleteSavedJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await SavedJob.findOneAndDelete({
      _id: req.params.savedJobId,
      user: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Saved job not found" });

    res.status(200).json({ message: "Saved job removed successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Check if a job is saved by the user
 * @route GET /api/saved-jobs/check/:jobId
 * @access Private
 */
export const checkIfJobIsSaved = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const existing = await SavedJob.findOne({
      user: req.user.id,
      job: req.params.jobId,
    });

    res.status(200).json({ saved: !!existing });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Bulk delete saved jobs for a user (e.g., on account deletion)
 * @route DELETE /api/saved-jobs
 * @access Private (System/Admin)
 */
export const bulkDeleteUserSavedJobs = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId ?? req.user?.id;
    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const result = await SavedJob.deleteMany({ user: userId });
    res.status(200).json({ message: "Saved jobs deleted", deletedCount: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
