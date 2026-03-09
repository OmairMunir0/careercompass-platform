import mongoose, { Document, Schema, Types } from "mongoose";

export interface IShortlist extends Document {
  recruiter: Types.ObjectId;
  candidate: Types.ObjectId;
  job: Types.ObjectId;
  status: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ShortlistStatus = mongoose.model(
  "ShortlistStatus",
  new Schema(
    { name: { type: String, required: true, unique: true, trim: true } },
    { timestamps: true }
  )
);

const ShortlistSchema = new Schema<IShortlist>(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "JobPost", required: true },
    status: { type: Schema.Types.ObjectId, ref: "ShortlistStatus", required: true },
  },
  { timestamps: true }
);

export const Shortlist =
  mongoose.models.Shortlist || mongoose.model<IShortlist>("Shortlist", ShortlistSchema);
