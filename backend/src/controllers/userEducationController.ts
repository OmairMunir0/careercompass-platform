import { Request, Response } from "express";
import { IUserEducation, UserEducation } from "../models/UserEducation";

/**
 * @desc Create a new education record for the logged-in user
 * @route POST /api/educations
 * @access Private
 */
export const createEducation = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const edu: IUserEducation = new UserEducation({
      user: req.user.id,
      degree: req.body.degree,
      institution: req.body.institution,
      fieldOfStudy: req.body.fieldOfStudy,
      startDate: req.body.startDate,
      endDate: req.body.endDate ?? null,
      description: req.body.description ?? null,
    });

    await edu.save();
    res.status(201).json(edu);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get education records for the logged-in user
 * @route GET /api/educations/me
 * @access Private
 */
export const getMyEducation = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const educations: IUserEducation[] = await UserEducation.find({ user: req.user.id }).sort({
      startDate: -1,
    });

    res.status(200).json(educations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update an education record for the logged-in user
 * @route PUT /api/educations/:educationId
 * @access Private
 */
export const updateEducation = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const edu = await UserEducation.findOneAndUpdate(
      { _id: req.params.educationId, user: req.user.id },
      {
        degree: req.body.degree,
        institution: req.body.institution,
        fieldOfStudy: req.body.fieldOfStudy,
        startDate: req.body.startDate,
        endDate: req.body.endDate ?? null,
        description: req.body.description ?? null,
      },
      { new: true, runValidators: true }
    );

    if (!edu) return res.status(404).json({ message: "Education not found" });

    res.json(edu);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete an education record for the logged-in user
 * @route DELETE /api/educations/:educationId
 * @access Private
 */
export const deleteEducation = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const edu = await UserEducation.findOneAndDelete({
      _id: req.params.educationId,
      user: req.user.id,
    });

    if (!edu) return res.status(404).json({ message: "Education not found" });

    res.json({ message: "Education deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get all education records of any user by userId (public)
 * @route GET /api/educations/user/:userId
 * @access Public
 */
export const getUserEducation = async (req: Request, res: Response) => {
  try {
    const educations = await UserEducation.find({ user: req.params.userId }).sort({
      startDate: -1,
    });
    res.status(200).json(educations);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single education record by ID (public)
 * @route GET /api/educations/:educationId
 * @access Public
 */
export const getEducation = async (req: Request, res: Response) => {
  try {
    const edu = await UserEducation.findById(req.params.educationId);
    if (!edu) return res.status(404).json({ message: "Education not found" });
    res.status(200).json(edu);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
