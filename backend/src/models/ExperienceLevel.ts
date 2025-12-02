import mongoose, { Document, Schema } from "mongoose";

export interface IExperienceLevel extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExperienceLevelSchema = new Schema<IExperienceLevel>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export const ExperienceLevel =
  mongoose.models.ExperienceLevel ||
  mongoose.model<IExperienceLevel>("ExperienceLevel", ExperienceLevelSchema);
