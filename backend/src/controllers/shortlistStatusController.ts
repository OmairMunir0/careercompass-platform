import { Request, Response } from "express";
import { IShortlistStatus, ShortlistStatus } from "../models/ShortlistStatus";

/**
 * @desc Create a new shortlist status
 * @route POST /api/shortlist-statuses
 * @access Private
 */
export const createShortlistStatus = async (req: Request, res: Response) => {
  try {
    const status: IShortlistStatus = new ShortlistStatus({ name: req.body.name });
    await status.save();
    res.status(201).json(status);
  } catch (err: any) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Shortlist status already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all shortlist statuses
 * @route GET /api/shortlist-statuses
 * @access Private
 */
export const getShortlistStatuses = async (_req: Request, res: Response) => {
  try {
    const statuses: IShortlistStatus[] = await ShortlistStatus.find();
    res.json(statuses);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a shortlist status by ID
 * @route GET /api/shortlist-statuses/:shortlistStatusId
 * @access Private
 */
export const getShortlistStatus = async (req: Request, res: Response) => {
  try {
    const status: IShortlistStatus | null = await ShortlistStatus.findById(
      req.params.shortlistStatusId
    );
    if (!status) return res.status(404).json({ message: "Shortlist status not found" });
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a shortlist status by ID
 * @route PUT /api/shortlist-statuses/:shortlistStatusId
 * @access Private
 */
export const updateShortlistStatus = async (req: Request, res: Response) => {
  try {
    const status: IShortlistStatus | null = await ShortlistStatus.findByIdAndUpdate(
      req.params.shortlistStatusId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!status) return res.status(404).json({ message: "Shortlist status not found" });
    res.json(status);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a shortlist status by ID
 * @route DELETE /api/shortlist-statuses/:shortlistStatusId
 * @access Private
 */
export const deleteShortlistStatus = async (req: Request, res: Response) => {
  try {
    const status: IShortlistStatus | null = await ShortlistStatus.findByIdAndDelete(
      req.params.shortlistStatusId
    );
    if (!status) return res.status(404).json({ message: "Shortlist status not found" });
    res.json({ message: "Shortlist status deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
