import { Router } from "express";
import {
  createExperience,
  deleteExperience,
  getExperience,
  getMyExperiences,
  getUserExperiences,
  updateExperience,
} from "../controllers/userExperienceController";
import { authenticated } from "../middleware/auth";

const router = Router();

router.use(authenticated);
router.get("/me", getMyExperiences);
router.post("/", createExperience);
router.put("/:experienceId", updateExperience);
router.delete("/:experienceId", deleteExperience);

router.get("/user/:userId", getUserExperiences);
router.get("/:experienceId", getExperience);

export default router;
