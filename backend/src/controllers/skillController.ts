import { Request, Response } from "express";
import { ISkill, Skill } from "../models/Skill";

/**
 * @desc Create a new skill
 * @route POST /api/skills
 * @access Private
 */
export const createSkill = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    const skill: ISkill = new Skill({ name, category: category ?? null });
    await skill.save();
    res.status(201).json(skill);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: "Skill already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all skills
 * @route GET /api/skills
 * @access Private
 */
export const getSkills = async (_req: Request, res: Response) => {
  try {
    const skills: ISkill[] = await Skill.find().populate("category");
    res.json(skills);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a skill by ID
 * @route GET /api/skills/:skillId
 * @access Private
 */
export const getSkill = async (req: Request, res: Response) => {
  try {
    const skill: ISkill | null = await Skill.findById(req.params.skillId).populate("category");
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a skill by ID
 * @route PUT /api/skills/:skillId
 * @access Private
 */
export const updateSkill = async (req: Request, res: Response) => {
  try {
    const { name, category } = req.body;
    const skill: ISkill | null = await Skill.findByIdAndUpdate(
      req.params.skillId,
      { name, category: category ?? null },
      { new: true, runValidators: true }
    );
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json(skill);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a skill by ID
 * @route DELETE /api/skills/:skillId
 * @access Private
 */
export const deleteSkill = async (req: Request, res: Response) => {
  try {
    const skill: ISkill | null = await Skill.findByIdAndDelete(req.params.skillId);
    if (!skill) return res.status(404).json({ message: "Skill not found" });
    res.json({ message: "Skill deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
