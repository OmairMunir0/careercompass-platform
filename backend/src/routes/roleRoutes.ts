import { Router } from "express";
import {
  createRole,
  deleteRole,
  getRole,
  getRoles,
  updateRole,
} from "../controllers/roleController";
import { authenticated } from "../middleware/auth";

const router = Router();

// @route   POST /api/roles
// @desc    Create a new role
// @access  Private
router.post("/", authenticated, createRole);

// @route   GET /api/roles
// @desc    Get all roles
// @access  Private
router.get("/", authenticated, getRoles);

// @route   GET /api/roles/:roleId
// @desc    Get a role by ID
// @access  Private
router.get("/:roleId", authenticated, getRole);

// @route   PUT /api/roles/:roleId
// @desc    Update a role by ID
// @access  Private
router.put("/:roleId", authenticated, updateRole);

// @route   DELETE /api/roles/:roleId
// @desc    Delete a role by ID
// @access  Private
router.delete("/:roleId", authenticated, deleteRole);

export default router;
