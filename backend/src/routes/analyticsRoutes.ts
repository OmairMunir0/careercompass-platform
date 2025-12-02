import { Router } from "express";
import { getDashboardAnalytics } from "../controllers/analyticsController";
import { authenticated, requireRole } from "../middleware/auth";

const router = Router();

// All routes require authentication and admin role
router.use(authenticated);
router.use(requireRole(["admin"]));

// @route   GET /api/analytics/dashboard
// @desc    Get comprehensive analytics dashboard data
// @access  Private (Admin)
router.get("/dashboard", getDashboardAnalytics);

export default router;

