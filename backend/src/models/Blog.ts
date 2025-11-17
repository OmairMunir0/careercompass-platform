import mongoose, { Document, Schema, Types } from "mongoose";

export interface IComment extends Document {
  user: Types.ObjectId;
  text: string;
  name: string;
  avatar: string;
  date: Date;
}

export interface IBlog extends Document {
  title: string;
  content: string; // HTML from React Quill
  author: Types.ObjectId;
  authorName: string;
  authorAvatar: string | null;
  image: string | null; // Cloudinary URL or local path
  tags: string[];
  likes: Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    name: { type: String, required: true },
    avatar: { type: String },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    authorAvatar: { type: String, default: null },
    image: { type: String, default: null },
    tags: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
  },
  { timestamps: true }
);

// Index for search and pagination
BlogSchema.index({ title: "text", content: "text", tags: "text" });
BlogSchema.index({ createdAt: -1 });

export const Blog = mongoose.models.Blog || mongoose.model<IBlog>("Blog", BlogSchema);

