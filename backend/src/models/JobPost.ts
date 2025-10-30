import mongoose, { Document, Schema, Types } from "mongoose";

export interface IJobPost extends Document {
  recruiter: Types.ObjectId;
  title: string;
  description: string;
  location: string | null;
  jobType: Types.ObjectId | null;
  workMode: Types.ObjectId | null;
  experienceLevel: Types.ObjectId | null;
  salaryMin: number;
  salaryMax: number;
  isActive: boolean;
  requiredSkills: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const JobPostSchema = new Schema<IJobPost>(
  {
    recruiter: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, default: null },
    jobType: { type: Schema.Types.ObjectId, ref: "JobType", default: null },
    workMode: { type: Schema.Types.ObjectId, ref: "WorkMode", default: null },
    experienceLevel: { type: Schema.Types.ObjectId, ref: "ExperienceLevel", default: null },
    salaryMin: { type: Number, required: true },
    salaryMax: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    requiredSkills: [{ type: Schema.Types.ObjectId, ref: "Skill" }],
  },
  { timestamps: true }
);

export const JobPost = mongoose.models.JobPost || mongoose.model<IJobPost>("JobPost", JobPostSchema);
