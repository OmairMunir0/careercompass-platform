import { Request, Response } from "express";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { isSubscriptionActive } from "../utils/subscription";
import { initializeWebPush, getVapidKeys } from "../utils/notifications";
import webpush from "web-push";

/**
 * @desc Get all notifications for the current user
 * @route GET /api/notifications
 * @access Private (Premium only)
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user || !isSubscriptionActive(user)) {
      return res.status(403).json({ message: "Notifications are only available for Premium users" });
    }

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ notifications });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get unread notification count
 * @route GET /api/notifications/unread-count
 * @access Private (Premium only)
 */
export const getUnreadCount = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user || !isSubscriptionActive(user)) {
      return res.status(200).json({ count: 0 });
    }

    const count = await Notification.countDocuments({
      user: req.user.id,
      isRead: false,
    });

    res.status(200).json({ count });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Mark notification as read
 * @route PUT /api/notifications/:notificationId/read
 * @access Private (Premium only)
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification marked as read", notification });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private (Premium only)
 */
export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ message: "All notifications marked as read" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Get VAPID public key for push subscription
 * @route GET /api/notifications/vapid-public-key
 * @access Private
 */
export const getVapidPublicKey = async (_req: Request, res: Response) => {
  try {
    const { publicKey } = getVapidKeys();
    if (!publicKey) {
      return res.status(503).json({ message: "Push notifications not configured" });
    }
    res.status(200).json({ publicKey });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Subscribe to push notifications
 * @route POST /api/notifications/subscribe
 * @access Private (Premium only)
 */
export const subscribeToPush = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user || !isSubscriptionActive(user)) {
      return res.status(403).json({ message: "Push notifications are only available for Premium users" });
    }

    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ message: "Subscription object is required" });
    }

    // Store subscription in user document
    user.pushSubscription = JSON.stringify(subscription);
    await user.save();

    res.status(200).json({ message: "Push subscription saved" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * @desc Unsubscribe from push notifications
 * @route DELETE /api/notifications/unsubscribe
 * @access Private
 */
export const unsubscribeFromPush = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.pushSubscription = null;
    await user.save();

    res.status(200).json({ message: "Push subscription removed" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

