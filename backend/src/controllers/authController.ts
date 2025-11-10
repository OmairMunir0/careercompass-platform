import bcrypt from "bcryptjs";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "../models/Role";
import { IUser, User } from "../models/User";

export type RegisterRequestBodyDto = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  companyName?: string;
  companyWebsite?: string;
  position?: string;
};

export type RegisterResponseDto = { token: string; user: Partial<IUser>; role: string };
export type LoginRequestBodyDto = { email: string; password: string };
export type LoginResponseDto = { token: string; user: Partial<IUser>; role: string };

export type ChangeEmailRequestBodyDto = { newEmail: string };
export type ChangeEmailResponseDto = { user: Partial<IUser> };
export type ChangePasswordRequestBodyDto = { oldPassword: string; newPassword: string };
export type ChangePasswordResponseDto = { user: Partial<IUser> };

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      role,
      companyName,
      companyWebsite,
      position,
    }: RegisterRequestBodyDto = req.body;

    if (!email || !password || !firstName || !lastName || !role)
      return res.status(400).json({ message: "Missing required fields" });

    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const roleRecord = await Role.findOne({ name: role.toLowerCase() });
    if (!roleRecord) return res.status(400).json({ message: `Invalid role: ${role}` });

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      roleId: roleRecord._id,
      username: `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(
        Math.random() * 10000
      )}`,
      publicEmail: normalizedEmail,
      companyName: companyName ?? null,
      companyWebsite: companyWebsite ?? null,
      position: position ?? null,
    });

    await user.save();

    const tokenPayload = { userId: user._id, email: user.email, role: roleRecord.name };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(201).json({
      message: "User registered successfully",
      data: { token, user: { ...user.toObject(), passwordHash: undefined }, role: roleRecord.name },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc Login user
 * @route POST /api/auth/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginRequestBodyDto = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Email is not registered" });

    const roleRecord = await Role.findById(user.roleId);
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid email or password" });

    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: roleRecord.name,
    };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      data: {
        token,
        user: { ...user.toObject(), passwordHash: undefined },
        role: roleRecord?.name ?? "unknown",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc Logout user
 * @route POST /api/auth/logout
 * @access Private
 */
export const logoutUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || "anonymous";
    console.info(`User ${userId} logged out at ${new Date().toISOString()}`);
    res
      .status(200)
      .json({ message: "Logout acknowledged — token invalidation is client-side only" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Failed to record logout" });
  }
};

/**
 * @desc Change user email
 * @route POST /api/auth/change-email
 * @access Private
 */
export const changeEmail = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { newEmail }: ChangeEmailRequestBodyDto = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!newEmail) return res.status(400).json({ message: "New email is required" });

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) return res.status(400).json({ message: "Email already in use" });

    const user = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });
    res.status(200).json({
      message: "Email updated successfully",
      data: { user: user ? { ...user.toObject(), passwordHash: undefined } : null },
    });
  } catch (error) {
    console.error("Change email error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * @desc Change user password
 * @route POST /api/auth/change-password
 * @access Private
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword }: ChangePasswordRequestBodyDto = req.body;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });
    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Old and new password are required" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidOld = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isValidOld) return res.status(401).json({ message: "Old password is incorrect" });

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
      data: { user: { ...user.toObject(), passwordHash: undefined } },
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
