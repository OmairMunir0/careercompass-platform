import { Router } from "express";
import {
  changeEmail,
  changePassword,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController";
import { authenticated } from "../middleware/auth";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticated, logoutUser);
router.post("/change-email", authenticated, changeEmail);
router.post("/change-password", authenticated, changePassword);

export default router;
