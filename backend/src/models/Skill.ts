import mongoose, { Document, Schema, Types } from "mongoose";

export interface ISkill extends Document {
  name: string;
  category: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const SkillSchema = new Schema<ISkill>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "SkillCategory", default: null },
  },
  { timestamps: true }
);

export const Skill = mongoose.models.Skill || mongoose.model<ISkill>("Skill", SkillSchema);
