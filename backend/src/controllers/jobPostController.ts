import { Request, Response } from "express";
import mongoose from "mongoose";
import { JobApplication, SavedJob, Post, JobType, WorkMode, ExperienceLevel, Skill } from "../models";
import { IJobPost, JobPost } from "../models/JobPost";
import { UserSkill } from "../models/UserSkill";
import { User } from "../models/User";
import { createNotification } from "../utils/notifications";
import { isSubscriptionActive } from "../utils/subscription";
import axios from "axios";

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
      requiredSkills,
      applicationEmail,
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
      requiredSkills: requiredSkills || [],
      applicationEmail: applicationEmail?.trim() || null,
    });

    await job.save();

    try {
      const baseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
      const jt = jobType ? await JobType.findById(jobType).lean() : null;
      const wm = workMode ? await WorkMode.findById(workMode).lean() : null;
      const exp = experienceLevel ? await ExperienceLevel.findById(experienceLevel).lean() : null;
      const skills = requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0
        ? await Skill.find({ _id: { $in: requiredSkills } }).lean()
        : [];

      const skillsText = skills.map((s: any) => s.name).join(", ");
      const viewUrl = `${baseUrl}/find-jobs/${job._id}`;

      const content = [
        `New Job: ${title}`,
        // location ? `Location: ${location}` : null,
        // `Type: ${jt?.name ?? "N/A"} | Work Mode: ${wm?.name ?? "N/A"} | Experience: ${exp?.name ?? "N/A"}`,
        // `Salary: ${salaryMin} - ${salaryMax}`,
        // skillsText ? `Skills: ${skillsText}` : null,
        // applicationEmail ? `Apply via Email: ${applicationEmail}` : null,
        `Description: ${description}`,
      ].filter(Boolean).join("\n");

      const timelinePost = await Post.create({
        user: req.user.id,
        content,
        imageUrl: null,
        type: "job",
        jobPostId: job._id,
        jobMeta: {
          title,
          location: location ?? null,
          salaryMin,
          salaryMax,
          jobType: jt?.name ?? null,
          workMode: wm?.name ?? null,
          experienceLevel: exp?.name ?? null,
          requiredSkills: skills.map((s: any) => s.name),
          url: viewUrl,
          applicationEmail: applicationEmail ?? null,
        },
      });

      job.timelinePostId = timelinePost._id as any;
      await job.save();
    } catch (postErr) {
      console.error("Failed to create timeline post for job:", postErr);
    }

    // Notify Premium users whose skills match the job requirements
    if (requiredSkills && Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      try {
        // Find all Premium users who have at least one matching skill
        const matchingUsers = await UserSkill.aggregate([
          {
            $match: {
              skillId: { $in: requiredSkills.map((id: string) => new mongoose.Types.ObjectId(id)) },
            },
          },
          {
            $group: {
              _id: "$user",
            },
          },
        ]);

        // Get user IDs and check if they're Premium
        const userIds = matchingUsers.map((u) => u._id);
        const premiumUsers = await User.find({
          _id: { $in: userIds },
        });

        // Send notifications to Premium users
        for (const user of premiumUsers) {
          if (isSubscriptionActive(user)) {
            await createNotification(
              user._id,
              "job_post",
              "New Job Post Matching Your Skills",
              `A new job "${title}" has been posted that matches your skills`,
              job._id
            );
          }
        }
      } catch (notifError) {
        console.error("Error sending job post notifications:", notifError);
        // Don't fail job creation if notifications fail
      }
    }

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
/**
 * @desc Get job recommendations for a user
 * @route GET /api/job-posts/recommendations
 * @access Private
 */
export const getJobRecommendations = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    const userId = req.user?.id || req.query.userId;

    // Get active jobs, sorted by creation date (most recent first)
    // In a real implementation, you'd match based on user skills, experience, etc.
    const fastapiBase = process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000";
    let recommendedJobs: any = null;
    try {
      if (!userId) throw new Error("Missing userId for recommendations");

      const params = new URLSearchParams();
      params.set("user_id", userId);
      const url = `${fastapiBase}/api/timeline/job_posts?${params.toString()}`;
      const response = await axios.get(url);
      recommendedJobs = response.data;
    } catch (e: any) {
      console.error("FastAPI timeline error:", e?.response?.data || e?.message);
      // Return empty results if FastAPI fails
      return res.status(200).json({ results: [] });
    }

    // 2. Extract jobPostIds from the FastAPI response
    const jobIds = recommendedJobs.map((job: any) => job.jobPostId);

    // 3. Fetch job details from MongoDB
    const jobs = await JobPost.find({ _id: { $in: jobIds }, isActive: true })
      .populate("recruiter", "firstName lastName email")
      .populate("jobType", "name")
      .populate("workMode", "name")
      .populate("experienceLevel", "name")
      .populate("requiredSkills", "name")
      .lean();

    console.log("Jobs:", jobs);

    // 4. Order jobs according to the recommendation order
    const orderedJobs = jobIds.map(id =>
      jobs.find(job => String(job._id) === String(id))
    ).filter(Boolean);

    console.log("Recommended Jobs:", orderedJobs);

    res.status(200).json({ results: orderedJobs });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

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
      .populate("jobType workMode experienceLevel requiredSkills")
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

    try {
      if (job.timelinePostId) {
        const baseUrl = process.env.FRONTEND_URL || process.env.APP_BASE_URL || "http://localhost:3000";
        const jt = job.jobType ? await JobType.findById(job.jobType).lean() : null;
        const wm = job.workMode ? await WorkMode.findById(job.workMode).lean() : null;
        const exp = job.experienceLevel ? await ExperienceLevel.findById(job.experienceLevel).lean() : null;
        const skills = job.requiredSkills?.length
          ? await Skill.find({ _id: { $in: job.requiredSkills } }).lean()
          : [];
        const skillsText = skills.map((s: any) => s.name).join(", ");
        const viewUrl = `${baseUrl}/find-jobs/${job._id}`;

        const content = [
          `Updated Job: ${job.title}`,
          job.location ? `Location: ${job.location}` : null,
          `Type: ${jt?.name ?? "N/A"} | Work Mode: ${wm?.name ?? "N/A"} | Experience: ${exp?.name ?? "N/A"}`,
          `Salary: ${job.salaryMin} - ${job.salaryMax}`,
          skillsText ? `Skills: ${skillsText}` : null,
          job.applicationEmail ? `Apply via Email: ${job.applicationEmail}` : null,
        ].filter(Boolean).join("\n");

        await Post.findByIdAndUpdate(job.timelinePostId, {
          content,
          jobMeta: {
            title: job.title,
            location: job.location ?? null,
            salaryMin: job.salaryMin,
            salaryMax: job.salaryMax,
            jobType: jt?.name ?? null,
            workMode: wm?.name ?? null,
            experienceLevel: exp?.name ?? null,
            requiredSkills: skills.map((s: any) => s.name),
            url: viewUrl,
            applicationEmail: job.applicationEmail ?? null,
          },
        });
      }
    } catch (postErr) {
      console.error("Failed to update timeline post for job:", postErr);
    }

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

    try {
      if (deleted.timelinePostId) {
        await Post.findByIdAndDelete(deleted.timelinePostId);
      }
    } catch (postErr) {
      console.error("Failed to delete timeline post for job:", postErr);
    }

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
