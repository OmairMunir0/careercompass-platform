import { Router } from "express";
import {
  createEducation,
  deleteEducation,
  getEducation,
  getMyEducation,
  getUserEducation,
  updateEducation,
} from "../controllers/userEducationController";
import { authenticated } from "../middleware/auth";

const router = Router();

// Private routes for the logged-in user
router.post("/", authenticated, createEducation);
router.get("/me", authenticated, getMyEducation);
router.put("/:educationId", authenticated, updateEducation);
router.delete("/:educationId", authenticated, deleteEducation);

// Public routes
router.get("/user/:userId", getUserEducation);
router.get("/:educationId", getEducation);

export default router;
