import { Request, Response } from "express";
import { IExperienceLevel, ExperienceLevel } from "../models/ExperienceLevel";

/**
 * @desc Create a new experience level
 * @route POST /api/experience-levels
 * @access Private (Admin)
 */
export const createExperienceLevel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await ExperienceLevel.findOne({ name: new RegExp(`^${name}$`, "i") });
    if (existing) return res.status(400).json({ message: "Experience level already exists" });

    const level: IExperienceLevel = new ExperienceLevel({ name: name.trim() });
    await level.save();

    res.status(201).json(level);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all experience levels
 * @route GET /api/experience-levels
 * @access Public
 */
export const getExperienceLevels = async (_req: Request, res: Response) => {
  try {
    const levels = await ExperienceLevel.find().sort({ createdAt: -1 });
    res.status(200).json(levels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single experience level by ID
 * @route GET /api/experience-levels/:id
 * @access Public
 */
export const getExperienceLevel = async (req: Request, res: Response) => {
  try {
    const level = await ExperienceLevel.findById(req.params.id);
    if (!level) return res.status(404).json({ message: "Experience level not found" });

    res.status(200).json(level);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update an experience level
 * @route PUT /api/experience-levels/:id
 * @access Private (Admin)
 */
export const updateExperienceLevel = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const existing = await ExperienceLevel.findOne({
      _id: { $ne: req.params.id },
      name: new RegExp(`^${name}$`, "i"),
    });
    if (existing) return res.status(400).json({ message: "Experience level already exists" });

    const level = await ExperienceLevel.findByIdAndUpdate(
      req.params.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!level) return res.status(404).json({ message: "Experience level not found" });

    res.status(200).json(level);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete an experience level
 * @route DELETE /api/experience-levels/:id
 * @access Private (Admin)
 */
export const deleteExperienceLevel = async (req: Request, res: Response) => {
  try {
    const deleted = await ExperienceLevel.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Experience level not found" });

    res.status(200).json({ message: "Experience level deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Bulk delete all experience levels (admin maintenance)
 * @route DELETE /api/experience-levels
 * @access Private (Admin)
 */
export const bulkDeleteExperienceLevels = async (_req: Request, res: Response) => {
  try {
    const result = await ExperienceLevel.deleteMany({});
    res.status(200).json({
      message: "All experience levels deleted",
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
