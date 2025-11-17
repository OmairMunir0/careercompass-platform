import { Router } from "express";
import {
  addProfileImage,
  deleteUser,
  getCandidates,
  getMe,
  getUser,
  getUserStats,
  getUsers,
  getUsersByRole,
  removeProfileImage,
  updateMe,
  updateUser,
} from "../controllers/userController";
import { authenticated } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticated);

router.get("/me", getMe);
router.get("/me/stats", getUserStats);
router.put("/me", updateMe);

router.post("/me/profile-image", upload.single("profileImage"), addProfileImage);
router.delete("/me/profile-image", removeProfileImage);

// Specific first
router.get("/candidates", getCandidates);
router.get("/role/:role", getUsersByRole);

// Dynamic last
router.get("/", getUsers);
router.get("/:userId", getUser);
router.put("/:userId", updateUser);
router.delete("/:userId", deleteUser);

export default router;
