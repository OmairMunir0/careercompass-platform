import { Router } from "express";
import {
  createWorkMode,
  deleteWorkMode,
  getWorkMode,
  getWorkModes,
  updateWorkMode,
} from "../controllers/workModeController";

const router = Router();

router.post("/", createWorkMode);
router.get("/", getWorkModes);
router.get("/:workModeId", getWorkMode);
router.put("/:workModeId", updateWorkMode);
router.delete("/:workModeId", deleteWorkMode);

export default router;
