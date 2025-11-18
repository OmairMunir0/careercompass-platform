import { Router } from "express";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  getVapidPublicKey,
  subscribeToPush,
  unsubscribeFromPush,
} from "../controllers/notificationController";
import { authenticated } from "../middleware/auth";
import { notificationRateLimit } from "../middleware/server";

const router = Router();

// Apply more lenient rate limiting to notification routes
router.use(notificationRateLimit);

router.get("/", authenticated, getNotifications);
router.get("/unread-count", authenticated, getUnreadCount);
router.put("/:notificationId/read", authenticated, markAsRead);
router.put("/read-all", authenticated, markAllAsRead);
router.get("/vapid-public-key", authenticated, getVapidPublicKey);
router.post("/subscribe", authenticated, subscribeToPush);
router.delete("/unsubscribe", authenticated, unsubscribeFromPush);

export default router;

