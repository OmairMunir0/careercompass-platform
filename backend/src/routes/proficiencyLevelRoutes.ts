import { Router } from "express";
import {
  createProficiencyLevel,
  deleteProficiencyLevel,
  getProficiencyLevel,
  getProficiencyLevels,
  updateProficiencyLevel,
} from "../controllers/proficiencyLevelController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/proficiency-levels
// @desc    Create a new proficiency level
// @access  Private
router.post("/", authenticated, createProficiencyLevel);

// @route   GET /api/proficiency-levels
// @desc    Get all proficiency levels
// @access  Private
router.get("/", authenticated, getProficiencyLevels);

// @route   GET /api/proficiency-levels/:proficiencyLevelId
// @desc    Get a proficiency level by ID
// @access  Private
router.get("/:proficiencyLevelId", authenticated, getProficiencyLevel);

// @route   PUT /api/proficiency-levels/:proficiencyLevelId
// @desc    Update a proficiency level by ID
// @access  Private
router.put("/:proficiencyLevelId", authenticated, updateProficiencyLevel);

// @route   DELETE /api/proficiency-levels/:proficiencyLevelId
// @desc    Delete a proficiency level by ID
// @access  Private
router.delete("/:proficiencyLevelId", authenticated, deleteProficiencyLevel);

export default router;
