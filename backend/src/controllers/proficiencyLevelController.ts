import { Request, Response } from "express";
import { IProficiencyLevel, ProficiencyLevel } from "../models/ProficiencyLevel";

/**
 * @desc Create a new proficiency level
 * @route POST /api/proficiency-levels
 * @access Private
 */
export const createProficiencyLevel = async (req: Request, res: Response) => {
  try {
    const level: IProficiencyLevel = new ProficiencyLevel({ name: req.body.name });
    await level.save();
    res.status(201).json(level);
  } catch (err: any) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Proficiency level already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all proficiency levels
 * @route GET /api/proficiency-levels
 * @access Private
 */
export const getProficiencyLevels = async (_req: Request, res: Response) => {
  try {
    const levels: IProficiencyLevel[] = await ProficiencyLevel.find();
    res.json(levels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a proficiency level by ID
 * @route GET /api/proficiency-levels/:proficiencyLevelId
 * @access Private
 */
export const getProficiencyLevel = async (req: Request, res: Response) => {
  try {
    const level: IProficiencyLevel | null = await ProficiencyLevel.findById(
      req.params.proficiencyLevelId
    );
    if (!level) return res.status(404).json({ message: "Proficiency level not found" });
    res.json(level);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a proficiency level by ID
 * @route PUT /api/proficiency-levels/:proficiencyLevelId
 * @access Private
 */
export const updateProficiencyLevel = async (req: Request, res: Response) => {
  try {
    const level: IProficiencyLevel | null = await ProficiencyLevel.findByIdAndUpdate(
      req.params.proficiencyLevelId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!level) return res.status(404).json({ message: "Proficiency level not found" });
    res.json(level);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a proficiency level by ID
 * @route DELETE /api/proficiency-levels/:proficiencyLevelId
 * @access Private
 */
export const deleteProficiencyLevel = async (req: Request, res: Response) => {
  try {
    const level: IProficiencyLevel | null = await ProficiencyLevel.findByIdAndDelete(
      req.params.proficiencyLevelId
    );
    if (!level) return res.status(404).json({ message: "Proficiency level not found" });
    res.json({ message: "Proficiency level deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
