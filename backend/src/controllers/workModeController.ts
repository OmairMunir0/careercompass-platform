import { Request, Response } from "express";
import { IWorkMode, WorkMode } from "../models/WorkMode";

/**
 * @desc Create a new work mode
 * @route POST /api/work-modes
 * @access Private
 */
export const createWorkMode = async (req: Request, res: Response) => {
  try {
    const workMode: IWorkMode = new WorkMode({ name: req.body.name });
    await workMode.save();
    res.status(201).json(workMode);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: "Work mode already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all work modes
 * @route GET /api/work-modes
 * @access Private
 */
export const getWorkModes = async (_req: Request, res: Response) => {
  try {
    const workModes: IWorkMode[] = await WorkMode.find();
    res.json(workModes);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a work mode by ID
 * @route GET /api/work-modes/:workModeId
 * @access Private
 */
export const getWorkMode = async (req: Request, res: Response) => {
  try {
    const workMode: IWorkMode | null = await WorkMode.findById(req.params.workModeId);
    if (!workMode) return res.status(404).json({ message: "Work mode not found" });
    res.json(workMode);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a work mode by ID
 * @route PUT /api/work-modes/:workModeId
 * @access Private
 */
export const updateWorkMode = async (req: Request, res: Response) => {
  try {
    const workMode: IWorkMode | null = await WorkMode.findByIdAndUpdate(
      req.params.workModeId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!workMode) return res.status(404).json({ message: "Work mode not found" });
    res.json(workMode);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a work mode by ID
 * @route DELETE /api/work-modes/:workModeId
 * @access Private
 */
export const deleteWorkMode = async (req: Request, res: Response) => {
  try {
    const workMode: IWorkMode | null = await WorkMode.findByIdAndDelete(req.params.workModeId);
    if (!workMode) return res.status(404).json({ message: "Work mode not found" });
    res.json({ message: "Work mode deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
