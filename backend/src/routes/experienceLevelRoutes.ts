import { Router } from "express";
import {
  bulkDeleteExperienceLevels,
  createExperienceLevel,
  deleteExperienceLevel,
  getExperienceLevel,
  getExperienceLevels,
  updateExperienceLevel,
} from "../controllers/experienceLevelController";
import { authenticated } from "../middleware/auth";

const router = Router();

router.get("/", getExperienceLevels);
router.get("/:id", getExperienceLevel);

router.use(authenticated);
router.post("/", createExperienceLevel);
router.put("/:id", updateExperienceLevel);
router.delete("/:id", deleteExperienceLevel);
router.delete("/", bulkDeleteExperienceLevels);

export default router;
