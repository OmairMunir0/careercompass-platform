import { Request, Response } from "express";
import { ISkillCategory, SkillCategory } from "../models/SkillCategory";

/**
 * @desc Create a new skill category
 * @route POST /api/skill-categories
 * @access Private
 */
export const createSkillCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category: ISkillCategory = new SkillCategory({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: "Category already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all skill categories
 * @route GET /api/skill-categories
 * @access Private
 */
export const getSkillCategories = async (_req: Request, res: Response) => {
  try {
    const categories: ISkillCategory[] = await SkillCategory.find();
    res.json(categories);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a skill category by ID
 * @route GET /api/skill-categories/:skillCategoryId
 * @access Private
 */
export const getSkillCategory = async (req: Request, res: Response) => {
  try {
    const category: ISkillCategory | null = await SkillCategory.findById(
      req.params.skillCategoryId
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a skill category by ID
 * @route PUT /api/skill-categories/:skillCategoryId
 * @access Private
 */
export const updateSkillCategory = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const category: ISkillCategory | null = await SkillCategory.findByIdAndUpdate(
      req.params.skillCategoryId,
      { name },
      { new: true, runValidators: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json(category);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a skill category by ID
 * @route DELETE /api/skill-categories/:skillCategoryId
 * @access Private
 */
export const deleteSkillCategory = async (req: Request, res: Response) => {
  try {
    const category: ISkillCategory | null = await SkillCategory.findByIdAndDelete(
      req.params.skillCategoryId
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.json({ message: "Category deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
