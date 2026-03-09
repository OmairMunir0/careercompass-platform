import { Router } from "express";
import { authenticated, requireRole } from "../middleware/auth";
import * as adminController from "../controllers/adminController";

const router = Router();

// Protect all admin routes
router.use(authenticated);
router.use(requireRole(["admin"]));

// Dashboard
router.get("/stats", adminController.getStats);

// Users
router.get("/users", adminController.getUsers);
router.patch("/users/:id/ban", adminController.toggleBan);

// Interviews (Questions for now)
router.get("/interviews", adminController.getInterviewQuestions);

// Skills
router.get("/skills", adminController.getSkills);
router.post("/skills", adminController.createSkill);
router.delete("/skills/:id", adminController.deleteSkill);

export default router;
