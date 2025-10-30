import { Request, Response } from "express";
import { IJobApplication, JobApplication } from "../models/JobApplication";
import { JobApplicationStatus } from "../models/JobApplicationStatus";

/**
 * @desc Apply to a specific job
 * @route POST /api/job-applications
 * @access Private
 */
export const applyToJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { jobId, coverLetter } = req.body;
    if (!jobId) return res.status(400).json({ message: "Job ID is required" });

    const resumeUrl = req.file ? req.file.path : null; // if using multer

    const existing = await JobApplication.findOne({
      user: req.user.id,
      job: jobId,
    });
    if (existing) return res.status(400).json({ message: "You have already applied to this job" });

    const status = await JobApplicationStatus.findOne({ name: /pending/i });

    const application = new JobApplication({
      user: req.user.id,
      job: jobId,
      coverLetter: coverLetter ?? null,
      resumeUrl,
      status: status?._id,
      appliedAt: new Date(),
    });

    await application.save();
    res.status(201).json(application);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all job applications
 * @route GET /api/job-applications
 * @access Private
 */
export const getJobApplications = async (_req: Request, res: Response) => {
  try {
    const applications: IJobApplication[] = await JobApplication.find()
      .populate("user", "name email")
      .populate("job", "title")
      .populate("status", "name");

    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all job applications for the logged-in user
 * @route GET /api/job-applications/me
 * @access Private
 */
export const getMyJobApplications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const applications: IJobApplication[] = await JobApplication.find({
      user: req.user?.id,
    })
      .populate("job", "title")
      .populate("status", "name");

    res.json(applications);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single job application by ID
 * @route GET /api/job-applications/:applicationId
 * @access Private
 */
export const getJobApplication = async (req: Request, res: Response) => {
  try {
    const application: IJobApplication | null = await JobApplication.findById(
      req.params.applicationId
    )
      .populate("user", "name email")
      .populate("job", "title")
      .populate("status", "name");

    if (!application) return res.status(404).json({ message: "Job application not found" });

    res.json(application);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a job application by ID
 * @route PUT /api/job-applications/:applicationId
 * @access Private
 */
export const updateJobApplication = async (req: Request, res: Response) => {
  try {
    const { coverLetter, resumeUrl, status } = req.body;

    const application: IJobApplication | null = await JobApplication.findByIdAndUpdate(
      req.params.applicationId,
      {
        coverLetter: coverLetter ?? null,
        resumeUrl: resumeUrl ?? null,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!application) return res.status(404).json({ message: "Job application not found" });

    res.json(application);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a job application by ID
 * @route DELETE /api/job-applications/:applicationId
 * @access Private
 */
export const deleteJobApplication = async (req: Request, res: Response) => {
  try {
    const application: IJobApplication | null = await JobApplication.findByIdAndDelete(
      req.params.applicationId
    );

    if (!application) return res.status(404).json({ message: "Job application not found" });

    res.json({ message: "Job application deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a specific application for a logged-in user by job
 * @route GET /api/job-applications/me/:jobId
 * @access Private (Candidate)
 */
export const getMyJobApplicationByJob = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const application = await JobApplication.findOne({
      user: req.user?.id,
      job: req.params.jobId,
    })
      .populate("job")
      .populate("status");

    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json(application);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Withdraw an existing application (soft delete)
 * @route PUT /api/job-applications/:applicationId/withdraw
 * @access Private (Candidate)
 */
export const withdrawMyApplication = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const withdrawnStatus = await JobApplicationStatus.findOne({ name: /withdrawn/i });
    if (!withdrawnStatus)
      return res.status(400).json({ message: "Withdrawn status not configured" });

    const application = await JobApplication.findOneAndUpdate(
      { _id: req.params.applicationId, user: req.user?.id },
      { status: withdrawnStatus._id },
      { new: true }
    ).populate("job status");

    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application withdrawn", data: application });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all applications for a specific job
 * @route GET /api/job-applications/job/:jobId
 * @access Private (Recruiter/Admin)
 */
export const getApplicationsForJob = async (req: Request, res: Response) => {
  try {
    const applications = await JobApplication.find({ job: req.params.jobId })
      .populate("user")
      .populate("status");

    res.status(200).json({ count: applications.length, data: applications });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update job application status (recruiter/admin only)
 * @route PUT /api/job-applications/:applicationId/status
 * @access Private (Recruiter/Admin)
 */
export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { statusId } = req.body;
    if (!statusId) return res.status(400).json({ message: "Status ID is required" });

    const application = await JobApplication.findByIdAndUpdate(
      req.params.applicationId,
      { status: statusId },
      { new: true }
    ).populate("user job status");

    if (!application) return res.status(404).json({ message: "Application not found" });
    res.status(200).json({ message: "Application status updated", data: application });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get applications filtered by status
 * @route GET /api/job-applications/status/:statusId
 * @access Private (Recruiter/Admin)
 */
export const getApplicationsByStatus = async (req: Request, res: Response) => {
  try {
    const applications = await JobApplication.find({ status: req.params.statusId }).populate(
      "user job status"
    );

    res.status(200).json({ count: applications.length, data: applications });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get application stats grouped by status
 * @route GET /api/job-applications/stats
 * @access Private (Admin/Recruiter)
 */
export const getApplicationStats = async (_req: Request, res: Response) => {
  try {
    const stats = await JobApplication.aggregate([
      { $group: { _id: "$status", total: { $sum: 1 } } },
      {
        $lookup: {
          from: "jobapplicationstatuses",
          localField: "_id",
          foreignField: "_id",
          as: "statusInfo",
        },
      },
      { $unwind: "$statusInfo" },
      { $project: { _id: 0, status: "$statusInfo.name", total: 1 } },
    ]);

    res.status(200).json(stats);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get recent job applications (for dashboard)
 * @route GET /api/job-applications/recent
 * @access Private (Admin/Recruiter)
 */
export const getRecentApplications = async (_req: Request, res: Response) => {
  try {
    const applications = await JobApplication.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user job status");

    res.status(200).json({ data: applications });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get top jobs by application count
 * @route GET /api/job-applications/top-jobs
 * @access Private (Admin)
 */
export const getTopJobsByApplications = async (_req: Request, res: Response) => {
  try {
    const topJobs = await JobApplication.aggregate([
      { $group: { _id: "$job", applications: { $sum: 1 } } },
      { $sort: { applications: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "jobposts",
          localField: "_id",
          foreignField: "_id",
          as: "jobInfo",
        },
      },
      { $unwind: "$jobInfo" },
      { $project: { job: "$jobInfo.title", applications: 1 } },
    ]);

    res.status(200).json(topJobs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Bulk delete applications related to a specific job
 * @route DELETE /api/job-applications/job/:jobId
 * @access Private (Admin)
 */
export const bulkDeleteApplications = async (req: Request, res: Response) => {
  try {
    const result = await JobApplication.deleteMany({ job: req.params.jobId });
    res.status(200).json({ message: "Applications deleted", deletedCount: result.deletedCount });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
