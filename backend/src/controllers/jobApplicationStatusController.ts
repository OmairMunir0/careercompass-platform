import { Request, Response } from "express";
import { IJobApplicationStatus, JobApplicationStatus } from "../models/JobApplicationStatus";

/**
 * @desc Create a new job application status
 * @route POST /api/job-application-statuses
 * @access Private
 */
export const createJobApplicationStatus = async (req: Request, res: Response) => {
  try {
    const status: IJobApplicationStatus = new JobApplicationStatus({ name: req.body.name });
    await status.save();
    res.status(201).json(status);
  } catch (err: any) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Job application status already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all job application statuses
 * @route GET /api/job-application-statuses
 * @access Private
 */
export const getJobApplicationStatuses = async (_req: Request, res: Response) => {
  try {
    const statuses: IJobApplicationStatus[] = await JobApplicationStatus.find();
    res.json(statuses);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a job application status by ID
 * @route GET /api/job-application-statuses/:jobApplicationStatusId
 * @access Private
 */
export const getJobApplicationStatus = async (req: Request, res: Response) => {
  try {
    const status: IJobApplicationStatus | null = await JobApplicationStatus.findById(
      req.params.jobApplicationStatusId
    );
    if (!status) return res.status(404).json({ message: "Job application status not found" });
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a job application status by ID
 * @route PUT /api/job-application-statuses/:jobApplicationStatusId
 * @access Private
 */
export const updateJobApplicationStatus = async (req: Request, res: Response) => {
  try {
    const status: IJobApplicationStatus | null = await JobApplicationStatus.findByIdAndUpdate(
      req.params.jobApplicationStatusId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!status) return res.status(404).json({ message: "Job application status not found" });
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a job application status by ID
 * @route DELETE /api/job-application-statuses/:jobApplicationStatusId
 * @access Private
 */
export const deleteJobApplicationStatus = async (req: Request, res: Response) => {
  try {
    const status: IJobApplicationStatus | null = await JobApplicationStatus.findByIdAndDelete(
      req.params.jobApplicationStatusId
    );
    if (!status) return res.status(404).json({ message: "Job application status not found" });
    res.json({ message: "Job application status deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
