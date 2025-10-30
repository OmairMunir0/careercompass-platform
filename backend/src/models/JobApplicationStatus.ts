import mongoose, { Document, Schema } from "mongoose";

export interface IJobApplicationStatus extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationStatusSchema = new Schema<IJobApplicationStatus>(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

export const JobApplicationStatus =
  mongoose.models.JobApplicationStatus ||
  mongoose.model<IJobApplicationStatus>("JobApplicationStatus", JobApplicationStatusSchema);
