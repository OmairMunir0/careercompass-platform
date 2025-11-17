import mongoose, { Schema, Types } from "mongoose";

export interface IReply extends Document {
  user: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  user: Types.ObjectId;
  content: string;
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IPost extends Document {
  user: Types.ObjectId;
  content: string;
  imageUrl: string | null;
  likes: number;
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySubSchema = new Schema<IReply>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

const CommentSubSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    replies: { type: [ReplySubSchema], default: [] },
  },
  { timestamps: true }
);

const PostSchema = new Schema<IPost>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    imageUrl: { type: String, default: null },
    likes: { type: Number, default: 0 },
    comments: { type: [CommentSubSchema], default: [] },
  },
  { timestamps: true }
);

export const Post = mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);
