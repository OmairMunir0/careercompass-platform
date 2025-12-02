import { Router } from "express";
import {
  createShortlist,
  deleteShortlist,
  getMyShortlists,
  getShortlistsByJob,
  updateShortlistStatus,
} from "../controllers/shortlistController";
import { authenticated, requireRole } from "../middleware/auth";

const router = Router();

// All routes require recruiter authentication
router.post("/", authenticated, requireRole(["recruiter"]), createShortlist);
router.get("/my", authenticated, requireRole(["recruiter"]), getMyShortlists);
router.get("/job/:jobId", authenticated, requireRole(["recruiter"]), getShortlistsByJob);
router.put("/:shortlistId", authenticated, requireRole(["recruiter"]), updateShortlistStatus);
router.delete("/:shortlistId", authenticated, requireRole(["recruiter"]), deleteShortlist);

export default router;
