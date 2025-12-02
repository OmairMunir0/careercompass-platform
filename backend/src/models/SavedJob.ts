import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISavedJob extends Document {
  user: Types.ObjectId;
  job: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema = new Schema<ISavedJob>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "JobPost", required: true },
  },
  { timestamps: true }
);

export const SavedJob =
  mongoose.models.SavedJob || mongoose.model<ISavedJob>("SavedJob", SavedJobSchema);
