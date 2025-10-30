import { Request, Response } from "express";
import { IJobType, JobType } from "../models/JobType";

/**
 * @desc Create a new job type
 * @route POST /api/job-types
 * @access Private (Admin)
 */
export const createJobType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await JobType.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) return res.status(400).json({ message: "Job type already exists" });

    const jobType: IJobType = new JobType({ name: name.trim() });
    await jobType.save();

    res.status(201).json(jobType);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all job types
 * @route GET /api/job-types
 * @access Public
 */
export const getJobTypes = async (_req: Request, res: Response) => {
  try {
    const jobTypes = await JobType.find().sort({ createdAt: -1 });
    res.status(200).json(jobTypes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single job type by ID
 * @route GET /api/job-types/:id
 * @access Public
 */
export const getJobType = async (req: Request, res: Response) => {
  try {
    const jobType = await JobType.findById(req.params.id);
    if (!jobType) return res.status(404).json({ message: "Job type not found" });

    res.status(200).json(jobType);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a job type
 * @route PUT /api/job-types/:id
 * @access Private (Admin)
 */
export const updateJobType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await JobType.findOne({
      _id: { $ne: req.params.id },
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) return res.status(400).json({ message: "Job type already exists" });

    const jobType = await JobType.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!jobType) return res.status(404).json({ message: "Job type not found" });

    res.status(200).json(jobType);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a job type
 * @route DELETE /api/job-types/:id
 * @access Private (Admin)
 */
export const deleteJobType = async (req: Request, res: Response) => {
  try {
    const deleted = await JobType.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Job type not found" });

    res.status(200).json({ message: "Job type deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Bulk delete all job types (admin maintenance)
 * @route DELETE /api/job-types
 * @access Private (Admin)
 */
export const bulkDeleteJobTypes = async (_req: Request, res: Response) => {
  try {
    const result = await JobType.deleteMany({});
    res.status(200).json({
      message: "All job types deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
