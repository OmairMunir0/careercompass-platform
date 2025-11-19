import mongoose, { Document, Schema, Types } from "mongoose";

export type NotificationType = "post_like" | "post_comment" | "chat_message" | "job_post" | "job_application";

export interface INotification extends Document {
  user: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: Types.ObjectId; // Post ID, Chat ID, or JobPost ID
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["post_like", "post_comment", "chat_message", "job_post", "job_application"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

// Index for efficient queries
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification =
  mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

