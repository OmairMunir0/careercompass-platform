import mongoose, { Document, Schema } from "mongoose";

export interface IJobType extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobTypeSchema = new Schema<IJobType>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export const JobType =
  mongoose.models.JobType || mongoose.model<IJobType>("JobType", JobTypeSchema);
