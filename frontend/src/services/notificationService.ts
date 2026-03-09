import axiosInstance from "@/lib/axiosInstance";

export interface Notification {
  _id: string;
  type: "post_like" | "post_comment" | "chat_message" | "job_post";
  title: string;
  message: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class NotificationService {
  async getNotifications(): Promise<Notification[]> {
    const response = await axiosInstance.get("/notifications");
    return response.data.notifications || [];
  }

  async getUnreadCount(): Promise<number> {
    const response = await axiosInstance.get("/notifications/unread-count");
    return response.data.count || 0;
  }

  async markAsRead(notificationId: string): Promise<void> {
    await axiosInstance.put(`/notifications/${notificationId}/read`);
  }

  async markAllAsRead(): Promise<void> {
    await axiosInstance.put("/notifications/read-all");
  }

  async getVapidPublicKey(): Promise<string> {
    const response = await axiosInstance.get("/notifications/vapid-public-key");
    return response.data.publicKey;
  }

  async subscribeToPush(subscription: PushSubscription): Promise<void> {
    await axiosInstance.post("/notifications/subscribe", { subscription });
  }

  async unsubscribeFromPush(): Promise<void> {
    await axiosInstance.delete("/notifications/unsubscribe");
  }
}

export const notificationService = new NotificationService();

