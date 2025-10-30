import { Router } from "express";
import {
  createSkill,
  deleteSkill,
  getSkill,
  getSkills,
  updateSkill,
} from "../controllers/skillController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/skills
// @desc    Create a new skill
// @access  Private
router.post("/", authenticated, createSkill);

// @route   GET /api/skills
// @desc    Get all skills
// @access  Private
router.get("/", authenticated, getSkills);

// @route   GET /api/skills/:skillId
// @desc    Get a skill by ID
// @access  Private
router.get("/:skillId", authenticated, getSkill);

// @route   PUT /api/skills/:skillId
// @desc    Update a skill
// @access  Private
router.put("/:skillId", authenticated, updateSkill);

// @route   DELETE /api/skills/:skillId
// @desc    Delete a skill
// @access  Private
router.delete("/:skillId", authenticated, deleteSkill);

export default router;
