import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRequiredSkill extends Document {
  job: Types.ObjectId;
  skill: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RequiredSkillSchema = new Schema<IRequiredSkill>(
  {
    job: { type: Schema.Types.ObjectId, ref: "JobPost", required: true },
    skill: { type: Schema.Types.ObjectId, ref: "Skill", required: true },
  },
  { timestamps: true }
);

export const RequiredSkill =
  mongoose.models.RequiredSkill ||
  mongoose.model<IRequiredSkill>("RequiredSkill", RequiredSkillSchema);
