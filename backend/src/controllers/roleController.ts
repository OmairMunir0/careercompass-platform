import { Request, Response } from "express";
import { IRole, Role } from "../models/Role";

/**
 * @desc Create a new role
 * @route POST /api/roles
 * @access Private
 */
export const createRole = async (req: Request, res: Response) => {
  try {
    const role: IRole = new Role({ name: req.body.name });
    await role.save();
    res.status(201).json(role);
  } catch (err: any) {
    if (err.code === 11000) return res.status(400).json({ message: "Role already exists" });
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all roles
 * @route GET /api/roles
 * @access Private
 */
export const getRoles = async (_req: Request, res: Response) => {
  try {
    const roles: IRole[] = await Role.find();
    res.json(roles);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a role by ID
 * @route GET /api/roles/:roleId
 * @access Private
 */
export const getRole = async (req: Request, res: Response) => {
  try {
    const role: IRole | null = await Role.findById(req.params.roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a role by ID
 * @route PUT /api/roles/:roleId
 * @access Private
 */
export const updateRole = async (req: Request, res: Response) => {
  try {
    const role: IRole | null = await Role.findByIdAndUpdate(
      req.params.roleId,
      { name: req.body.name },
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a role by ID
 * @route DELETE /api/roles/:roleId
 * @access Private
 */
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const role: IRole | null = await Role.findByIdAndDelete(req.params.roleId);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json({ message: "Role deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
