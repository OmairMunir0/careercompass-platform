import mongoose, { Document, Schema, Types } from "mongoose";

export interface IJobApplication extends Document {
  user: Types.ObjectId;
  job: Types.ObjectId;
  coverLetter: string | null;
  resumeUrl: string | null;
  status: Types.ObjectId;
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema = new Schema<IJobApplication>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    job: { type: Schema.Types.ObjectId, ref: "JobPost", required: true },
    coverLetter: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    status: { type: Schema.Types.ObjectId, ref: "JobApplicationStatus", required: true },
    appliedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
);

export const JobApplication =
  mongoose.models.JpbApplication ||
  mongoose.model<IJobApplication>("JobApplication", JobApplicationSchema);
