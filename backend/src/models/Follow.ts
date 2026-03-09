import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollow extends Document {
  follower: Types.ObjectId;
  following: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FollowSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate follows and optimize queries
FollowSchema.index({ follower: 1, following: 1 }, { unique: true });
FollowSchema.index({ following: 1 }); // For getting followers list
FollowSchema.index({ follower: 1 }); // For getting following list

export const Follow = mongoose.models.Follow || mongoose.model<IFollow>("Follow", FollowSchema);
