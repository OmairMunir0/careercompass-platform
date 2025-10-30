import mongoose, { Document, Schema } from "mongoose";

export interface ISkillCategory extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const SkillCategorySchema = new Schema<ISkillCategory>(
  { name: { type: String, required: true, unique: true, trim: true } },
  { timestamps: true }
);

export const SkillCategory =
  mongoose.models.SkillCategory ||
  mongoose.model<ISkillCategory>("SkillCategory", SkillCategorySchema);
