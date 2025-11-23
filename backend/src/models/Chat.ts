import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  sender: Types.ObjectId;
  content: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChat extends Document {
  recruiter: Types.ObjectId; // Kept for backward compatibility
  candidate: Types.ObjectId; // Kept for backward compatibility
  participants: Types.ObjectId[]; // New field for any two users
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChatSchema = new Schema<IChat>(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Optional for backward compatibility
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: false }, // Optional for backward compatibility
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }], // Array of two users
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

// Index for efficient chat lookups
ChatSchema.index({ participants: 1 });
ChatSchema.index({ recruiter: 1, candidate: 1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);
