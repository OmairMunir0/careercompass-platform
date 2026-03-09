import { Router } from "express";
import {
  createSkillCategory,
  deleteSkillCategory,
  getSkillCategories,
  getSkillCategory,
  updateSkillCategory,
} from "../controllers/skillCategoryController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/skill-categories
// @desc    Create a new skill category
// @access  Private
router.post("/", authenticated, createSkillCategory);

// @route   GET /api/skill-categories
// @desc    Get all skill categories
// @access  Private
router.get("/", authenticated, getSkillCategories);

// @route   GET /api/skill-categories/:skillCategoryId
// @desc    Get a skill category by ID
// @access  Private
router.get("/:skillCategoryId", authenticated, getSkillCategory);

// @route   PUT /api/skill-categories/:skillCategoryId
// @desc    Update a skill category by ID
// @access  Private
router.put("/:skillCategoryId", authenticated, updateSkillCategory);

// @route   DELETE /api/skill-categories/:skillCategoryId
// @desc    Delete a skill category by ID
// @access  Private
router.delete("/:skillCategoryId", authenticated, deleteSkillCategory);

export default router;
