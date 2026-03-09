import { Router } from "express";
import rateLimit from "express-rate-limit";
import { chat, getHistory, clearHistory } from "../controllers/agentController";
import { authenticated } from "../middleware/auth";

const router = Router();

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { message: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(authenticated);

router.post("/chat", chatLimiter, chat);
router.get("/history", getHistory);
router.delete("/history", clearHistory);

export default router;
