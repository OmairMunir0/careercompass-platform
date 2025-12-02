import { Request, Response } from "express";
import { IShortlist, Shortlist } from "../models/Shortlist";

/**
 * @desc Create a new shortlist entry (recruiter shortlists candidate)
 * @route POST /api/shortlists
 * @access Private (Recruiter)
 */
export const createShortlist = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.id;
    const { candidate, job, status } = req.body;

    const existing = await Shortlist.findOne({ recruiter: recruiterId, candidate, job });
    if (existing)
      return res.status(400).json({ message: "Candidate already shortlisted for this job" });

    const shortlist: IShortlist = new Shortlist({ recruiter: recruiterId, candidate, job, status });
    await shortlist.save();
    res.status(201).json(shortlist);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all shortlists created by the recruiter
 * @route GET /api/shortlists/my
 * @access Private (Recruiter)
 */
export const getMyShortlists = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.id;

    const shortlists: IShortlist[] = await Shortlist.find({ recruiter: recruiterId })
      .populate("candidate", "firstName lastName email")
      .populate("job", "title")
      .populate("status", "name");
    res.json(shortlists);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get candidates shortlisted for a specific job
 * @route GET /api/shortlists/job/:jobId
 * @access Private (Recruiter)
 */
export const getShortlistsByJob = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.id;

    const { jobId } = req.params;

    const shortlists: IShortlist[] = await Shortlist.find({ recruiter: recruiterId, job: jobId })
      .populate("candidate", "firstName lastName email")
      .populate("status", "name");

    res.json(shortlists);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update shortlist status
 * @route PUT /api/shortlists/:shortlistId
 * @access Private (Recruiter)
 */
export const updateShortlistStatus = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.id;

    const { shortlistId } = req.params;
    const { status } = req.body;

    const shortlist = await Shortlist.findOneAndUpdate(
      { _id: shortlistId, recruiter: recruiterId },
      { status },
      { new: true }
    )
      .populate("candidate", "firstName lastName email")
      .populate("status", "name");

    if (!shortlist) return res.status(404).json({ message: "Shortlist not found" });
    res.json(shortlist);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a shortlist entry
 * @route DELETE /api/shortlists/:shortlistId
 * @access Private (Recruiter)
 */
export const deleteShortlist = async (req: Request, res: Response) => {
  try {
    const recruiterId = req.user?.id;

    const { shortlistId } = req.params;

    const deleted = await Shortlist.findOneAndDelete({ _id: shortlistId, recruiter: recruiterId });
    if (!deleted) return res.status(404).json({ message: "Shortlist not found" });

    res.json({ message: "Shortlist deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
