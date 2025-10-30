import { Request, Response } from "express";
import { IUserCertification, UserCertification } from "../models/UserCertification";

/**
 * @desc Create a new certification for the logged-in user
 * @route POST /api/user-certifications
 * @access Private
 */
export const createCertification = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const cert: IUserCertification = new UserCertification({
      user: req.user.id,
      name: req.body.name,
      issuingOrganization: req.body.issuingOrganization,
      issueDate: req.body.issueDate,
      expiryDate: req.body.expiryDate ?? null,
      credentialUrl: req.body.credentialUrl ?? null,
      imageUrl: req.body.imageUrl ?? null,
    });

    await cert.save();
    res.status(201).json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get certifications for the logged-in user
 * @route GET /api/user-certifications/me
 * @access Private
 */
export const getMyCertifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const certs: IUserCertification[] = await UserCertification.find({ user: req.user.id }).sort({
      issueDate: -1,
    });

    res.status(200).json(certs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get a single certification by ID (public)
 * @route GET /api/user-certifications/:certificationId
 * @access Public
 */
export const getCertification = async (req: Request, res: Response) => {
  try {
    const cert = await UserCertification.findById(req.params.certificationId);
    if (!cert) return res.status(404).json({ message: "Certification not found" });
    res.status(200).json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Update a certification owned by the logged-in user
 * @route PUT /api/user-certifications/:certificationId
 * @access Private
 */
export const updateCertification = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const cert = await UserCertification.findOneAndUpdate(
      { _id: req.params.certificationId, user: req.user.id },
      {
        name: req.body.name,
        issuingOrganization: req.body.issuingOrganization,
        issueDate: req.body.issueDate,
        expiryDate: req.body.expiryDate ?? null,
        credentialUrl: req.body.credentialUrl ?? null,
        imageUrl: req.body.imageUrl ?? null,
      },
      { new: true, runValidators: true }
    );

    if (!cert) return res.status(404).json({ message: "Certification not found" });
    res.json(cert);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Delete a certification owned by the logged-in user
 * @route DELETE /api/user-certifications/:certificationId
 * @access Private
 */
export const deleteCertification = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const cert = await UserCertification.findOneAndDelete({
      _id: req.params.certificationId,
      user: req.user.id,
    });

    if (!cert) return res.status(404).json({ message: "Certification not found" });
    res.json({ message: "Certification deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get certifications of any user by userId (public)
 * @route GET /api/user-certifications/user/:userId
 * @access Public
 */
export const getUserCertifications = async (req: Request, res: Response) => {
  try {
    const certs = await UserCertification.find({ user: req.params.userId }).sort({ issueDate: -1 });
    res.status(200).json(certs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
