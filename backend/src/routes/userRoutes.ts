import { Router } from "express";
import {
  addProfileImage,
  addResume,
  deleteUser,
  downloadResume,
  getCandidates,
  getMe,
  getUser,
  getUserStats,
  getUsers,
  getUsersByRole,
  removeProfileImage,
  removeResume,
  updateMe,
  updateUser,
} from "../controllers/userController";
import { authenticated } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

// Public route - Resume download (must be before authenticated routes)
router.get("/:userId/resume", downloadResume);

// Authenticated routes
router.use(authenticated);

router.get("/me", getMe);
router.get("/me/stats", getUserStats);
router.put("/me", updateMe);

router.post("/me/profile-image", upload.single("profileImage"), addProfileImage);
router.delete("/me/profile-image", removeProfileImage);
router.post("/me/resume", upload.single("profileResume"), addResume);
router.delete("/me/resume", removeResume);

// Specific first
router.get("/candidates", getCandidates);
router.get("/role/:role", getUsersByRole);

// Dynamic last
router.get("/", getUsers);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;
