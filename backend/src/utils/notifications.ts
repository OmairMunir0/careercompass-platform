import { Types } from "mongoose";
import { Notification, NotificationType } from "../models/Notification";
import { User } from "../models/User";
import { isSubscriptionActive } from "./subscription";
import webpush from "web-push";

/**
 * Create a notification for a user (only if they are Premium)
 */
export async function createNotification(
  userId: Types.ObjectId | string,
  type: NotificationType,
  title: string,
  message: string,
  relatedId?: Types.ObjectId | string
): Promise<void> {
  try {
    // Check if user is Premium
    const user = await User.findById(userId);
    if (!user || !isSubscriptionActive(user)) {
      // Only Premium users receive notifications
      return;
    }

    // Create notification
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      relatedId: relatedId ? new Types.ObjectId(relatedId) : undefined,
      isRead: false,
    });

    // Send browser push notification if subscription exists
    if (user.pushSubscription) {
      try {
        const subscription = JSON.parse(user.pushSubscription);
        const payload = JSON.stringify({
          title,
          body: message,
          icon: "/icon-192x192.png",
          badge: "/icon-192x192.png",
          data: {
            notificationId: notification._id.toString(),
            type,
            relatedId: relatedId?.toString(),
          },
        });

        await webpush.sendNotification(subscription, payload);
      } catch (pushError) {
        console.error("Failed to send push notification:", pushError);
        // Don't fail the notification creation if push fails
      }
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Get VAPID keys from environment or generate them
 */
export function getVapidKeys() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("VAPID keys not set. Browser push notifications will not work.");
    return { publicKey: null, privateKey: null };
  }

  return { publicKey, privateKey };
}

/**
 * Initialize web-push with VAPID keys
 */
export function initializeWebPush() {
  const { publicKey, privateKey } = getVapidKeys();
  if (publicKey && privateKey) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@careercompass.com",
      publicKey,
      privateKey
    );
    console.log("Web Push initialized with VAPID keys");
  } else {
    console.warn("Web Push not initialized - VAPID keys missing");
  }
}

