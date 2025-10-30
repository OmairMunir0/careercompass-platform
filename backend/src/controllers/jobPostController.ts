import { Request, Response } from "express";
import mongoose from "mongoose";
import { JobApplication, SavedJob } from "../models";
import { IJobPost, JobPost } from "../models/JobPost";

/**
 * @desc Create a new job post
 * @route POST /api/job-posts
 * @access Private (Recruiter)
 */
export const createJobPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const {
      title,
      description,
      location,
      jobType,
      workMode,
      experienceLevel,
      salaryMin,
      salaryMax,
    } = req.body;

    if (!title || !description || !salaryMin || !salaryMax)
      return res.status(400).json({ message: "Missing required fields" });

    const job: IJobPost = new JobPost({
      recruiter: req.user.id,
      title: title.trim(),
      description: description.trim(),
      location: location?.trim() ?? null,
      jobType: jobType ?? null,
      workMode: workMode ?? null,
      experienceLevel: experienceLevel ?? null,
      salaryMin,
      salaryMax,
    });

    await job.save();
    res.status(201).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all active job posts
 * @route GET /api/job-posts
 * @access Public
 */
export const findJobs = async (req: Request, res: Response) => {
  try {
    const {
      keyword,
      location,
      jobType,
      workMode,
      experienceLevel,
      minSalary,
      maxSalary,
      skills,
      page = 1,
      limit = 10,
      sort = "recent",
    } = req.query;

    const filters: any = { isActive: true };

    if (keyword && typeof keyword === "string") {
      filters.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { description: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location && typeof location === "string") {
      filters.location = { $regex: location, $options: "i" };
    }

    if (jobType && mongoose.Types.ObjectId.isValid(String(jobType))) {
      filters.jobType = jobType;
    }

    if (workMode && mongoose.Types.ObjectId.isValid(String(workMode))) {
      filters.workMode = workMode;
    }

    if (experienceLevel && mongoose.Types.ObjectId.isValid(String(experienceLevel))) {
      filters.experienceLevel = experienceLevel;
    }

    if (minSalary) filters.salaryMin = { $gte: Number(minSalary) };
    if (maxSalary) filters.salaryMax = { ...(filters.salaryMax || {}), $lte: Number(maxSalary) };

    if (skills) {
      const skillArray =
        typeof skills === "string" ? skills.split(",").map((s) => s.trim()) : skills;
      filters.requiredSkills = { $all: skillArray };
    }

    const sortOptions: Record<string, any> = {
      recent: { createdAt: -1 },
      salaryAsc: { salaryMin: 1 },
      salaryDesc: { salaryMax: -1 },
    };

    const skip = (Number(page) - 1) * Number(limit);

    const jobs = await JobPost.find(filters)
      .populate("recruiter", "name email")
      .populate("jobType", "name")
      .populate("workMode", "name")
      .populate("experienceLevel", "name")
      .populate("requiredSkills", "name")
      .sort(sortOptions[String(sort)] || sortOptions.recent)
      .skip(skip)
      .limit(Number(limit));

    // get saved job ids for current user (if logged in)
    let savedJobIds: Set<string> = new Set();
    let appliedJobIds: Set<string> = new Set();

    if (req.user) {
      const [savedJobs, appliedJobs] = await Promise.all([
        SavedJob.find({ user: req.user.id }).select("job").lean(),
        JobApplication.find({ user: req.user.id }).select("job").lean(),
      ]);

      savedJobIds = new Set(savedJobs.map((sj) => String(sj.job)));
      appliedJobIds = new Set(appliedJobs.map((aj) => String(aj.job)));
    }

    // add isSaved flag to each job
    const enrichedJobs = jobs.map((job) => ({
      ...job.toObject(),
      isSaved: savedJobIds.has(String(job._id)),
      hasApplied: appliedJobIds.has(String(job._id)), // <-- new field
    }));

    const total = await JobPost.countDocuments(filters);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      results: enrichedJobs,
    });
  } catch (error: any) {
    console.error("findJobs error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

/**
 * @desc Get job posts created by the logged-in recruiter
 * @route GET /api/job-posts/me
 * @access Private (Recruiter)
 */
export const getMyJobPosts = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const jobs = await JobPost.find({ recruiter: req.user.id })
      .populate("jobType workMode experienceLevel")
      .sort({ createdAt: -1 });

    res.status(200).json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single job post by ID
 * @route GET /api/job-posts/:jobPostId
 * @access Public
 */
export const getJobPost = async (req: Request, res: Response) => {
  try {
    const job = await JobPost.findById(req.params.jobPostId)
      .populate("recruiter", "name email")
      .populate("jobType workMode experienceLevel requiredSkills");

    if (!job) return res.status(404).json({ message: "Job post not found" });

    let isSaved = false;
    let hasApplied = false;

    if (req.user) {
      const [existingSaved, existingApplication] = await Promise.all([
        SavedJob.findOne({ user: req.user.id, job: job._id }).lean(),
        JobApplication.findOne({ user: req.user.id, job: job._id }).lean(),
      ]);

      isSaved = !!existingSaved;
      hasApplied = !!existingApplication;
    }

    res.status(200).json({
      ...job.toObject(),
      isSaved,
      hasApplied,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a job post
 * @route PUT /api/job-posts/:jobPostId
 * @access Private (Recruiter)
 */
export const updateJobPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const updates = req.body;
    const job = await JobPost.findOneAndUpdate(
      { _id: req.params.jobPostId, recruiter: req.user.id },
      { ...updates },
      { new: true, runValidators: true }
    );

    if (!job) return res.status(404).json({ message: "Job post not found or unauthorized" });

    res.status(200).json(job);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Toggle job post active/inactive
 * @route PUT /api/job-posts/:jobPostId/toggle
 * @access Private (Recruiter)
 */
export const toggleJobPostStatus = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const job = await JobPost.findOne({ _id: req.params.jobPostId, recruiter: req.user.id });
    if (!job) return res.status(404).json({ message: "Job post not found or unauthorized" });

    job.isActive = !job.isActive;
    await job.save();

    res
      .status(200)
      .json({ message: `Job post ${job.isActive ? "activated" : "deactivated"}`, job });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a job post
 * @route DELETE /api/job-posts/:jobPostId
 * @access Private (Recruiter)
 */
export const deleteJobPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const deleted = await JobPost.findOneAndDelete({
      _id: req.params.jobPostId,
      recruiter: req.user.id,
    });

    if (!deleted) return res.status(404).json({ message: "Job post not found or unauthorized" });

    res.status(200).json({ message: "Job post deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get recently created job posts (for dashboard)
 * @route GET /api/job-posts/recent
 * @access Private (Admin/Recruiter)
 */
export const getRecentJobPosts = async (_req: Request, res: Response) => {
  try {
    const jobs = await JobPost.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("recruiter jobType");
    res.status(200).json(jobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Bulk delete job posts by recruiter
 * @route DELETE /api/job-posts/recruiter/:recruiterId
 * @access Private (Admin)
 */
export const bulkDeleteJobPostsByRecruiter = async (req: Request, res: Response) => {
  try {
    const result = await JobPost.deleteMany({ recruiter: req.params.recruiterId });
    res.status(200).json({ message: "Job posts deleted", deletedCount: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
